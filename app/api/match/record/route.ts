import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // 1. Check Auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const body = await request.json()
    const { mode, result, score, details } = body // result: 'WIN' | 'LOSS' | 'DRAW'

    // 2. Insert Match
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .insert({
        mode, // 'GUESS' or 'BATTLE'
        data: details || {}
      })
      .select()
      .single()

    if (matchError) throw matchError

    // 3. Insert Participant (The User)
    const { error: participantError } = await supabase
      .from('match_participants')
      .insert({
        match_id: matchData.id,
        user_id: userId,
        result, 
        score: score || 0
      })

    if (participantError) throw participantError

    // 4. Update Aggregated Stats (RPC or manual calculation)
    // We'll effectively UPSERT into user_stats
    // First, fetch current stats
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    const newStats = {
        total_matches: (currentStats?.total_matches || 0) + 1,
        wins: (currentStats?.wins || 0) + (result === 'WIN' ? 1 : 0),
        losses: (currentStats?.losses || 0) + (result === 'LOSS' ? 1 : 0),
        draws: (currentStats?.draws || 0) + (result === 'DRAW' ? 1 : 0),
        current_streak: result === 'WIN' ? (currentStats?.current_streak || 0) + 1 : 0,
        max_streak: currentStats?.max_streak || 0 // Will update below
    }

    // Update max streak if needed
    if (newStats.current_streak > newStats.max_streak) {
        newStats.max_streak = newStats.current_streak
    }

    const { error: statsError } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        ...newStats,
        updated_at: new Date().toISOString()
      })

    if (statsError) throw statsError

    return NextResponse.json({ success: true, matchId: matchData.id, newStats })

  } catch (error: any) {
    console.error('Match record error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
