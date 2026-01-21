"use client"

import { cn } from "@/lib/utils"
import { Trophy, Target, Zap } from "lucide-react"
import { GameTimer } from "./game-timer"

interface ScorePanelProps {
  score: number
  attempts: number
  maxAttempts: number
  correctCells: number
  gameTime: number
}

export function ScorePanel({
  score,
  attempts,
  maxAttempts,
  correctCells,
  gameTime,
}: ScorePanelProps) {
  const remainingAttempts = maxAttempts - attempts

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
      {/* Score */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 md:px-4 md:py-2">
        <Trophy className="w-4 h-4 md:w-5 md:h-5 text-accent" />
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
            Score
          </span>
          <span className="text-lg md:text-xl font-bold text-foreground">
            {score}
          </span>
        </div>
      </div>
      
      {/* Timer (Moved here) */}
      <GameTimer time={gameTime} />

      {/* Correct Cells */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 md:px-4 md:py-2">
        <Target className="w-4 h-4 md:w-5 md:h-5 text-success" />
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
            Trouvés
          </span>
          <span className="text-lg md:text-xl font-bold text-foreground">
            {correctCells}/9
          </span>
        </div>
      </div>

      {/* Remaining Attempts */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 md:px-4 md:py-2">
        <Zap
          className={cn(
            "w-4 h-4 md:w-5 md:h-5",
            remainingAttempts <= 3 ? "text-destructive" : "text-primary"
          )}
        />
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
            Essais
          </span>
          <span
            className={cn(
              "text-lg md:text-xl font-bold",
              remainingAttempts <= 3 ? "text-destructive" : "text-foreground"
            )}
          >
            {remainingAttempts}
          </span>
        </div>
      </div>
    </div>
  )
}
