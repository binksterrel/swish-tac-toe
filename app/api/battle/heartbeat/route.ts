import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabaseAdmin } from '@/lib/supabase'
import { BattleState } from '@/lib/battle-types'

export const dynamic = 'force-dynamic'

/**
 * Heartbeat endpoint to:
 * - Keep connection alive
 * - Detect player status
 * - Sync state if out of sync
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, role, timestamp } = body

    if (!code || !role) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // Fetch current battle state
    const { data: battle, error } = await supabaseAdmin
      .from('battles')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    // Check for inactivity timeout (2 minutes)
    const lastActivity = battle.last_activity || battle.updated_at
    const timeSinceLastActivity = Date.now() - new Date(lastActivity).getTime()

    if (timeSinceLastActivity > 120000) {
      // Auto-forfeit inactive player
      const opponent = role === 'host' ? 'guest' : 'host'
      
      await supabaseAdmin
        .from('battles')
        .update({
          winner: opponent,
          status: 'finished',
          round_status: 'finished'
        })
        .eq('code', code)

      return NextResponse.json({
        success: true,
        action: 'forfeit',
        message: 'Opponent forfeited due to inactivity'
      })
    }

    // Update last activity timestamp
    await supabaseAdmin
      .from('battles')
      .update({ last_activity: new Date().toISOString() })
      .eq('code', code)

    // Send heartbeat and full state back
    const state: BattleState = {
      code: battle.code,
      grid: battle.grid,
      criteria: battle.criteria,
      players: {
        host: battle.host_name ? { id: 'h', name: battle.host_name, role: 'host' } : null,
        guest: battle.guest_name ? { id: 'g', name: battle.guest_name, role: 'guest' } : null
      },
      currentTurn: battle.current_turn as 'host' | 'guest',
      winner: battle.winner,
      turnExpiry: battle.turn_expiry,
      roundNumber: battle.round_number,
      scores: { host: battle.host_score || 0, guest: battle.guest_score || 0 }
    }

    // Broadcast heartbeat to clients
    await pusherServer.trigger(`battles.${code}`, 'heartbeat', {
      timestamp: Date.now(),
      role
    })

    return NextResponse.json({
      success: true,
      state,
      timestamp: Date.now()
    })
  } catch (e) {
    console.error('Heartbeat error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
