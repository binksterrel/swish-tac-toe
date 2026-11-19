"use client"

import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

interface GameTimerProps {
  time: number
  variant?: "default" | "danger"
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/** Shot-clock readout. Danger state changes colour only (no shaking). */
export function GameTimer({ time, variant = "default" }: GameTimerProps) {
  const { t } = useLanguage()
  const isDanger = variant === "danger"

  return (
    <div className="flex flex-col gap-[4px] sm:gap-s8" role="timer" aria-live={isDanger ? "polite" : "off"}>
      <span className="truncate text-[11px] sm:text-meta text-ink-muted">{t("game.shot_clock")}</span>
      <span
        className={cn(
          "font-heading text-lead sm:text-display-sm font-bold tabular-nums tracking-wide transition-colors duration-[200ms] ease-snappy",
          isDanger ? "text-action" : "text-ink",
        )}
      >
        {formatTime(time)}
      </span>
    </div>
  )
}
