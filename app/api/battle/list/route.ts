import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Query battles that are waiting for players
        // guest_name IS NULL implies waiting for guest
        // created_at within last hour to ensure liveness
        
        // Show battles created in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: battles, error } = await supabaseAdmin
            .from('battles')
            .select('code, host_name, difficulty, created_at')
            .is('guest_name', null) // Only where no guest
            .eq('status', 'waiting') // Only waiting status
            .gt('created_at', oneDayAgo)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error("List Error:", error)
            throw error
        }

        return NextResponse.json({ battles })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch battles' }, { status: 500 })
    }
}
