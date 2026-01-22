"use client"

import { cn } from "@/lib/utils"
import { Gamepad2, Timer, Target, EyeOff } from "lucide-react"

interface ModeCardProps {
  mode: "classic" | "time_attack" | "sudden_death" | "blind"
  isSelected: boolean
  onSelect: () => void
  gridSize: number
}

export function ModeCard({ mode, isSelected, onSelect, gridSize }: ModeCardProps) {
  const modeConfig = {
    classic: {
      icon: Gamepad2,
      label: "CLASSIC",
      detail: gridSize === 3 ? "15 ess." : gridSize === 4 ? "25 ess." : "40 ess.",
      color: "text-blue-400",
      borderColor: "border-blue-500",
      bgColor: "bg-blue-500/10",
    },
    time_attack: {
      icon: Timer,
      label: "CHRONO",
      detail: gridSize === 3 ? "90s" : gridSize === 4 ? "3min" : "5min",
      color: "text-orange-400",
      borderColor: "border-orange-500",
      bgColor: "bg-orange-500/10",
    },
    sudden_death: {
      icon: Target,
      label: "SNIPER",
      detail: "1 vie",
      color: "text-red-400",
      borderColor: "border-red-500",
      bgColor: "bg-red-500/10",
    },
    blind: {
      icon: EyeOff,
      label: "BLIND",
      detail: "∞",
      color: "text-purple-400",
      borderColor: "border-purple-500",
      bgColor: "bg-purple-500/10",
    },
  }

  const config = modeConfig[mode]
  const Icon = config.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      title={`${config.label} - ${config.detail}`}
      className={cn(
        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md border transition-all duration-200 min-w-[50px] group relative",
        isSelected
          ? cn("scale-105", config.borderColor, config.bgColor)
          : "border-border/50 bg-card/40 hover:border-border"
      )}
    >
      {/* Icon */}
      <Icon className={cn(
        "w-4 h-4",
        isSelected ? config.color : "text-muted-foreground"
      )} />

      {/* Label */}
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-wide",
        isSelected ? config.color : "text-muted-foreground"
      )}>
        {config.label}
      </span>
    </button>
  )
}
