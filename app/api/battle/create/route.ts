import { NextResponse } from 'next/server'
import { generateGrid } from '@/lib/nba-data'
import { BattleState, GridCell } from '@/lib/battle-types'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const hostName = body.hostName || 'Host'
        
        // Generate Code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let suffix = ''
        for (let i = 0; i < 4; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length))
        const code = `NBA-${suffix}`

        // Generate Grid
        const { rows, cols } = generateGrid('medium') // Default to Medium for Battle
        
        // Initial Grid State (Empty)
        const grid: GridCell[][] = Array(3).fill(null).map(() => 
            Array(3).fill(null).map(() => ({ player: null, status: 'empty' }))
        )

        const initialState: BattleState = {
            code,
            grid,
            criteria: { rows, cols },
            players: {
                host: { id: 'host-1', name: hostName, role: 'host' },
                guest: null
            },
            currentTurn: 'host',
            winner: null
        }

        return NextResponse.json(initialState)
    } catch (e) {
        return NextResponse.json({ error: 'Failed to create battle' }, { status: 500 })
    }
}
