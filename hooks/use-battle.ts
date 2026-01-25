"use client"

import { useState, useEffect, useCallback } from "react"
import { pusherClient } from "@/lib/pusher"
import { BattleState, BattleMove } from "@/lib/battle-types"
import { NBAPlayer } from "@/lib/nba-data"

export function useBattle(code: string, initialPlayerName?: string) {
    const [state, setState] = useState<BattleState | null>(null)
    const [role, setRole] = useState<'host' | 'guest' | null>(null)
    const [myPlayerName, setMyPlayerName] = useState(initialPlayerName || "")
    const [error, setError] = useState<string | null>(null)

    // Pusher Subscription
    useEffect(() => {
        if (!code) return

        const channel = pusherClient.subscribe(`battle-${code}`)

        channel.bind('player-joined', (data: { name: string, role: 'guest' }) => {
            console.log("Player joined:", data)
            // Only Host cares about this to sync state
            // But we can also update local state UI immediately
            setState(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    players: { ...prev.players, guest: { id: 'guest', name: data.name, role: 'guest' } }
                }
            })
            
            // If I am Host, I must SYNC
            // We need to know our role. We set it manually on creation/join.
        })

        channel.bind('game-sync', (syncedState: BattleState) => {
            console.log("State synced:", syncedState)
            setState(syncedState)
        })

        channel.bind('move-made', (newState: BattleState) => {
            console.log("Move received:", newState)
            setState(newState)
        })

        return () => {
            pusherClient.unsubscribe(`battle-${code}`)
        }
    }, [code])

    // Host Sync Trigger (should be called when Host sees guest join)
    useEffect(() => {
        if (role === 'host' && state?.players.guest && state.players.guest.name) {
             // Sync state to guest
             fetch('/api/battle/sync', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ code, state })
             }).catch(console.error)
        }
    }, [state?.players.guest, role, code])

    const submitMove = async (row: number, col: number, player: NBAPlayer) => {
        if (!state || !role) return
        
        // Optimistic update? No, let's wait for server to validate to avoid desync
        // Or simple local validation first?
        
        try {
            const res = await fetch('/api/battle/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    state, // Pass current state for validation context
                    move: { row, col, player, role }
                })
            })
            
            const data = await res.json()
            if (!data.success) {
                console.error("Move failed:", data.error)
                // Maybe show toast
            }
        } catch (e) {
            console.error(e)
        }
    }

    return {
        state,
        setState,
        role,
        setRole,
        submitMove,
        error
    }
}
