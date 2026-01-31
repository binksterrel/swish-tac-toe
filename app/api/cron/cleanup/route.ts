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
        // 1. Delete battles created more than 7 days ago
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const cutoffDate = sevenDaysAgo.toISOString()

        const { count: deletedCount, error: deleteError } = await supabaseAdmin
            .from('battles')
            .delete({ count: 'exact' })
            .lt('created_at', cutoffDate)

        if (deleteError) {
            console.error("Cleanup Delete Error:", deleteError)
        }

        // 2. Close battles that are "waiting" for more than 10 minutes (no guest joined)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
        
        const { error: waitingError } = await supabaseAdmin
            .from('battles')
            .update({ status: 'finished' })
            .eq('status', 'waiting')
            .lt('created_at', tenMinutesAgo)

        if (waitingError) {
            console.error("Cleanup Waiting Error:", waitingError)
        }

        // 3. Close battles that are "playing" but turn_expiry is 10+ minutes ago (abandoned)
        const abandonedCutoff = Date.now() - 10 * 60 * 1000 // 10 min in ms
        
        const { error: abandonedError } = await supabaseAdmin
            .from('battles')
            .update({ status: 'finished' })
            .eq('status', 'playing')
            .lt('turn_expiry', abandonedCutoff)

        if (abandonedError) {
            console.error("Cleanup Abandoned Error:", abandonedError)
        }

        return NextResponse.json({
            success: true,
            deleted_old: deletedCount || 0,
            message: 'Cleanup completed - closed waiting and abandoned battles',
            cutoff_date: cutoffDate
        })

    } catch (e) {
        console.error("Cleanup Unexpected Error:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
