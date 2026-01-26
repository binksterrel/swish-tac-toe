"use client"

import { GridCell, BattleState } from "@/lib/battle-types"
import { Criteria } from "@/lib/nba-data"
import { CriteriaHeader } from "../game/criteria-header" // Reusing
import { cn } from "@/lib/utils"
import { getPlayerPhotoUrl } from "@/lib/nba-data"
import { Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BattleGridProps {
  state: BattleState
  role: 'host' | 'guest'
  onCellClick: (row: number, col: number) => void
  selectedCell: { row: number, col: number } | null
  onVoteSkip?: () => void
}

import { useEffect, useState } from "react"
import { GameTimer } from "../game/game-timer"

// ... imports

export function BattleGrid({ state, role, onCellClick, selectedCell, onVoteSkip }: BattleGridProps) {
  const { grid, criteria, turnExpiry } = state
  const isMyTurn = state.currentTurn === role
  const isGameOver = !!state.winner
  
  // Timer Logic
  const [timeLeft, setTimeLeft] = useState(60)
  
  useEffect(() => {
      if (!turnExpiry || isGameOver) return
      
      const interval = setInterval(() => {
          const now = Date.now()
          const diff = Math.max(0, Math.floor((turnExpiry - now) / 1000))
          setTimeLeft(diff)
          
          if (diff === 0 && isMyTurn && !isGameOver) {
               // Trigger Timeout
               fetch('/api/battle/timeout', {
                   method: 'POST', 
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ code: state.code, playerRole: role })
               }).catch(console.error)
          }
      }, 1000)
      
      return () => clearInterval(interval)
  }, [turnExpiry, isMyTurn, isGameOver, state.code, role])

  // Skip Vote Logic
  const [isSkipping, setIsSkipping] = useState(false)
  const hasVotedSkip = state.skipVotes?.[role] || false
  const opponentRole = role === 'host' ? 'guest' : 'host'
  const opponentVoted = state.skipVotes?.[opponentRole] || false

  const handleSkip = async () => {
      if (hasVotedSkip) return
      if (onVoteSkip) onVoteSkip() // Optimistic UI
      
      setIsSkipping(true)
      try {
          await fetch('/api/battle/vote-skip', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: state.code, playerRole: role })
          })
      } finally {
          setIsSkipping(false)
      }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Scoreboard & Round Info - Grid Layout for perfect centering */}
      <div className="grid grid-cols-3 items-end mb-4 px-2">
          {/* Left: Round */}
          <div className="text-left">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Round</div>
              <div className="text-2xl font-heading font-bold text-white leading-none">
                  {state.roundNumber || 1}<span className="text-slate-600 text-lg">/5</span>
              </div>
          </div>
          
          {/* Center: Scores */}
          <div className="flex gap-8 pb-1 justify-center">
              <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-nba-blue leading-none">{state.scores?.host || 0}</div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-nba-red leading-none">{state.scores?.guest || 0}</div>
              </div>
          </div>

          {/* Right: Vote Button */}
          <div className="text-right">
               <Button 
                 variant={hasVotedSkip ? "secondary" : "outline"} 
                 size="sm"
                 onClick={handleSkip}
                 disabled={isSkipping || hasVotedSkip || isGameOver}
                 className={cn(
                     "text-xs uppercase tracking-widest h-8 border-white/20 ml-auto",
                     hasVotedSkip && "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
                     opponentVoted && "animate-pulse border-yellow-500" // Highlight if opponent is waiting
                 )}
               >
                 {isSkipping ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                  hasVotedSkip && opponentVoted ? "Skipping..." :
                  hasVotedSkip ? "Waiting (1/2)..." :
                  opponentVoted ? "Vote Skip (1/2)" :
                  "Vote Skip"}
               </Button>
          </div>
      </div>

      {/* Turn Indicator & Timer */}
      <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md relative overflow-hidden">
             
             {/* Host */}
             <div className={cn("text-center transition-all z-10", state.currentTurn === 'host' ? "scale-110 opacity-100" : "opacity-40 scale-90")}>
                <div className="text-xs uppercase font-bold text-nba-blue mb-1">Host</div>
                <div className="text-xl font-bold text-white truncate max-w-[100px] md:max-w-[150px]">{state.players.host?.name || "Waiting..."}</div>
             </div>
             
             {/* Central Timer */}
             <div className="flex flex-col items-center z-10">
                <div className="mb-2">
                    <GameTimer time={timeLeft} variant={timeLeft <= 10 ? "danger" : "default"} />
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">VS</div>
             </div>

             {/* Guest */}
             <div className={cn("text-center transition-all z-10", state.currentTurn === 'guest' ? "scale-110 opacity-100" : "opacity-40 scale-90")}>
                <div className="text-xs uppercase font-bold text-nba-red mb-1">Guest</div>
                <div className="text-xl font-bold text-white truncate max-w-[100px] md:max-w-[150px]">{state.players.guest?.name || "Waiting..."}</div>
             </div>
             
             {/* Progress Bar Background for Turn? maybe too much */}
          </div>
      </div>

      {state.winner && (
          <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl text-center animate-in zoom-in">
              <h2 className="text-3xl font-heading font-bold uppercase italic text-amber-400">
                  {state.winner === 'draw' ? 'DRAW!' : `${state.players[state.winner]?.name} WINS!`}
              </h2>
          </div>
      )}

      {/* Grid Layout reusing CSS Grid logic from main game */}
      <div className="grid grid-rows-[auto_1fr_1fr_1fr] gap-2">
        {/* ... existing grid code ... */}
        
        {/* Header Row */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2">
           <div className="w-20 md:w-32"></div> {/* Top-Left Spacer */}
           {criteria.cols.map((crit, i) => (
             <div key={`col-header-${i}`} className="w-full aspect-[4/3] flex items-center justify-center">
               <CriteriaHeader criteria={crit} direction="col" />
             </div>
           ))}
        </div>

        {/* Rows */}
        {grid.map((row, rIndex) => (
          <div key={`row-${rIndex}`} className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2">
            
            {/* Row Header */}
            <div className="w-20 md:w-32 flex items-center justify-center">
              <CriteriaHeader criteria={criteria.rows[rIndex]} direction="row" />
            </div>

            {/* Cells */}
            {row.map((cell, cIndex) => {
               const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex
               const isDisabled = cell.status === 'correct' || !isMyTurn || isGameOver
               
               return (
                 <div 
                    key={`cell-${rIndex}-${cIndex}`}
                    onClick={() => !isDisabled && onCellClick(rIndex, cIndex)}
                    className={cn(
                        "relative w-full aspect-square md:aspect-[4/3] rounded-lg border-2 transition-all flex items-center justify-center overflow-hidden cursor-pointer",
                        // Ownership Colors
                        cell.owner === 'host' ? "bg-nba-blue/20 border-nba-blue shadow-[0_0_15px_rgba(29,66,138,0.3)]" : 
                        cell.owner === 'guest' ? "bg-nba-red/20 border-nba-red shadow-[0_0_15px_rgba(206,17,65,0.3)]" : 
                        "bg-white/5 border-white/10 hover:bg-white/10",
                        
                        isSelected && "ring-4 ring-white ring-offset-2 ring-offset-black scale-105 z-10",
                        isDisabled && !cell.player && "opacity-50 cursor-not-allowed",
                        isDisabled && cell.player && "cursor-default"
                    )}
                 >
                    {cell.player ? (
                        <>
                           <img 
                              key={cell.player.id} // Ensure new image on player change
                              src={getPlayerPhotoUrl(cell.player)} 
                              alt={cell.player.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity animate-in fade-in duration-300"
                           />
                           <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2">
                              <p className="text-[10px] md:text-xs font-bold text-center text-white leading-tight truncate">
                                {cell.player.name}
                              </p>
                           </div>
                           {/* Owner Badge */}
                           <div className={cn(
                               "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white text-[10px] font-bold shadow-md",
                               cell.owner === 'host' ? "bg-nba-blue text-white" : "bg-nba-red text-white"
                           )}>
                               {cell.owner === 'host' ? 'P1' : 'P2'}
                           </div>
                        </>
                    ) : (
                        <div className="opacity-0 hover:opacity-100 transition-opacity">
                            {isMyTurn && !isGameOver && <div className="text-xs uppercase font-bold tracking-widest text-white/50">Select</div>}
                        </div>
                    )}
                 </div>
               )
            })}
          </div>
        ))}

      </div>
    </div>
  )
}
