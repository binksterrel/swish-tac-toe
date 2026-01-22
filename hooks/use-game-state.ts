"use client"

import { useState, useCallback, useEffect } from "react"
import {
  type Criteria,
  type NBAPlayer,
  generateGrid,
  validatePlayerForCell,
} from "@/lib/nba-data"

export type CellState = {
  player: NBAPlayer | null
  status: "empty" | "correct" | "incorrect"
  score?: number
  isUnicorn?: boolean
}

export type GameState = {
  grid: CellState[][]
  rows: Criteria[]
  cols: Criteria[]
  score: number
  attempts: number
  maxAttempts: number
  usedPlayers: Set<string>
  selectedCell: { row: number; col: number } | null
  gameOver: boolean
  won: boolean
  difficulty: "easy" | "medium" | "hard"
  mode: "classic" | "time_attack" | "sudden_death" | "blind"
  timeLeft: number // For Time Attack
  gridSize: number
}

const INITIAL_MAX_ATTEMPTS = 15
const TIME_ATTACK_DURATION = 90 // 1 minute 30 seconds

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Timer State
  const [gameTime, setGameTime] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)

  // Initialize game
  const initGame = useCallback((
    difficulty: "easy" | "medium" | "hard" = "medium", 
    mode: "classic" | "time_attack" | "sudden_death" | "blind" = "classic",
    size: number = 3
  ) => {
    const { rows, cols } = generateGrid(difficulty, size)
    
    const grid: CellState[][] = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({ player: null, status: "empty" as const }))
      )

    // Calculate Max Attempts based on size
    let maxAttempts = INITIAL_MAX_ATTEMPTS
    let calculatedTime = TIME_ATTACK_DURATION

    if (size === 4) {
        maxAttempts = 25
        calculatedTime = 180 // 3 minutes
    }
    if (size === 5) {
        maxAttempts = 40
        calculatedTime = 300 // 5 minutes
    }

    if (mode === "sudden_death") maxAttempts = size * size // Must fill precisely, but logic says game over on 1 error anyway
    if (mode === "blind") maxAttempts = 999

    setGameState({
      grid,
      rows,
      cols,
      score: 0,
      attempts: 0,
      maxAttempts,
      usedPlayers: new Set(),
      selectedCell: null,
      gameOver: false,
      won: false,
      difficulty,
      mode,
      timeLeft: calculatedTime,
      gridSize: size
    })
    
    // Reset Timer but DO NOT start it yet
    setGameTime(0)
    setIsGameActive(false) 
    setIsLoading(false)
  }, [])

  const startGame = useCallback(() => {
    setIsGameActive(true)
  }, [])

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGameActive && gameState && !gameState.gameOver) {
      interval = setInterval(() => {
        setGameTime((prev) => prev + 1)
        
        if (gameState.mode === "time_attack") {
            setGameState(prev => {
                if (!prev) return null
                const newTimeLeft = prev.timeLeft - 1
                if (newTimeLeft <= 0) {
                    return { ...prev, timeLeft: 0, gameOver: true }
                }
                return { ...prev, timeLeft: newTimeLeft }
            })
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isGameActive, gameState?.gameOver])

  // Load saved game or start new one
  useEffect(() => {
    const savedGame = localStorage.getItem("nba-ttt-game")
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame)
        
        // Validate state structure
        if (!parsed.rows || !parsed.cols || !parsed.grid) {
          throw new Error("Invalid state structure")
        }

        // Convert usedPlayers back to Set
        parsed.usedPlayers = new Set(parsed.usedPlayers)
        setGameState(parsed)
        setIsLoading(false)
        setIsGameActive(false) // Saved games start paused until interaction? Or maybe just false to force resume click if we wanted. For now let's keep it safe.
      } catch (err) {
        console.error("Failed to load saved game:", err)
        localStorage.removeItem("nba-ttt-game")
        initGame("medium", "classic")
      }
    } else {
      initGame("medium", "classic")
    }
  }, [initGame])

  // Save game state
  useEffect(() => {
    if (gameState) {
      const toSave = {
        ...gameState,
        usedPlayers: Array.from(gameState.usedPlayers),
      }
      localStorage.setItem("nba-ttt-game", JSON.stringify(toSave))
    }
  }, [gameState])

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // Prevent interaction if game is not active
      if (!isGameActive) return
      
      if (!gameState || gameState.gameOver || gameState.grid[row][col].status === "correct") return

      // If clicking the already selected cell, deselect it
      if (gameState.selectedCell?.row === row && gameState.selectedCell?.col === col) {
        setGameState((prev) => (prev ? { ...prev, selectedCell: null } : null))
        return
      }

      setGameState((prev) => (prev ? { ...prev, selectedCell: { row, col } } : null))
    },
    [gameState, isGameActive]
  )

  const handlePlayerSelect = useCallback(
    (player: NBAPlayer) => {
      if (!gameState || !gameState.selectedCell) return

      const { row, col } = gameState.selectedCell
      const rowCriteria = gameState.rows[row]
      const colCriteria = gameState.cols[col]

      const validationResult = validatePlayerForCell(player, rowCriteria, colCriteria)
      const isAlreadyUsed = gameState.usedPlayers.has(player.id)

      if (isAlreadyUsed) {
        // Handle repeated player use if necessary (e.g., show toast)
        // For now, treat as incorrect to prevent spamming
      }

      setGameState((prev) => {
        if (!prev) return null

        const newGrid = [...prev.grid.map((r) => [...r])]
        const newUsedPlayers = new Set(prev.usedPlayers)
        
        let newScore = prev.score
        
        // SCORING LOGIC: Shot Clock Style + Rarity Bonus
        // Base 1000 points - (Time elapsed * 2)
        // Rarity Multiplier: x3 if NOT an All-Star (Unicorn), x1 otherwise
        if (validationResult.valid) {
            const timePenalty = gameTime * 2
            const baseScore = Math.max(100, 1000 - timePenalty)
            
            // Unicorn Bonus
            const isUnicorn = !player.allStar
            const multiplier = isUnicorn ? 3 : 1
            
            const cellScore = baseScore * multiplier
            newScore += cellScore
            
            // Time Attack Bonus
            let newTimeLeft = prev.timeLeft
            if (prev.mode === "time_attack") {
                newTimeLeft = Math.min(newTimeLeft + 10, TIME_ATTACK_DURATION) // Cap at max? Or unlimited? Let's cap at max for balance or allow overflow? "3 minutes to fill" suggests limit.
                // User said "rajoute +10s". Usually time attack allows going beyond start. Let's allow it.
                newTimeLeft = prev.timeLeft + 10
            }
            
            // Update cell with player AND score info
            newGrid[row][col] = { 
              player, 
              status: "correct",
              score: cellScore,
              isUnicorn
            }
            
            // We still track used players
            newUsedPlayers.add(player.id)
        } else {
          newGrid[row][col] = { ...newGrid[row][col], status: "incorrect" }
          
          // Time Attack Penalty
          if (prev.mode === "time_attack") {
              const penaltyTime = prev.timeLeft - 20
              // Check for game over immediately? The timer effect handles 0, but immediate penalty might kill.
              if (penaltyTime <= 0) {
                 // Game Over in next state update
              }
             // Actually we should update state specifically.
          }
        }
        
        const isGameWon = newGrid.every((r) => r.every((c) => c.status === "correct"))

        let newTimeLeftFinal = prev.timeLeft
        let isGameOver = false
        
        if (prev.mode === "time_attack") {
             if (validationResult.valid) {
                 newTimeLeftFinal = prev.timeLeft + 10
             } else {
                 newTimeLeftFinal = Math.max(0, prev.timeLeft - 20)
             }
             if (newTimeLeftFinal <= 0) isGameOver = true
        } else if (prev.mode === "sudden_death") {
             // Sudden Death: Game Over on any error
             if (!validationResult.valid) {
                 isGameOver = true
             }
             // Also check standard 9 attempts (which is maxAttempts anyway)
             const newAttempts = prev.attempts + 1
             if (newAttempts >= prev.maxAttempts) isGameOver = true
        } else {
             // Classic and Blind attempts limit
             const newAttempts = prev.attempts + 1
             // For Blind mode, maxAttempts is 999, so this check works fine
             if (newAttempts >= prev.maxAttempts) isGameOver = true
        }

        if (isGameWon) isGameOver = true
        
        if (isGameOver) {
            setIsGameActive(false)
        }

        return {
          ...prev,
          grid: newGrid,
          score: newScore,
          attempts: prev.attempts + 1, // Always increment attempts for stats
          timeLeft: newTimeLeftFinal,
          usedPlayers: newUsedPlayers,
          selectedCell: null, // Deselect after move
          gameOver: isGameOver,
          won: isGameWon,
        }
      })
    },
    [gameState, gameTime]
  )

  return {
    gameState,
    isLoading,
    initGame,
    startGame,
    isGameActive,
    handleCellClick, 
    handlePlayerSelect, 
    gameTime,
  }
}
