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

    // Load Initial State from DB (Source of Truth)
    useEffect(() => {
        if (!code) return
        
        const fetchState = async () => {
            try {
                const res = await fetch(`/api/battle/${code}`)
                if (res.ok) {
                    const data = await res.json()
                    setState(data)
                } else {
                    console.error("Failed to load battle state")
                    setError("Battle not found")
                }
            } catch (e) {
                console.error(e)
                setError("Connection error")
            }
        }

        fetchState()
    }, [code])

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
        
        // 1. Snapshot previous state for rollback
        const prevState = { ...state }
        
        // 2. Optimistic Update
        const nextGrid = state.grid.map(rowArr => [...rowArr])
        nextGrid[row][col] = {
            player: player,
            status: 'correct',
            owner: role
        }
        
        // Optimistically swap turn (assuming success)
        const nextTurn = role === 'host' ? 'guest' : 'host'
        
        setState({
            ...state,
            grid: nextGrid,
            currentTurn: nextTurn
        })
        
        try {
            const res = await fetch('/api/battle/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    state: prevState, // Send TRUE server state context, not optimistic one
                    move: { row, col, player, role }
                })
            })
            
            const data = await res.json()
            
            if (!data.success) {
                console.error("Move failed:", data.error)
                // Provide visual feedback for "Invalid Move"
                if (data.error && data.error.includes("Invalid")) {
                     alert(data.error) // Simple alert for now, could be toast
                }
                
                // If server sent a state (e.g. penalty), use it
                if (data.state) {
                    setState(data.state)
                } else {
                    // Otherwise revert locally
                    setState(prevState)
                }
            } else if (data.state) {
                // Authoritative Update from Server
                setState(data.state)
            }
        } catch (e) {
            console.error(e)
            // Revert on Network Error
            setState(prevState)
            alert("Network Error: Could not submit move.")
        }
    }

    const voteSkip = () => {
        if (!state || !role) return
        
        setState((prev) => {
             if (!prev) return null
             return {
                ...prev,
                skipVotes: {
                    host: prev.skipVotes?.host || false,
                    guest: prev.skipVotes?.guest || false,
                    [role]: true
                }
             }
        })
    }

    const handleNextRound = async (action: 'continue' | 'forfeit') => {
        if (!code || !role) return
        
        try {
            await fetch('/api/battle/next-round', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, role, action })
            })
            // State update logic handles via Pusher sync usually, 
            // but we could optimistic update "Ready" status if we wanted.
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
        voteSkip,
        handleNextRound,
        error
    }
}
