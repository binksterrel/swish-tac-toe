import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher-server'
import { supabaseAdmin } from '@/lib/supabase'
import { BattleState } from '@/lib/battle-types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, role } = body

        if (!code || !role) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        const { data: battle, error: fetchError } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('code', code)
            .single()

        if (fetchError || !battle) {
            return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
        }

        if (battle.current_turn !== role) {
            return NextResponse.json({ error: 'Not your turn' }, { status: 403 })
        }

        if (battle.round_status === 'finished' || battle.round_status === 'round_over') {
            return NextResponse.json({ error: 'Round is not active' }, { status: 400 })
        }

        const nextTurn = role === 'host' ? 'guest' : 'host'
        const nextExpiry = Date.now() + 60000

        const { error: updateError } = await supabaseAdmin
            .from('battles')
            .update({ current_turn: nextTurn, turn_expiry: nextExpiry })
            .eq('code', code)

        if (updateError) throw updateError

        const newState: BattleState = {
            code: battle.code,
            grid: battle.grid,
            criteria: battle.criteria,
            players: {
                host: battle.host_name ? { id: 'h', name: battle.host_name, role: 'host' } : null,
                guest: battle.guest_name ? { id: 'g', name: battle.guest_name, role: 'guest' } : null,
            },
            currentTurn: nextTurn as 'host' | 'guest',
            winner: battle.winner as 'host' | 'guest' | 'draw' | null,
            turnExpiry: nextExpiry,
            roundNumber: battle.round_number || 1,
            scores: { host: battle.host_score || 0, guest: battle.guest_score || 0 },
            skipVotes: battle.skip_votes || { host: false, guest: false },
            roundStatus: battle.round_status || 'playing',
        }

        await pusherServer.trigger(`battle-${code}`, 'turn-passed', newState)

        return NextResponse.json({ success: true, state: newState })

    } catch (e) {
        console.error('Pass Turn Error:', e)
        return NextResponse.json({ error: 'Failed to pass turn' }, { status: 500 })
    }
}
