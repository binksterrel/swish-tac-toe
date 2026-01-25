import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, name } = body
        
        if (!code || !name) {
            return NextResponse.json({ error: 'Missing code or name' }, { status: 400 })
        }

        // Check if battle exists and is waiting
        const { data: battle, error: fetchError } = await supabaseAdmin
            .from('battles')
            .select('*')
            .eq('code', code)
            .single()

        if (fetchError || !battle) {
            return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
        }

        if (battle.guest_name) {
            return NextResponse.json({ error: 'Battle full' }, { status: 403 })
        }

        // Update Battle with Guest
        const { error: updateError } = await supabaseAdmin
             .from('battles')
             .update({
                 guest_name: name,
                 status: 'playing'
             })
             .eq('code', code)

        if (updateError) throw updateError

        // Trigger Event for Host (UI Update) via Pusher
        // We still use Pusher for "Instant Notification" so Host doesn't need to poll DB
        await pusherServer.trigger(`battle-${code}`, 'player-joined', {
            name,
            role: 'guest',
            id: `guest-db`
        })

        return NextResponse.json({ success: true, role: 'guest' })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Failed to join' }, { status: 500 })
    }
}
