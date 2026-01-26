import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, name } = body
        
        if (!code || !name) {
            return NextResponse.json({ error: 'Missing code or name' }, { status: 400 })
        }

        // Check if battle exists and is waiting
        const { data: battle, error: fetchError } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('code', code)
            .single()

        if (fetchError || !battle) {
            return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
        }

        if (battle.guest_name) {
            return NextResponse.json({ error: 'Battle full' }, { status: 403 })
        }

        // Update Battle with Guest
        const { error: updateError } = await supabaseAdmin
             .from('battles')
             .update({
                 guest_name: name,
                 status: 'playing',
                 turn_expiry: Date.now() + 60000 // Reset timer for fresh start
             })
             .eq('code', code)

        if (updateError) throw updateError

        // Fetch Updated Battle to get fresh Timer and State
        const { data: updatedBattle, error: fetchUpdatedError } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('code', code)
            .single()
            
        if (fetchUpdatedError || !updatedBattle) throw fetchUpdatedError

        // Construct Full State
        const newState = {
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
            skipVotes: updatedBattle.skip_votes,
            roundStatus: updatedBattle.round_status || 'playing',
            nextRoundReady: updatedBattle.next_round_ready || { host: false, guest: false }
        }

        // Broadcast Full Sync (Ensures Host gets new Timer)
        await pusherServer.trigger(`battle-${code}`, 'game-sync', newState)

        return NextResponse.json({ success: true, role: 'guest' })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Failed to join' }, { status: 500 })
    }
}
