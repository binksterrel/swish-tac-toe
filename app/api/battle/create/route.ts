import { NextResponse } from 'next/server'
import { generateGrid } from '@/lib/nba-data'
import { BattleState, GridCell } from '@/lib/battle-types'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const hostName = body.hostName || 'Host'
        const difficulty = body.difficulty || 'medium'
        
        // Generate Code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let suffix = ''
        for (let i = 0; i < 4; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length))
        const code = `NBA-${suffix}`

        // Generate Grid
        const { rows, cols } = generateGrid(difficulty) 
        
        // Initial Grid State
        const grid: GridCell[][] = Array(3).fill(null).map(() => 
            Array(3).fill(null).map(() => ({ player: null, status: 'empty' }))
        )

        // Insert into Supabase
        const { error } = await supabaseAdmin
            .from('battles')
            .insert({
                code,
                grid,
                criteria: { rows, cols },
                host_name: hostName,
                status: 'waiting',
                current_turn: 'host',
                turn_expiry: Date.now() + 60000 // 1 min for Host first turn
            })

        if (error) {
            console.error("Supabase Insert Error:", error)
            throw error
        }

        return NextResponse.json({ code })
    } catch (e) {
        console.error("Battle Create Error:", e)
        return NextResponse.json({ error: 'Failed to create battle', details: String(e) }, { status: 500 })
    }
}
