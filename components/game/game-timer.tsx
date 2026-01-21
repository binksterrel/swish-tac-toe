"use client"

import { Clock } from "lucide-react"

interface GameTimerProps {
  time: number
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  // Pad with zeros for digital clock look: 04:05
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function GameTimer({ time }: GameTimerProps) {
  return (
    <div className="flex items-center gap-2 bg-black border-2 border-zinc-800 px-4 py-2 rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      {/* Icon - Broadcast Style */}
      <Clock className="w-5 h-5 text-zinc-500" />
      
      <div className="flex flex-col items-center leading-none">
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">SHOT CLOCK</span>
        
        {/* Digital LED Display */}
        <span className="text-3xl font-heading font-normal text-nba-red tracking-widest tabular-nums" style={{ textShadow: "0 0 10px rgba(201, 8, 42, 0.5)" }}>
          {formatTime(time)}
        </span>
      </div>
    </div>
  )
}
