import { NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher'

interface ChatMessage {
  id: string
  player: 'host' | 'guest'
  playerName: string
  text: string
  timestamp: number
}

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, message } = body as { code: string; message: ChatMessage }

    if (!code || !message) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // Broadcast message to all clients in this battle
    if (body.emoji) {
         // Quick Chat
         await pusherServer.trigger(`battle-${code}`, 'quick-chat', {
             role: body.role,
             message: body.message,
             emoji: body.emoji
         })
    } else if (message) {
         // Standard Chat
         // Changed channel to match useBattle hook
         await pusherServer.trigger(`battle-${code}`, 'chat-message', message)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Chat error:', e)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
