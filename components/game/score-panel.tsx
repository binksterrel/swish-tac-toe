"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { GameTimer } from "./game-timer"
import { useLanguage } from "@/contexts/language-context"

interface ScorePanelProps {
  score: number
  attempts: number
  maxAttempts: number
  correctCells: number
  gameTime: number
  timeLeft?: number
  mode?: "classic" | "time_attack" | "sudden_death" | "blind"
  gridSize?: number
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[4px] sm:gap-s8">
      <span className="truncate text-[11px] sm:text-meta text-ink-muted">{label}</span>
      <span className="font-heading text-lead sm:text-display-sm font-bold tabular-nums text-ink">{children}</span>
    </div>
  )
}

/** Scoreboard strip: four readouts separated by hairlines. */
export function ScorePanel({
  score,
  attempts,
  maxAttempts,
  correctCells,
  gameTime,
  timeLeft,
  mode = "classic",
  gridSize = 3,
}: ScorePanelProps) {
  const { t } = useLanguage()
  const remainingAttempts = maxAttempts - attempts
  const totalCells = gridSize * gridSize
  const displayTime = mode === "time_attack" ? (timeLeft ?? 0) : gameTime
  const isTimeCritical = mode === "time_attack" && (timeLeft ?? 0) < 30
  const lowAttempts = remainingAttempts <= 3 && mode !== "blind"

  return (
    <div className="grid grid-cols-4 rounded-ref border border-line bg-surface [&>*]:min-w-0 [&>*]:px-s8 [&>*]:py-s8 sm:[&>*]:p-s16 md:[&>*]:px-s24 [&>*]:border-line [&>*:not(:last-child)]:border-r">
      <Stat label={t("game.score")}>{score}</Stat>
      <GameTimer time={displayTime} variant={isTimeCritical ? "danger" : "default"} />
      <Stat label={t("game.found")}>
        {correctCells}
        <span className="text-ink-muted">/{totalCells}</span>
      </Stat>
      <div className="flex flex-col gap-[4px] sm:gap-s8">
        <span className="truncate text-[11px] sm:text-meta text-ink-muted">{t("game.attempts")}</span>
        <span className={cn("font-heading text-lead sm:text-display-sm font-bold tabular-nums", lowAttempts ? "text-action" : "text-ink")}>
          {mode === "blind" ? "∞" : remainingAttempts}
          {mode !== "blind" && <span className="text-ink-muted">/{maxAttempts}</span>}
        </span>
      </div>
    </div>
  )
}
