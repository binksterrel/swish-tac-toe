import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { validatePlayerForCell } from '@/lib/nba-data'
import { checkBattleWinner } from '@/lib/battle-logic'
import { BattleState, GridCell } from '@/lib/battle-types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, state, move } = body
        // move: { row, col, player, role }
        // state: BattleState (Server technically trusts Host state passed here, in a real app DB is source of truth)

        if (!code || !state || !move) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        const currentState = state as BattleState
        const { row, col, player, role } = move

        // 1. Validate Turn
        if (currentState.currentTurn !== role) {
            return NextResponse.json({ error: 'Not your turn' }, { status: 403 })
        }

        // 2. Validate Cell is Empty
        if (currentState.grid[row][col].status === 'correct') {
            return NextResponse.json({ error: 'Cell already filled' }, { status: 400 })
        }

        // 3. Validate Player Criteria
        const rowCriteria = currentState.criteria.rows[row]
        const colCriteria = currentState.criteria.cols[col]
        
        const validation = validatePlayerForCell(player, rowCriteria, colCriteria)
        
        const newGrid = [...currentState.grid]
        const newRow = [...newGrid[row]]

        if (validation.valid) {
            newRow[col] = {
                player,
                status: 'correct',
                owner: role
            }
        } else {
            // Incorrect guess logic? 
            // - Option A: Turn passes, cell stays empty (Strict)
            // - Option B: Cell marked incorrect (blocked? or retryable?)
            // Battle Mode usually allows retries or passes turn? 
            // "Celui qui fait une colonne gagne" -> Turn based.
            // Let's say Incorrect = Turn Lost. Cell stays empty.
            // Or maybe mark 'incorrect' briefly?
            // Let's keep it simple: Invalid move rejected? Or Valid player but WRONG criteria?
            // If wrong criteria, turn passes.
            
            // For now: Just pass the turn, no grid change.
            // Maybe notify "Miss"?
        }
        
        newGrid[row] = newRow
        
        // 4. Check Winner
        let winner = checkBattleWinner(newGrid)
        
        // 5. Update State
        const nextTurn = role === 'host' ? 'guest' : 'host'
        
        const newState: BattleState = {
            ...currentState,
            grid: newGrid,
            currentTurn: nextTurn,
            winner: winner
        }

        // 6. Broadcast
        await pusherServer.trigger(`battle-${code}`, 'move-made', newState)

        return NextResponse.json({ success: true, state: newState, valid: validation.valid })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Move failed' }, { status: 500 })
    }
}
