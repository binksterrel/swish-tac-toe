import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabaseAdmin } from '@/lib/supabase'
import { BattleState } from '@/lib/battle-types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, playerRole } = body
        // code: battle code
        // playerRole: who triggered the timeout (should be the player whose turn it was, or anyone really)

        if (!code) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 })
        }

        // 1. Fetch Current State
        const { data: battle, error: fetchError } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('code', code)
            .single()

        if (fetchError || !battle) {
            return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
        }

        const currentTurn = battle.current_turn
        const turnExpiry = battle.turn_expiry

        // 2. Validate Expiry
        const now = Date.now()
        // Allow a small buffer (e.g., 1-2 seconds) for network latency, but basically check if time is up
        if (!turnExpiry || now < turnExpiry - 2000) {
             return NextResponse.json({ error: 'Turn not yet expired' }, { status: 400 })
        }

        if (body.currentTurn && currentTurn !== body.currentTurn) {
             return NextResponse.json({ error: 'Turn already changed', state: null }, { status: 200 })
        }

        // 3. Swap Turn
        const nextTurn = currentTurn === 'host' ? 'guest' : 'host'
        const nextExpiry = Date.now() + 60000 // 60 seconds for next turn

        // 4. Update DB
        const { error: updateError } = await supabaseAdmin
             .from('battles')
             .update({
                 current_turn: nextTurn,
                 turn_expiry: nextExpiry
             })
             .eq('code', code)

        if (updateError) throw updateError

        // 5. Broadcast
        const newState: BattleState = {
            code: battle.code,
            grid: battle.grid,
            criteria: battle.criteria,
            players: {
                host: battle.host_name ? { id: 'h', name: battle.host_name, role: 'host' } : null,
                guest: battle.guest_name ? { id: 'g', name: battle.guest_name, role: 'guest' } : null
            },
            currentTurn: nextTurn as 'host' | 'guest',
            winner: battle.winner as 'host' | 'guest' | 'draw' | null,
            turnExpiry: nextExpiry
        }

        await pusherServer.trigger(`battle-${code}`, 'timeout', newState)

        return NextResponse.json({ success: true, state: newState })

    } catch (e) {
        console.error("Timeout Error:", e)
        return NextResponse.json({ error: 'Timeout failed' }, { status: 500 })
    }
}
