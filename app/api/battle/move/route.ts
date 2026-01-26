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

        // 3.5 Validate Unique Player - REMOVED per user request
        // const isPlayerUsed = grid.flat().some(cell => cell.player?.id === player.id)
        // if (isPlayerUsed) {
        //      return NextResponse.json({ error: 'Player already used', valid: false }, { status: 200 })
        // }

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
             // PENALTY: Invalid move (wrong player) -> Swap turn immediately
             // Mark cell as nothing? Or just consume turn.
             // We return 'success: false' to UI but valid: false so it knows why.
             
             const nextTurn = role === 'host' ? 'guest' : 'host'
             const nextExpiry = Date.now() + 60000

             // Update DB with turn swap (Penalty)
            await supabaseAdmin
                .from('battles')
                .update({
                    current_turn: nextTurn,
                    turn_expiry: nextExpiry
                })
                .eq('code', code)

            // Broadcast Penalty
            const penaltyState: BattleState = {
                code,
                grid: [...grid],
                criteria,
                players: {
                    host: battle.host_name ? { id: 'h', name: battle.host_name, role: 'host' } : null,
                    guest: battle.guest_name ? { id: 'g', name: battle.guest_name, role: 'guest' } : null
                },
                currentTurn: nextTurn as 'host' | 'guest',
                winner: null, // No winner on penalty
                turnExpiry: nextExpiry
            }
            await pusherServer.trigger(`battle-${code}`, 'move-made', penaltyState)

            return NextResponse.json({ error: 'Invalid Player for this spot. Turn Lost!', valid: false, state: penaltyState }, { status: 200 }) 
        }

        // 5. Check Winner
        const winner = checkBattleWinner(newGrid)

        const nextExpiry = Date.now() + 60000 // 60s for next turn

        // 6. Update DB Logic with Rounds
        let dbUpdate: any = {
             grid: newGrid,
             current_turn: nextTurn,
             winner: winner,
             turn_expiry: nextExpiry
        }
        
        // Handle Win -> Round Transition
        if (winner && winner !== 'draw') {
             // Increment Score
             const currentHostScore = battle.host_score || 0
             const currentGuestScore = battle.guest_score || 0
             const currentRound = battle.round_number || 1
             
             const newHostScore = winner === 'host' ? currentHostScore + 1 : currentHostScore
             const newGuestScore = winner === 'guest' ? currentGuestScore + 1 : currentGuestScore
             
             dbUpdate.host_score = newHostScore
             dbUpdate.guest_score = newGuestScore
             
             if (currentRound < 5) {
                // NEXT ROUND
                // Generate New Grid
                const { generateGrid } = require('@/lib/nba-data') // Dynamic require to avoid circle if any
                const { rows, cols } = generateGrid('medium')
                const freshGrid = Array(3).fill(null).map(() => 
                   Array(3).fill(null).map(() => ({ player: null, status: 'empty' }))
                )

                dbUpdate.round_number = currentRound + 1
                dbUpdate.grid = freshGrid
                dbUpdate.criteria = { rows, cols }
                dbUpdate.winner = null // Reset winner for new round
                dbUpdate.turn_expiry = Date.now() + 60000
                dbUpdate.skip_votes = { host: false, guest: false }
                // Winner starts next round? or Loser? Let's say Winner starts.
                dbUpdate.current_turn = winner 
             } else {
                // GAME OVER (Final Round Finished)
                // We keep winner set so UI shows "Round Winner", but maybe we need a "Game Winner" flag?
                // The UI can deduce Game Over if round == 5 and winner != null.
                // Or we can set a special status.
                dbUpdate.status = 'finished'
             }
        } else if (winner === 'draw') {
             // Draw Logic? 
             // Retry round? Or split point? Or just next round with no score?
             // Let's go Next Round with no score change
             const currentRound = battle.round_number || 1
             if (currentRound < 5) {
                const { generateGrid } = require('@/lib/nba-data')
                const { rows, cols } = generateGrid('medium')
                const freshGrid = Array(3).fill(null).map(() => 
                   Array(3).fill(null).map(() => ({ player: null, status: 'empty' }))
                )
                dbUpdate.round_number = currentRound + 1
                dbUpdate.grid = freshGrid
                dbUpdate.criteria = { rows, cols }
                dbUpdate.winner = null
                dbUpdate.turn_expiry = Date.now() + 60000
                dbUpdate.skip_votes = { host: false, guest: false }
             } else {
                 dbUpdate.status = 'finished'
             }
        }

        const { error: updateError } = await supabaseAdmin
            .from('battles')
            .update(dbUpdate)
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
            winner: dbUpdate.winner || winner, // Use updated winner (null if next round) or current if final
            turnExpiry: dbUpdate.turn_expiry || nextExpiry,
            roundNumber: dbUpdate.round_number || battle.round_number || 1,
            scores: { 
                host: dbUpdate.host_score !== undefined ? dbUpdate.host_score : (battle.host_score || 0), 
                guest: dbUpdate.guest_score !== undefined ? dbUpdate.guest_score : (battle.guest_score || 0)
            }
        }

        // 8. Broadcast via Pusher (so clients refresh)
        await pusherServer.trigger(`battle-${code}`, 'move-made', newState)

        return NextResponse.json({ success: true, state: newState, valid: true })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Move failed' }, { status: 500 })
    }
}
