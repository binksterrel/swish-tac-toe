import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabaseAdmin } from '@/lib/supabase'
import { BattleState, GridCell } from '@/lib/battle-types'
import { generateGrid } from '@/lib/nba-data'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, playerRole } = body

        if (!code || !playerRole) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        // 1. Fetch Battle
        const { data: battle, error: fetchError } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('code', code)
            .single()

        if (fetchError || !battle) {
            return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
        }

        const currentSkipVotes = battle.skip_votes || { host: false, guest: false }
        
        // 2. Toggle Vote
        // If already true, maybe they want to cancel? Let's assume toggle or just set true.
        // Usually "Vote to Skip" is distinct. Let's make it idempotent "Vote YES".
        if (currentSkipVotes[playerRole]) {
             return NextResponse.json({ success: true, message: 'Already voted' })
        }

        const newSkipVotes = { ...currentSkipVotes, [playerRole]: true }

        // 3. Check if Consensus reached
        const skipConfirmed = newSkipVotes.host && newSkipVotes.guest

        let updateData: any = { skip_votes: newSkipVotes }
        let newStateDetails: Partial<BattleState> = {}

        if (skipConfirmed) {
            // GENERATE NEW GRID (Skip current)
            const difficulty = 'medium' // We assume medium, or we could store difficulty in DB if we added it? 
            // We didn't add difficulty column to DB in previous steps, so we might need to default or infer.
            // But implementation plan didn't specify adding difficulty column. We can default to medium or reuse criteria logic if we had it.
            // Actually, we stored 'criteria' in DB, maybe we can infer? Or just use 'medium' for now as safe default.
            
            const { rows, cols } = generateGrid('medium')
            
            const newGrid: GridCell[][] = Array(3).fill(null).map(() => 
                Array(3).fill(null).map(() => ({ player: null, status: 'empty' }))
            )

            updateData = {
                skip_votes: { host: false, guest: false }, // Reset votes
                grid: newGrid,
                criteria: { rows, cols },
                turn_expiry: Date.now() + 60000,
                winner: null, // Ensure no winner is stuck
                current_turn: battle.current_turn === 'host' ? 'guest' : 'host' // Swap turn just for fun?
            }
        }

        // 4. Update DB
        const { error: updateError } = await supabaseAdmin
            .from('battles')
            .update(updateData)
            .eq('code', code)

        if (updateError) throw updateError

        // 5. Broadcast (Full State Sync)
        // We need to Construct Full State because Partial might confuse clients if we don't send everything
        const updatedBattle = { ...battle, ...updateData }
        
        const newState: BattleState = {
            code: updatedBattle.code,
            grid: updatedBattle.grid,
            criteria: updatedBattle.criteria,
            players: {
                host: updatedBattle.host_name ? { id: 'h', name: updatedBattle.host_name, role: 'host' } : null,
                guest: updatedBattle.guest_name ? { id: 'g', name: updatedBattle.guest_name, role: 'guest' } : null
            },
            currentTurn: updatedBattle.current_turn,
            winner: updatedBattle.winner,
            turnExpiry: updatedBattle.turn_expiry,
            roundNumber: updatedBattle.round_number || 1,
            scores: { host: updatedBattle.host_score || 0, guest: updatedBattle.guest_score || 0 },
            skipVotes: updatedBattle.skip_votes
        }

        await pusherServer.trigger(`battle-${code}`, 'game-sync', newState)

        return NextResponse.json({ success: true, skipped: skipConfirmed })

    } catch (e) {
        console.error("Skip Vote Error:", e)
        return NextResponse.json({ error: 'Vote failed' }, { status: 500 })
    }
}
