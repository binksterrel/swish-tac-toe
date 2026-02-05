import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const userIdParam = searchParams.get('userId')
  const limit = parseInt(searchParams.get('limit') || '50')

  const { data: { session } } = await supabase.auth.getSession()
  const targetUserId = userIdParam || session?.user?.id

  if (!targetUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: matches, error } = await supabase
      .from('match_participants')
      .select(`
        score,
        result,
        match:matches (
          id,
          mode,
          created_at,
          data
        )
      `)
      .eq('user_id', targetUserId)
      .order('match(created_at)', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Transform to match frontend history structure if possible
    const history = matches.map((m: any) => ({
      date: m.match.created_at,
      score: m.score,
      mode: m.match.mode,
      result: m.result,
      details: m.match.data
    }))

    return NextResponse.json({ history })

  } catch (error: any) {
    console.error('Fetch matches error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
