"use client"

import { cn } from "@/lib/utils"
import { Flame, Zap, Trophy, Crown } from "lucide-react"

interface DifficultySelectorProps {
  difficulty: "easy" | "medium" | "hard"
  onSelect: (difficulty: "easy" | "medium" | "hard") => void
}

export function DifficultySelector({
  difficulty,
  onSelect,
}: DifficultySelectorProps) {
  const difficulties = [
    {
      value: "easy" as const,
      label: "Rookie",
      icon: Zap,
      color: "text-green-400",
      bgSelected: "bg-green-500/20 border-green-500/50",
    },
    {
      value: "medium" as const,
      label: "Pro",
      icon: Flame,
      color: "text-orange-400",
      bgSelected: "bg-orange-500/20 border-orange-500/50",
    },
    {
      value: "hard" as const,
      label: "Legend",
      icon: Crown,
      color: "text-purple-400",
      bgSelected: "bg-purple-500/20 border-purple-500/50",
    },
  ]

  return (
    <div className="flex p-1 bg-card/40 backdrop-blur-md rounded-xl border border-border/50">
      {difficulties.map((d) => {
        const Icon = d.icon
        const isSelected = difficulty === d.value
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => onSelect(d.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wide transition-all duration-300",
              isSelected
                ? cn("shadow-lg scale-105 border", d.bgSelected, d.color)
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Icon className={cn("w-4 h-4 md:w-5 md:h-5", isSelected ? "animate-pulse" : "")} />
            <span className="">{d.label}</span>
          </button>
        )
      })}
    </div>
  )
}
