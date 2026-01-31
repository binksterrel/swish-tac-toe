import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabaseAdmin } from '@/lib/supabase'
import { BattleState, GridCell, BattleDbUpdate } from '@/lib/battle-types'
import { generateGrid } from '@/lib/nba-data'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, role } = body

        if (!code || !role) {
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

        // 2. Update Vote
        const currentVotes = battle.rematch_votes || { host: false, guest: false }
        const newVotes = { ...currentVotes, [role]: true }

        let updateData: BattleDbUpdate = {}
        let isReset = false

        // 3. Check Consensus
        if (newVotes.host && newVotes.guest) {
            // RESET GAME
            isReset = true
            const { rows, cols } = generateGrid('medium')
            const freshGrid: GridCell[][] = Array(3).fill(null).map(() => 
               Array(3).fill(null).map(() => ({ player: null, status: 'empty' as const }))
            )

            updateData = {
                round_number: 1,
                grid: freshGrid,
                criteria: { rows, cols },
                winner: null,
                current_turn: 'host', // Host always starts new game? Or random? Let's say Host.
                turn_expiry: Date.now() + 60000,
                skip_votes: { host: false, guest: false },
                next_round_ready: { host: false, guest: false },
                rematch_votes: { host: false, guest: false }, // Reset votes
                round_status: 'playing',
                host_score: 0,
                guest_score: 0
            }
        } else {
            // RECORD VOTE
            updateData = {
                rematch_votes: newVotes
            }
        }

        // 4. Update DB
        const { error: updateError } = await supabaseAdmin
            .from('battles')
            .update(updateData)
            .eq('code', code)

        if (updateError) throw updateError

        // 5. Broadcast
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
            roundNumber: updatedBattle.round_number,
            scores: { host: updatedBattle.host_score || 0, guest: updatedBattle.guest_score || 0 },
            skipVotes: updatedBattle.skip_votes,
            roundStatus: updatedBattle.round_status || 'playing',
            nextRoundReady: updatedBattle.next_round_ready,
            rematchVotes: updatedBattle.rematch_votes
        }

        await pusherServer.trigger(`battle-${code}`, 'game-sync', newState)

        return NextResponse.json({ success: true, state: newState, isReset })

    } catch (e) {
        console.error("Rematch Error:", e)
        return NextResponse.json({ error: 'Action failed' }, { status: 500 })
    }
}
