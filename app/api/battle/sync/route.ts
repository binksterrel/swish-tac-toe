import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabaseAdmin } from '@/lib/supabase'
import { BattleState } from '@/lib/battle-types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, state } = body
        
        if (!code) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 })
        }

        // Fetch authoritative state from DB
        const { data: battle, error } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('code', code)
            .single()

        if (battle) {
            // Server Authority Sync
            // We mix the client-provided state (for optimistic/local parts) with DB authority (scores, round, etc)
            // But actually, for sync, we should trust the DB mostly.
            
            const syncedState: BattleState = {
                ...state, // Base on client state (maybe has player names etc)
                // Overwrite critical game mechanics from DB
                grid: battle.grid, 
                currentTurn: battle.current_turn,
                winner: battle.winner,
                turnExpiry: battle.turn_expiry,
                scores: { host: battle.host_score || 0, guest: battle.guest_score || 0 },
                skipVotes: battle.skip_votes || { host: false, guest: false },
                roundStatus: battle.round_status || 'playing',
                nextRoundReady: battle.next_round_ready || { host: false, guest: false },
                roundNumber: battle.round_number || 1
            }

            await pusherServer.trigger(`battle-${code}`, 'game-sync', syncedState)
        } else {
             // Fallback if DB fetch fails (shouldn't happen really)
             await pusherServer.trigger(`battle-${code}`, 'game-sync', state)
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to sync' }, { status: 500 })
    }
}
