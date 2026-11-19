"use client"

import type { ReactNode } from "react"
import { DifficultySelector } from "./difficulty-selector"
import { GridSizeSelector } from "./grid-size-selector"
import { ModeSelector, MODE_LABELS, modeDetail } from "./mode-card"

interface GameConfigPanelProps {
  difficulty: "easy" | "medium" | "hard"
  mode: "classic" | "time_attack" | "sudden_death" | "blind"
  gridSize: number
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void
  onModeChange: (mode: "classic" | "time_attack" | "sudden_death" | "blind") => void
  onGridSizeChange: (size: number) => void
  /** Start / rules / reset, shown in the panel footer */
  actions?: ReactNode
}

export function GameConfigPanel({
  difficulty,
  mode,
  gridSize,
  onDifficultyChange,
  onModeChange,
  onGridSizeChange,
  actions,
}: GameConfigPanelProps) {
  return (
    <div className="rounded-ref border border-line bg-surface p-s16 md:p-s24">
      <div className="flex flex-wrap items-end gap-s16 md:gap-s24">
        <DifficultySelector difficulty={difficulty} onSelect={onDifficultyChange} />
        <GridSizeSelector size={gridSize} onSelect={onGridSizeChange} />
        <ModeSelector mode={mode} gridSize={gridSize} onSelect={onModeChange} />
      </div>
      {/* Footer: summary on the left, actions on the right (stacked on phones) */}
      <div className="mt-s16 flex flex-col gap-s16 border-t border-line pt-s16 md:mt-s24 md:flex-row md:items-center md:justify-between md:pt-s24">
        <p className="text-meta text-ink-muted">
          <span className="font-semibold text-ink-soft">{MODE_LABELS[mode]}</span> · {modeDetail(mode, gridSize)}
        </p>
        {actions}
      </div>
    </div>
  )
}
