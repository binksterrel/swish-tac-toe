import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabaseAdmin } from '@/lib/supabase'
import { BattleState, GridCell, BattleDbUpdate } from '@/lib/battle-types'
import { generateGrid } from '@/lib/nba-data'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, role, action } = body
        // action: 'continue' | 'forfeit'

        if (!code || !role || !action) {
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

        let updateData: BattleDbUpdate = {}
        let newStateDetails: Partial<BattleState> = {}

        if (action === 'forfeit') {
            // GAME OVER - Forfeit
            const opponent = role === 'host' ? 'guest' : 'host'
            // Winner is opponent
            updateData = {
                status: 'finished',
                winner: opponent // Explicit Game Winner (not round winner)
            }
        } else if (action === 'continue') {
            // Start Next Round IMMEDIATELY on first request (to avoid sync issues)
            
            // Idempotency Check: If round is already playing (no winner), just return current state
            if (!battle.winner && (!battle.round_status || battle.round_status === 'playing')) {
                 return NextResponse.json({ success: true, state: { ...battle, ...newStateDetails } })
            }

            // START NEXT ROUND
            const currentRound = battle.round_number || 1
            const difficulty = battle.difficulty || 'medium' // Persist difficulty
            
            // Extract previous criteria values to exclude from new grid
            const prevCriteria = battle.criteria || { rows: [], cols: [] }
            const excludeValues = [
                ...prevCriteria.rows.map((c: { value: string }) => c.value),
                ...prevCriteria.cols.map((c: { value: string }) => c.value)
            ]
            
            const { rows, cols } = generateGrid(difficulty, 3, excludeValues)
            const freshGrid: GridCell[][] = Array(3).fill(null).map(() => 
                Array(3).fill(null).map(() => ({ player: null, status: 'empty' as const }))
            )

            updateData = {
                round_number: currentRound + 1,
                grid: freshGrid,
                criteria: { rows, cols },
                winner: null, // Reset round winner
                current_turn: battle.winner || 'host', // Winner starts next round
                turn_expiry: Date.now() + 60000,
                skip_votes: { host: false, guest: false },
                next_round_ready: { host: false, guest: false }, // Reset ready flags
                round_status: 'playing' // Explicitly reset status
            }
        }

        // 2. Update DB
        const { error: updateError } = await supabaseAdmin
            .from('battles')
            .update(updateData)
            .eq('code', code)

        if (updateError) throw updateError

        // 3. Broadcast
        // Construct detailed state
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
            nextRoundReady: updatedBattle.next_round_ready
        }

        await pusherServer.trigger(`battle-${code}`, 'game-sync', newState)

        return NextResponse.json({ success: true, state: newState })

    } catch (e) {
        console.error("Next Round Error:", e)
        return NextResponse.json({ error: 'Action failed' }, { status: 500 })
    }
}
