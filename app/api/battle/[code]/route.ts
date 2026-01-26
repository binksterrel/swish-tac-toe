import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { BattleState } from '@/lib/battle-types'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
    try {
        const { code } = await params
        
        const { data: battle, error } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('code', code)
            .single()

        if (error || !battle) {
            return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
        }

        // Map DB Row to BattleState
        const state: BattleState = {
            code: battle.code,
            grid: battle.grid,
            criteria: battle.criteria,
            players: {
                host: battle.host_name ? { id: 'host-db', name: battle.host_name, role: 'host' } : null,
                guest: battle.guest_name ? { id: 'guest-db', name: battle.guest_name, role: 'guest' } : null
            },
            currentTurn: battle.current_turn as 'host' | 'guest',
            winner: battle.winner as 'host' | 'guest' | 'draw' | null,
            turnExpiry: battle.turn_expiry,
            roundNumber: battle.round_number || 1,
            scores: { host: battle.host_score || 0, guest: battle.guest_score || 0 },
            skipVotes: battle.skip_votes || { host: false, guest: false }
        }

        return NextResponse.json(state)
    } catch (e) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
