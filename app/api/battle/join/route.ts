import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, name } = body
        
        if (!code || !name) {
            return NextResponse.json({ error: 'Missing code or name' }, { status: 400 })
        }

        // Trigger Event for Host
        await pusherServer.trigger(`battle-${code}`, 'player-joined', {
            name,
            role: 'guest',
            id: `guest-${Date.now()}`
        })

        return NextResponse.json({ success: true, role: 'guest' })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Failed to join' }, { status: 500 })
    }
}
