"use client"

import { DifficultySelector } from "./difficulty-selector"
import { GridSizeSelector } from "./grid-size-selector"
import { ModeCard } from "./mode-card"

interface GameConfigPanelProps {
  difficulty: "easy" | "medium" | "hard"
  mode: "classic" | "time_attack" | "sudden_death" | "blind"
  gridSize: number
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void
  onModeChange: (mode: "classic" | "time_attack" | "sudden_death" | "blind") => void
  onGridSizeChange: (size: number) => void
}

export function GameConfigPanel({
  difficulty,
  mode,
  gridSize,
  onDifficultyChange,
  onModeChange,
  onGridSizeChange,
}: GameConfigPanelProps) {
  return (
    <div className="w-full bg-card/20 backdrop-blur-sm border border-border/30 rounded-lg p-3 space-y-2">
      {/* Single row layout */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Difficulty */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Difficulté
          </span>
          <DifficultySelector
            difficulty={difficulty}
            onSelect={onDifficultyChange}
          />
        </div>

        {/* Grid Size */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Grille
          </span>
          <GridSizeSelector
            size={gridSize}
            onSelect={onGridSizeChange}
          />
        </div>

        {/* Mode */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Mode
          </span>
          <div className="flex gap-2">
            {(["classic", "time_attack", "sudden_death", "blind"] as const).map((m) => (
              <ModeCard
                key={m}
                mode={m}
                isSelected={mode === m}
                onSelect={() => onModeChange(m)}
                gridSize={gridSize}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
