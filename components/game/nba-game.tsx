"use client"

import { useGameState } from "@/hooks/use-game-state"
import { GameGrid } from "./game-grid"
import { PlayerInput } from "./player-input"
import { ScorePanel } from "./score-panel"
import { GameOverModal } from "./game-over-modal"
import { DifficultySelector } from "./difficulty-selector"
import { Button } from "@/components/ui/button"
import { RotateCcw, HelpCircle, Play } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function NBAGame() {
  const {
    gameState,
    isLoading,
    handleCellClick,
    handlePlayerSelect,
    initGame,
    startGame,
    isGameActive,
    gameTime,
  } = useGameState()

  const [showHelp, setShowHelp] = useState(false)

  if (isLoading || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading Arena...</p>
        </div>
      </div>
    )
  }

  const correctCells = gameState.grid
    .flat()
    .filter((c) => c.status === "correct").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Difficulty */}
        <DifficultySelector
          difficulty={gameState.difficulty}
          onSelect={(d) => initGame(d)}
        />

        {/* Center: Start Button */}
        <div className="flex-1 flex justify-center">
          {!isGameActive && !gameState.gameOver && (
            <Button 
              size="lg" 
              className="bg-nba-red hover:bg-red-700 text-white font-heading text-xl uppercase tracking-widest px-8 shadow-lg animate-pulse"
              onClick={startGame}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Start Game
            </Button>
          )}
          {isGameActive && (
             <div className="text-zinc-500 font-bold uppercase tracking-widest text-sm animate-pulse">
               LIVE
             </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="border-2 border-slate-200 text-muted-foreground hover:border-nba-blue hover:bg-nba-blue hover:text-white transition-all duration-300 font-heading uppercase tracking-wider"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Rules
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => initGame(gameState.difficulty)}
            className="border-2 border-slate-200 text-muted-foreground hover:border-nba-red hover:bg-nba-red hover:text-white transition-all duration-300 font-heading uppercase tracking-wider"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-card border border-border rounded-xl p-4 text-sm">
          <h3 className="font-bold text-foreground mb-2">Comment jouer</h3>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>Cliquez sur **Start Game** pour lancer le chrono</li>
            <li>Cliquez sur une case vide pour la sélectionner</li>
            <li>Entrez un joueur NBA qui correspond à la fois aux critères de la ligne ET de la colonne</li>
            <li>Vous pouvez utilisez le même joueur plusieurs fois</li>
            <li>Attention au chrono : plus vous êtes lent, moins vous marquez de points !</li>
          </ul>
        </div>
      )}

      {/* Score Panel (Now includes Timer) */}
      <ScorePanel
        score={gameState.score}
        attempts={gameState.attempts}
        maxAttempts={gameState.maxAttempts}
        correctCells={correctCells}
        gameTime={gameTime}
      />

      {/* Game Grid */}
      <div className={cn("relative transition-all duration-500", !isGameActive && !gameState.gameOver && "blur-none")}>
        <GameGrid
          grid={gameState.grid}
          rows={gameState.rows}
          cols={gameState.cols}
          selectedCell={gameState.selectedCell}
          onCellClick={handleCellClick}
          disabled={gameState.gameOver || !isGameActive}
          hidden={!isGameActive && !gameState.gameOver}
        />
        
        {/* Overlay if not active */}
        {!isGameActive && !gameState.gameOver && (
           <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="bg-black/80 text-white px-6 py-3 font-heading text-2xl uppercase border-2 border-nba-red rounded-sm">
                Waiting for Tip-Off
              </span>
           </div>
        )}
      </div>

      {/* Player Input Modal */}
      {gameState.selectedCell && (
        <PlayerInput
          onSubmit={handlePlayerSelect}
          onCancel={() => handleCellClick(gameState.selectedCell!.row, gameState.selectedCell!.col)}
          usedPlayers={gameState.usedPlayers}
          rowLabel={gameState.rows[gameState.selectedCell.row].label}
          colLabel={gameState.cols[gameState.selectedCell.col].label}
        />
      )}

      {/* Game Over Modal */}
      {gameState.gameOver && (
        <GameOverModal
          won={gameState.won}
          score={gameState.score}
          correctCells={correctCells}
          onNewGame={() => initGame(gameState.difficulty)}
        />
      )}
    </div>
  )
}
