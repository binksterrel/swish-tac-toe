import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabaseAdmin } from '@/lib/supabase'
import { BattleState, GridCell } from '@/lib/battle-types'
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

        let updateData: any = {}
        let newStateDetails: Partial<BattleState> = {}

        if (action === 'forfeit') {
            // GAME OVER - Forfeit
            const opponent = role === 'host' ? 'guest' : 'host'
            // Winner is opponent
            updateData = {
                status: 'finished',
                winner: opponent, // Explicit Game Winner (not round winner)
                round_status: 'finished'
            }
        } else if (action === 'continue') {
            // MARK READY
            const currentReady = battle.next_round_ready || { host: false, guest: false }
            const newReady = { ...currentReady, [role]: true }

            // CHECK CONSENSUS
            if (newReady.host && newReady.guest) {
                // START NEXT ROUND
                const currentRound = battle.round_number || 1
                const { rows, cols } = generateGrid('medium')
                const freshGrid = Array(3).fill(null).map(() => 
                   Array(3).fill(null).map(() => ({ player: null, status: 'empty' }))
                )

                updateData = {
                    round_number: currentRound + 1,
                    grid: freshGrid,
                    criteria: { rows, cols },
                    winner: null, // Reset round winner
                    current_turn: battle.winner || 'host', // Winner starts next round
                    turn_expiry: Date.now() + 60000,
                    skip_votes: { host: false, guest: false },
                    round_status: 'playing',
                    next_round_ready: { host: false, guest: false }
                }
            } else {
                // JUST MARK READY
                updateData = {
                    next_round_ready: newReady
                }
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
