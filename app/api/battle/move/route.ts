import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { validatePlayerForCell } from '@/lib/nba-data'
import { checkBattleWinner } from '@/lib/battle-logic'
import { BattleState, GridCell } from '@/lib/battle-types'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, move } = body
        // Note: we DON'T trust client state anymore. We fetch from DB.

        if (!code || !move) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        // 1. Fetch Current State from DB
        const { data: battle, error: fetchError } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('code', code)
            .single()

        if (fetchError || !battle) {
            return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
        }

        const currentTurn = battle.current_turn
        const grid = battle.grid as GridCell[][]
        const criteria = battle.criteria
        const { row, col, player, role } = move

        // 2. Validate Turn
        if (currentTurn !== role) {
            return NextResponse.json({ error: 'Not your turn' }, { status: 403 })
        }

        // 3. Validate Cell
        if (grid[row][col].status === 'correct') {
            return NextResponse.json({ error: 'Cell filled' }, { status: 400 })
        }

        // 4. Validate Logic
        const rowCriteria = criteria.rows[row]
        const colCriteria = criteria.cols[col]
        const validation = validatePlayerForCell(player, rowCriteria, colCriteria)
        
        let newGrid = [...grid]
        let nextTurn = role === 'host' ? 'guest' : 'host' // Swap turn by default?
        // Logic: Try -> If success -> Fill -> Check Winner -> Swap Turn
        // If fail -> Don't fill -> Swap Turn? Or Retry? Standard TicTacToe swaps turn on move.
        // Let's assume Valid Move = Success. Invalid = Rejected (No turn swap).
        
        if (validation.valid) {
            newGrid[row][col] = {
                player,
                status: 'correct',
                owner: role
            }
            // Swap turn only on success?
             nextTurn = role === 'host' ? 'guest' : 'host'
        } else {
             // Invalid move: Do nothing, return error? Or consume turn?
             // Usually returns error "Invalid Player" and lets user retry.
             return NextResponse.json({ error: 'Invalid Player for this spot', valid: false }, { status: 200 }) 
             // 200 to handle it gracefully in UI instead of Crash
        }

        // 5. Check Winner
        const winner = checkBattleWinner(newGrid)

        // 6. Update DB
        const { error: updateError } = await supabaseAdmin
            .from('battles')
            .update({
                 grid: newGrid,
                 current_turn: nextTurn,
                 winner: winner
            })
            .eq('code', code)

        if (updateError) throw updateError

        // 7. Map to State
        const newState: BattleState = {
            code,
            grid: newGrid,
            criteria,
            players: {
                host: battle.host_name ? { id: 'h', name: battle.host_name, role: 'host' } : null,
                guest: battle.guest_name ? { id: 'g', name: battle.guest_name, role: 'guest' } : null
            },
            currentTurn: nextTurn as 'host' | 'guest',
            winner: winner
        }

        // 8. Broadcast via Pusher (so clients refresh)
        await pusherServer.trigger(`battle-${code}`, 'move-made', newState)

        return NextResponse.json({ success: true, state: newState, valid: true })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Move failed' }, { status: 500 })
    }
}
