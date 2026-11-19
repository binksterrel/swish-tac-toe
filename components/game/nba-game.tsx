"use client"

import { useGameState } from "@/hooks/use-game-state"
import { GameGrid } from "./game-grid"
import { PlayerInput } from "./player-input"
import { ScorePanel } from "./score-panel"
import { GameOverModal } from "./game-over-modal"
import { GameConfigPanel } from "./game-config-panel"
import { RotateCcw, HelpCircle, Play } from "lucide-react"
import { useState, useEffect, useRef } from "react"
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
  const playAreaRef = useRef<HTMLDivElement>(null)

  // When the game starts, bring the scoreboard + grid into view together.
  useEffect(() => {
    if (!isGameActive || !playAreaRef.current) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    playAreaRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  }, [isGameActive])
  const [showGameOverModal, setShowGameOverModal] = useState(false)

  useEffect(() => {
    if (gameState?.gameOver) {
      const timer = setTimeout(() => setShowGameOverModal(true), 2500)
      return () => clearTimeout(timer)
    } else {
      setShowGameOverModal(false)
    }
  }, [gameState?.gameOver])

  if (isLoading || !gameState) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-s16">
          <div className="size-8 animate-spin rounded-full border-2 border-line border-t-ink" />
          <p className="text-meta text-ink-muted">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const correctCells = gameState.grid
    .flat()
    .filter((c) => c.status === "correct").length

  const ghostBtn =
    "inline-flex h-10 items-center gap-s8 rounded-nested px-s16 font-medium text-ink-soft transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"

  return (
    <div className="flex flex-col gap-s24">
      <GameConfigPanel
        difficulty={gameState.difficulty}
        mode={gameState.mode}
        gridSize={gameState.gridSize}
        onDifficultyChange={(d: "easy" | "medium" | "hard") => initGame(d, gameState.mode, gameState.gridSize)}
        onModeChange={(m: "classic" | "time_attack" | "sudden_death" | "blind") => initGame(gameState.difficulty, m, gameState.gridSize)}
        onGridSizeChange={(s: number) => initGame(gameState.difficulty, gameState.mode, s)}
        actions={
          <div className="flex flex-wrap items-center gap-s8 md:flex-row-reverse">
            {!isGameActive && !gameState.gameOver && (
              <button
                type="button"
                onClick={startGame}
                className="chamfer group inline-flex h-11 sm:h-12 items-center gap-s8 bg-action px-s24 font-heading text-meta sm:text-body font-bold uppercase tracking-wider text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover active:translate-y-px focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
              >
                <Play className="size-4" strokeWidth={1.75} />
                {t('game.start_game')}
              </button>
            )}
            {isGameActive && (
              <span className="inline-flex h-11 sm:h-12 items-center gap-s8 px-s8 text-meta font-semibold text-ink-soft">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-action opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-action" />
                </span>
                En cours
              </span>
            )}
            <button type="button" onClick={() => initGame(gameState.difficulty, gameState.mode, gameState.gridSize)} className={ghostBtn}>
              <RotateCcw className="size-4" strokeWidth={1.75} />
              {t('game.reset')}
            </button>
            <button type="button" onClick={() => setShowHelp(!showHelp)} aria-expanded={showHelp} className={ghostBtn}>
              <HelpCircle className="size-4" strokeWidth={1.75} />
              {t('game.rules')}
            </button>
          </div>
        }
      />

      {/* Rules: unfolds from the Rules button row */}
      {showHelp && (
        <div className="origin-top rounded-ref border border-line bg-surface p-s16 md:p-s24 animate-in fade-in slide-in-from-top-1 duration-200 ease-out">
          <h3 className="font-heading text-lead font-bold uppercase tracking-tight text-ink">{t('game.rules')}</h3>
          <p className="mt-s8 max-w-[65ch] text-ink-muted">{t('game.rules_description')}</p>
        </div>
      )}

      {/* Play area: scoreboard + grid, sized to fit one viewport */}
      <div ref={playAreaRef} className="flex scroll-mt-s16 flex-col gap-s16">
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
      <div className="relative">
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
              <span className="rounded-ref border border-line bg-surface/90 px-s24 py-s16 font-heading text-lead font-bold uppercase tracking-wide text-ink shadow-raised backdrop-blur-sm">
                {t('game.waiting_tipoff')}
              </span>
           </div>
        )}
      </div>

      </div>

      {/* Player Input Modal */}
      {gameState.selectedCell && (
        <PlayerInput
          onSubmit={handlePlayerSelect}
          onCancel={() => handleCellClick(gameState.selectedCell!.row, gameState.selectedCell!.col)}
          usedPlayers={gameState.usedPlayers}
          rowLabel={gameState.rows[gameState.selectedCell.row].label}
          colLabel={gameState.cols[gameState.selectedCell.col].label}
          rowType={gameState.rows[gameState.selectedCell.row].type}
          colType={gameState.cols[gameState.selectedCell.col].type}
          hiddenLabels={gameState.mode === "blind"}
        />
      )}

      {/* Game Over Modal */}
      {showGameOverModal && gameState.gameOver && (
        <GameOverModal
          won={gameState.won}
          score={gameState.score}
          correctCells={correctCells}
          onNewGame={() => initGame(gameState.difficulty, gameState.mode, gameState.gridSize)}
          gridSize={gameState.gridSize}
          gameTime={gameTime}
        />
      )}
    </div>
  )
}
