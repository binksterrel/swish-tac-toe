"use client"

import { cn } from "@/lib/utils"
import { Flame, Zap, Trophy, Crown } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface DifficultySelectorProps {
  difficulty: "easy" | "medium" | "hard"
  onSelect: (difficulty: "easy" | "medium" | "hard") => void
}

export function DifficultySelector({
  difficulty,
  onSelect,
}: DifficultySelectorProps) {
  const { t } = useLanguage()

  const difficulties = [
    {
      value: "easy" as const,
      label: t('game.diff_easy'),
      icon: Zap,
      color: "text-green-400",
      bgSelected: "bg-green-500/20 border-green-500/50",
    },
    {
      value: "medium" as const,
      label: t('game.diff_medium'),
      icon: Flame,
      color: "text-orange-400",
      bgSelected: "bg-orange-500/20 border-orange-500/50",
    },
    {
      value: "hard" as const,
      label: t('game.diff_hard'),
      icon: Crown,
      color: "text-purple-400",
      bgSelected: "bg-purple-500/20 border-purple-500/50",
    },
  ]

  return (
    <div className="flex p-0.5 bg-card/40 backdrop-blur-md rounded-lg border border-border/50">
      {difficulties.map((d) => {
        const Icon = d.icon
        const isSelected = difficulty === d.value
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => onSelect(d.value)}
            className={cn(
              "flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all duration-200",
              isSelected
                ? cn("scale-105 border", d.bgSelected, d.color)
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Icon className={cn("w-3 h-3", isSelected ? "" : "")} />
            <span className="">{d.label}</span>
          </button>
        )
      })}
    </div>
  )
}
