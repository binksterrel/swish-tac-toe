"use client"

import { Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

interface GameTimerProps {
  time: number
  variant?: "default" | "danger"
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  // Pad with zeros for digital clock look: 04:05
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function GameTimer({ time, variant = "default" }: GameTimerProps) {
  const { t } = useLanguage()
  
  const textColor = variant === "danger" ? "text-nba-red animate-pulse" : "text-nba-red"
  
  return (
    <div className="flex items-center gap-2 bg-black border-2 border-zinc-800 px-4 py-2 rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      {/* Icon - Broadcast Style */}
      <Clock className="w-5 h-5 text-zinc-500" />
      
      <div className="flex flex-col items-center leading-none">
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{t('game.shot_clock')}</span>
        
        {/* Digital LED Display */}
        <span className={cn("text-3xl font-heading font-normal tracking-widest tabular-nums", textColor)} style={{ textShadow: "0 0 10px rgba(201, 8, 42, 0.5)" }}>
          {formatTime(time)}
        </span>
      </div>
    </div>
  )
}
