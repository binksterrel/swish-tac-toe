import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    // Optional: Add a simple secret check if you want to protect this endpoint further
    // const authHeader = req.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 })
    // }

    try {
        // Calculate date 7 days ago
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const cutoffDate = sevenDaysAgo.toISOString()

        // Delete battles created before cutoff date
        const { count, error } = await supabaseAdmin
            .from('battles')
            .delete({ count: 'exact' })
            .lt('created_at', cutoffDate)

        if (error) {
            console.error("Cleanup Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            deleted_count: count,
            cutoff_date: cutoffDate
        })

    } catch (e) {
        console.error("Cleanup Unexpected Error:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
