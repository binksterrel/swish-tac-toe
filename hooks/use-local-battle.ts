import { useState, useEffect } from 'react'
import { GridCell, BattleState, Player } from '@/lib/battle-types'
import { NBAPlayer, generateGrid, validatePlayerForCell } from '@/lib/nba-data'

// Mock initial state
const INITIAL_GRID_SIZE = 3

export function useLocalBattle() {
    // Game State
    const [state, setState] = useState<BattleState | null>(null)
    const [players, setPlayers] = useState<{host: Player, guest: Player} | null>(null)
    const [turnExpiry, setTurnExpiry] = useState<number | null>(null)
    const [messages, setMessages] = useState<any[]>([]) 

    // Initialize Game
    const initLocalGame = (p1Name: string, p1Team: string, p2Name: string, p2Team: string, difficulty: string) => {
        // generateGrid signature: (difficulty, size, excludeValues)
        const { rows, cols } = generateGrid(difficulty as any, INITIAL_GRID_SIZE) 
        
        const newPlayers = {
            host: { id: 'p1', name: p1Name, avatar: p1Team, role: 'host' as const, score: 0, isReady: true },
            guest: { id: 'p2', name: p2Name, avatar: p2Team, role: 'guest' as const, score: 0, isReady: true }
        }
        setPlayers(newPlayers)

        // Empty Grid
        const emptyGrid: GridCell[][] = Array(INITIAL_GRID_SIZE).fill(null).map((_, r) => 
            Array(INITIAL_GRID_SIZE).fill(null).map((_, c) => ({
                row: r,
                col: c,
                status: 'empty',
                owner: null,
                player: null
            }))
        )

        const newState: BattleState = {
            id: 'local_match',
            code: 'LOCAL',
            status: 'active',
            roundStatus: 'active',
            roundNumber: 1,
            currentTurn: 'host', // P1 starts
            turnExpiry: Date.now() + 20000, // 20s per turn
            grid: emptyGrid,
            players: newPlayers,
            criteria: { rows, cols },
            scores: { host: 0, guest: 0 },
            winner: null,
            createdAt: new Date().toISOString(),
            skipVotes: { host: false, guest: false },
            nextRoundReady: { host: false, guest: false }
        }
        
        setState(newState)
        setTurnExpiry(Date.now() + 20000)
    }

    // Timer Logic for auto-switch
    useEffect(() => {
        if (!state || state.roundStatus !== 'active' || !turnExpiry) return

        const interval = setInterval(() => {
            if (Date.now() >= turnExpiry) {
                // Time's up! Switch turn
                switchTurn(state.currentTurn === 'host' ? 'guest' : 'host')
            }
        }, 500)
        return () => clearInterval(interval)
    }, [turnExpiry, state?.roundStatus, state?.currentTurn])

    const switchTurn = (nextTurn: 'host' | 'guest') => {
        setState(prev => {
            if (!prev) return null
            return {
                ...prev,
                currentTurn: nextTurn,
                turnExpiry: Date.now() + 20000 // Reset timer
            }
        })
        setTurnExpiry(Date.now() + 20000)
    }

    const submitMove = (row: number, col: number, player: NBAPlayer) => {
        if (!state || state.roundStatus !== 'active') return

        const rowCrit = state.criteria.rows[row]
        const colCrit = state.criteria.cols[col]
        
        const validation = validatePlayerForCell(player, rowCrit, colCrit)
        const isValid = validation.valid

        if (isValid) {
            // Correct Move
            setState(prev => {
                if (!prev) return null
                const newGrid = prev.grid.map(r => [...r])
                newGrid[row][col] = {
                    ...newGrid[row][col],
                    status: 'correct',
                    owner: prev.currentTurn,
                    player: { ...player, photoUrl: player.photoUrl } // Ensure photoUrl exists
                }
                
                // Update Score
                const newScores = { ...prev.scores }
                newScores[prev.currentTurn]++

                // Check Round Win (3 aligned or full grid)
                let winner: 'host' | 'guest' | 'draw' | null = null
                
                // Check basic Tic Tac Toe lines for current player
                const p = prev.currentTurn
                const size = 3
                let won = false
                
                // Rows & Cols
                for(let i=0; i<size; i++) {
                    if (newGrid[i].every(c => c.owner === p)) won = true
                    if (newGrid.map(r => r[i]).every(c => c.owner === p)) won = true
                }
                // Diagonals
                if ([0,1,2].every(i => newGrid[i][i].owner === p)) won = true
                if ([0,1,2].every(i => newGrid[i][2-i].owner === p)) won = true

                if (won) winner = p
                else if (newGrid.flat().every(c => c.status === 'correct')) winner = 'draw'

                return {
                    ...prev,
                    grid: newGrid,
                    scores: newScores,
                    roundStatus: winner ? 'round_over' : 'active',
                    winner: winner,
                    currentTurn: winner ? prev.currentTurn : (prev.currentTurn === 'host' ? 'guest' : 'host'),
                    turnExpiry: winner ? null : Date.now() + 20000
                }
            })
            if (!state.winner) setTurnExpiry(Date.now() + 20000) // Reset timer only if game continues
        } else {
             switchTurn(state.currentTurn === 'host' ? 'guest' : 'host')
        }
    }

    const handleNextRound = () => {
        if (!state) return
        
        const { rows, cols } = generateGrid('medium', INITIAL_GRID_SIZE)
        
        setState(prev => {
            if (!prev) return null
             // Empty Grid
            const emptyGrid: GridCell[][] = Array(INITIAL_GRID_SIZE).fill(null).map((_, r) => 
                Array(INITIAL_GRID_SIZE).fill(null).map((_, c) => ({
                    row: r,
                    col: c,
                    status: 'empty',
                    owner: null,
                    player: null
                }))
            )
            
            return {
                ...prev,
                roundNumber: (prev.roundNumber || 1) + 1,
                roundStatus: 'active',
                winner: null,
                grid: emptyGrid,
                criteria: { rows, cols },
                currentTurn: prev.roundNumber % 2 === 0 ? 'host' : 'guest', // Rotate starter
                turnExpiry: Date.now() + 20000
            }
        })
        setTurnExpiry(Date.now() + 20000)
    }

    return {
        state,
        initLocalGame,
        submitMove,
        handleNextRound
    }
}
