"use client"

import { useState, useEffect, useCallback } from "react"
import { pusherClient } from "@/lib/pusher"
import { BattleState, BattleMove } from "@/lib/battle-types"
import { NBAPlayer } from "@/lib/nba-data"

import { toast } from "sonner"

// Helper to parse "TEAM|Name" format
function parseState(state: BattleState): BattleState {
    const newState = { ...state }
    
    if (newState.players.host) {
        const parts = newState.players.host.name.split('|')
        if (parts.length > 1) {
            newState.players.host.avatar = parts[0]
            newState.players.host.name = parts[1]
        }
    }
    
    if (newState.players.guest) {
        const parts = newState.players.guest.name.split('|')
        if (parts.length > 1) {
            newState.players.guest.avatar = parts[0]
            newState.players.guest.name = parts[1]
        }
    }
    
    return newState
}

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
                    setState(parseState(data))
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
            toast.info("Opponent Joined!", { description: "Get ready to battle." })
            
            setState(prev => {
                if (!prev) return null
                
                // Parse the new guest name immediately
                let guestName = data.name
                let guestAvatar = undefined
                const parts = guestName.split('|')
                if (parts.length > 1) {
                    guestAvatar = parts[0]
                    guestName = parts[1]
                }
                
                return {
                    ...prev,
                    players: { ...prev.players, guest: { id: 'guest', name: guestName, avatar: guestAvatar, role: 'guest' } }
                }
            })
        })

        channel.bind('game-sync', (syncedState: BattleState) => {
            console.log("State synced:", syncedState)
            setState(parseState(syncedState))
        })

        channel.bind('move-made', (newState: BattleState) => {
            console.log("Move received:", newState)
            setState(parseState(newState))
        })
        
        channel.bind('quick-chat', (data: { role: string, message: string, emoji?: string }) => {
            const isMe = data.role === role
            const displayName = isMe ? "You" : (data.role === 'host' ? state?.players.host?.name : state?.players.guest?.name) || "Opponent"
            
            toast(data.message, {
                icon: data.emoji || "💬",
                description: displayName,
                position: isMe ? "bottom-right" : "bottom-left",
                duration: 3000,
                className: isMe ? "bg-nba-blue/20 border-nba-blue text-white" : "bg-nba-red/20 border-nba-red text-white"
            })
        })

        // Listen for timeout events from server
        channel.bind('timeout', (newState: BattleState) => {
            console.log("Timeout received:", newState)
            toast.warning("Time's Up!", { 
                description: `Turn passed to ${newState.currentTurn === 'host' ? 'Host' : 'Guest'}`,
                duration: 3000 
            })
            setState(parseState(newState))
        })

        return () => {
            pusherClient.unsubscribe(`battle-${code}`)
        }
    }, [code, role, state?.players.host?.name, state?.players.guest?.name])

    // ... (rest of the file)

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
        
        // 0. Check if it's my turn (client-side guard)
        if (state.currentTurn !== role) {
            toast.warning("Ce n'est pas ton tour !", { 
                description: "Attends que l'adversaire joue.",
                duration: 3000 
            })
            return
        }
        
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
                console.warn("Invalid Move Attempt:", data.error)
                const errorMsg = data.error || "Invalid Move"
                
                // Better error messages based on error type
                if (data.error?.includes("Not your turn")) {
                    toast.warning("Désynchronisation!", {
                        description: "Rafraîchis la page si le problème persiste.",
                        duration: 4000
                    })
                } else if (data.valid === false) {
                     toast.error("Tour Perdu!", {
                         description: errorMsg,
                         duration: 4000
                     })
                } else {
                     toast.error("Coup échoué", { description: errorMsg })
                }
                
                // If server sent a state (e.g. penalty), use it
                if (data.state) {
                    setState(parseState(data.state))
                } else {
                    // Otherwise revert locally
                    setState(prevState)
                }
            } else if (data.state) {
                // Authoritative Update from Server
                setState(parseState(data.state))
                // Success Toast
                toast.success("Swish!", { description: "Bien joué!", duration: 1500 })
            }
        } catch (e) {
            console.error(e)
            // Revert on Network Error
            setState(prevState)
            toast.error("Erreur Réseau", { description: "Impossible d'envoyer le coup." })
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
