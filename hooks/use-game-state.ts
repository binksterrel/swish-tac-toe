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
}

const INITIAL_MAX_ATTEMPTS = 9

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Timer State
  const [gameTime, setGameTime] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)

  // Initialize game
  const initGame = useCallback((difficulty: "easy" | "medium" | "hard" = "medium") => {
    const { rows, cols } = generateGrid(difficulty)
    
    const grid: CellState[][] = Array(3)
      .fill(null)
      .map(() =>
        Array(3)
          .fill(null)
          .map(() => ({ player: null, status: "empty" as const }))
      )

    setGameState({
      grid,
      rows,
      cols,
      score: 0,
      attempts: 0,
      maxAttempts: INITIAL_MAX_ATTEMPTS,
      usedPlayers: new Set(),
      selectedCell: null,
      gameOver: false,
      won: false,
      difficulty,
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
        initGame("medium")
      }
    } else {
      initGame("medium")
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
        
        // SCORING LOGIC: Shot Clock Style (Swish Scoring)
        // Base 1000 points - (Time elapsed * 2)
        // Encourages speed. Minimum 100 points.
        if (validationResult.valid) {
            const timePenalty = gameTime * 2
            const cellScore = Math.max(100, 1000 - timePenalty)
            newScore += cellScore
        }

        if (validationResult.valid) {
          newGrid[row][col] = { player, status: "correct" }
          // We still track used players, but we don't block them anymore
          newUsedPlayers.add(player.id)
        } else {
          newGrid[row][col] = { ...newGrid[row][col], status: "incorrect" }
        }

        const newAttempts = prev.attempts + 1
        const isGameWon = newGrid.every((r) => r.every((c) => c.status === "correct"))
        const isGameOver = newAttempts >= prev.maxAttempts || isGameWon
        
        if (isGameOver) {
            setIsGameActive(false)
        }

        return {
          ...prev,
          grid: newGrid,
          score: newScore,
          attempts: newAttempts,
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
    startGame, // New Function
    isGameActive, // New State Export
    handleCellClick, 
    handlePlayerSelect, 
    gameTime,
  }
}
