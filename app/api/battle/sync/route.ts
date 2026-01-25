import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, state } = body
        
        if (!code || !state) {
            return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
        }

        // Broadcast State
        await pusherServer.trigger(`battle-${code}`, 'game-sync', state)

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to sync' }, { status: 500 })
    }
}
