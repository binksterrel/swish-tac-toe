"use client"

import { useGameState } from "@/hooks/use-game-state"
import { GameGrid } from "./game-grid"
import { PlayerInput } from "./player-input"
import { ScorePanel } from "./score-panel"
import { GameOverModal } from "./game-over-modal"
import { DifficultySelector } from "./difficulty-selector"
import { GameConfigPanel } from "./game-config-panel"
import { Button } from "@/components/ui/button"
import { RotateCcw, HelpCircle, Play } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export function NBAGame() {
  const { t } = useLanguage()
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
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const correctCells = gameState.grid
    .flat()
    .filter((c) => c.status === "correct").length

  return (
    <div className="flex flex-col gap-6">
      {/* Game Configuration Panel */}
      <GameConfigPanel
        difficulty={gameState.difficulty}
        mode={gameState.mode}
        gridSize={gameState.gridSize}
        onDifficultyChange={(d: "easy" | "medium" | "hard") => initGame(d, gameState.mode, gameState.gridSize)}
        onModeChange={(m: "classic" | "time_attack" | "sudden_death" | "blind") => initGame(gameState.difficulty, m, gameState.gridSize)}
        onGridSizeChange={(s: number) => initGame(gameState.difficulty, gameState.mode, s)}
      />

      {/* Game Actions - Compact row */}
      <div className="flex items-center justify-center gap-2">
        {/* Start Button */}
        {!isGameActive && !gameState.gameOver && (
          <Button 
            size="sm" 
            className="bg-nba-red hover:bg-red-700 text-white font-heading text-xs uppercase tracking-widest px-4 shadow-md"
            onClick={startGame}
          >
            <Play className="w-3 h-3 mr-1 fill-current" />
            {t('game.start_game')}
          </Button>
        )}
        {isGameActive && (
          <span className="text-green-500 font-bold uppercase tracking-widest text-xs px-3 py-1 border border-green-500/30 rounded-md bg-green-500/10">
            🔴 LIVE
          </span>
        )}
        
        {/* Help & Reset */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHelp(!showHelp)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          <HelpCircle className="w-3 h-3 mr-1" />
          {t('game.rules')}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => initGame(gameState.difficulty, gameState.mode, gameState.gridSize)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          {t('game.reset')}
        </Button>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-card border border-border rounded-xl p-4 text-sm">
          <h3 className="font-bold text-foreground mb-2">{t('game.rules')}</h3>
          <p className="text-muted-foreground">{t('game.rules_description')}</p>
        </div>
      )}

      {/* Score Panel (Now includes Timer) */}
      <ScorePanel
        score={gameState.score}
        attempts={gameState.attempts}
        maxAttempts={gameState.maxAttempts}
        correctCells={correctCells}
        gameTime={gameTime}
        timeLeft={gameState.timeLeft}
        mode={gameState.mode}
        gridSize={gameState.gridSize}
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
          mode={gameState.mode}
          size={gameState.gridSize}
        />
        
        {/* Overlay if not active */}
        {!isGameActive && !gameState.gameOver && (
           <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="bg-black/80 text-white px-6 py-3 font-heading text-2xl uppercase border-2 border-nba-red rounded-sm">
                {t('game.waiting_tipoff')}
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
          hiddenLabels={gameState.mode === "blind"}
        />
      )}

      {/* Game Over Modal */}
      {gameState.gameOver && (
        <GameOverModal
          won={gameState.won}
          score={gameState.score}
          correctCells={correctCells}
          onNewGame={() => initGame(gameState.difficulty, gameState.mode, gameState.gridSize)}
          gridSize={gameState.gridSize}
        />
      )}
    </div>
  )
}
