import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { validatePlayerForCell, ALL_NBA_PLAYERS } from '@/lib/nba-data'
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
        const { row: rRaw, col: cRaw, player, role } = move
        const row = parseInt(String(rRaw))
        const col = parseInt(String(cRaw))

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
        
        // DEBUG LOGGING
        console.log("=== BATTLE MOVE DEBUG ===")
        console.log("Row:", row, "Col:", col)
        console.log("Row Criteria:", JSON.stringify(rowCriteria))
        console.log("Col Criteria:", JSON.stringify(colCriteria))
        console.log("Player from client:", player.name, player.id)
        
        // Security: Lookup authoritative player stats from server data
        // Do NOT trust the client's player object for validation
        const authPlayer = ALL_NBA_PLAYERS.find(p => p.id === player.id) || ALL_NBA_PLAYERS.find(p => p.name === player.name)
        
        if (!authPlayer) {
             console.log("ERROR: Player not found in ALL_NBA_PLAYERS")
             return NextResponse.json({ error: 'System Error: Player not found in database', valid: false }, { status: 200 })
        }

        console.log("Auth Player:", authPlayer.name, "Teams:", authPlayer.teams, "AllStar:", authPlayer.allStar, "MVP:", authPlayer.mvp)

        const validation = validatePlayerForCell(authPlayer, rowCriteria, colCriteria)
        console.log("Validation Result:", JSON.stringify(validation))
        
        // Deep copy grid to avoid reference issues
        let newGrid: GridCell[][] = grid.map(row => row.map(cell => ({ ...cell })))
        
        let nextTurn = role === 'host' ? 'guest' : 'host'
        
        if (validation.valid) {
            newGrid[row][col] = {
                player: authPlayer, // Use verified player data
                status: 'correct',
                owner: role
            }
             nextTurn = role === 'host' ? 'guest' : 'host'
        } else {
             // PENALTY: Invalid move (wrong player) -> Swap turn immediately
             nextTurn = role === 'host' ? 'guest' : 'host'
             const nextExpiry = Date.now() + 60000 

             // Update DB with turn swap (Penalty)
            await supabaseAdmin
                .from('battles')
                .update({
                    current_turn: nextTurn,
                    turn_expiry: nextExpiry
                })
                .eq('code', code)
            
            const penaltyState: BattleState = {
                code,
                grid: [...grid],
                criteria,
                players: {
                    host: battle.host_name ? { id: 'h', name: battle.host_name, role: 'host' } : null,
                    guest: battle.guest_name ? { id: 'g', name: battle.guest_name, role: 'guest' } : null
                },
                currentTurn: nextTurn as 'host' | 'guest',
                winner: null,
                turnExpiry: nextExpiry,
                roundNumber: battle.round_number || 1,
                scores: { 
                    host: battle.host_score || 0,
                    guest: battle.guest_score || 0
                },
                skipVotes: battle.skip_votes
            }

            // Broadcast Penalty
            await pusherServer.trigger(`battle-${code}`, 'move-made', penaltyState)

            // Return detailed reason
            return NextResponse.json({ 
                error: `Invalid Move: ${validation.reason || 'Player does not match criteria'}. Turn Lost!`, 
                valid: false, 
                state: penaltyState 
            }, { status: 200 }) 
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
                // ROUND OVER - WAIT FOR CONTINUE
                // Note: round_status tracked client-side or via winner field
                // We keep the winner set so UI shows "Round Winner"
                // DO NOT generate new grid yet. That happens in next-round API.
                
                // Stop the timer?
                dbUpdate.turn_expiry = null 
             } else {
                // GAME OVER (Final Round Finished)
                dbUpdate.status = 'finished'
                // Note: game finished, status field handles this
             }
        } else if (winner === 'draw') {
             // Draw Logic? 
             // Retry round? Or split point? Or just next round with no score?
             // Let's go Next Round with no score change
             const currentRound = battle.round_number || 1
             if (currentRound < 5) {
                // Note: round_status tracked via winner field
                dbUpdate.turn_expiry = null
             } else {
                 dbUpdate.status = 'finished'
                 dbUpdate.round_status = 'finished'
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
            },
            roundStatus: dbUpdate.round_status || battle.round_status || 'playing',
            nextRoundReady: dbUpdate.next_round_ready || battle.next_round_ready || { host: false, guest: false }
        }

        // 8. Broadcast via Pusher (so clients refresh)
        await pusherServer.trigger(`battle-${code}`, 'move-made', newState)

        return NextResponse.json({ success: true, state: newState, valid: true })

    } catch (e: any) {
        console.error("BATTLE MOVE ERROR:", e)
        return NextResponse.json({ error: 'Move failed: ' + (e?.message || String(e)) }, { status: 500 })
    }
}
