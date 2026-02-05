import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const userIdParam = searchParams.get('userId')

  // Use session ID if no specific userId provided
  const { data: { session } } = await supabase.auth.getSession()
  const targetUserId = userIdParam || session?.user?.id

  if (!targetUserId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (error && error.code !== 'PGRST116') { // Ignore "Row not found" (just return nulls)
      throw error
    }

    return NextResponse.json({ 
        stats: stats || {
            total_matches: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            current_streak: 0,
            max_streak: 0
        }
    })

  } catch (error: any) {
    console.error('Fetch stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
