"use client"

import { GridCell, BattleState } from "@/lib/battle-types"
import { Criteria, getTeamLogoUrl } from "@/lib/nba-data"
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
import { BattleGameOverModal } from "./battle-game-over-modal"
import { useLanguage } from "@/contexts/language-context"
// ... imports

export function BattleGrid({ state, role, onCellClick, selectedCell, onVoteSkip, onNextRound }: BattleGridProps & { onNextRound?: (action: 'continue' | 'forfeit') => void }) {
  const { t } = useLanguage()
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

  // Auto-Transition to Next Round (5 seconds countdown)
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null)
  const isRoundOver = !!state.winner && (state.roundNumber || 1) < 5 // Round won, but not final round
  const isFinalGameOver = !!state.winner && (state.roundNumber || 1) >= 5 // Final game is over

  useEffect(() => {
    if (isRoundOver && !isFinalGameOver) {
      // Start 5 second countdown
      setNextRoundCountdown(5)
      
      const interval = setInterval(() => {
        setNextRoundCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            // Auto-trigger next round
            fetch('/api/battle/next-round', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: state.code, role, action: 'continue' })
            }).catch(console.error)
            return null
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(interval)
    } else {
      setNextRoundCountdown(null)
    }
  }, [isRoundOver, isFinalGameOver, state.code, role])

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Scoreboard & Round Info - Grid Layout for perfect centering */}
      <div className="grid grid-cols-3 items-end mb-4 px-2">
          {/* Left: Round */}
          <div className="text-left">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t('battle.round')}</div>
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
                  hasVotedSkip && opponentVoted ? t('battle.passing') :
                  hasVotedSkip ? `${t('battle.en_attente')} (1/2)...` :
                  opponentVoted ? `${t('battle.passer')} (1/2)` :
                  t('battle.vote_skip')}
               </Button>

          </div>
      </div>

          {/* Turn Indicator & Timer */}
          <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md relative overflow-hidden">
             
             {/* Host */}
             {(() => {
               const rawName = state.players.host?.name || "En attente..."
               const [teamCode, displayName] = rawName.includes('|') ? rawName.split('|') : [null, rawName]
               return (
                 <div className={cn("text-center transition-all z-10 flex items-center gap-2", state.currentTurn === 'host' ? "scale-110 opacity-100" : "opacity-40 scale-90")}>
                   {teamCode && (
                     <img src={getTeamLogoUrl(teamCode)} alt={teamCode} className="w-10 h-10 object-contain" />
                   )}
                   <div>
                     <div className="text-xs uppercase font-bold text-nba-blue mb-1">{t('battle.host')}</div>
                     <div className="text-lg font-bold text-white truncate max-w-[80px] md:max-w-[120px]">{displayName}</div>
                   </div>
                 </div>
               )
             })()}
             
             {/* Central Timer */}
             <div className="flex flex-col items-center z-10">
                <div className="mb-2">
                    <GameTimer time={timeLeft} variant={timeLeft <= 10 ? "danger" : "default"} />
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">VS</div>
             </div>

             {/* Guest */}
             {(() => {
               const rawName = state.players.guest?.name || "En attente..."
               const [teamCode, displayName] = rawName.includes('|') ? rawName.split('|') : [null, rawName]
               return (
                 <div className={cn("text-center transition-all z-10 flex items-center gap-2", state.currentTurn === 'guest' ? "scale-110 opacity-100" : "opacity-40 scale-90")}>
                   <div>
                     <div className="text-xs uppercase font-bold text-nba-red mb-1">{t('battle.guest')}</div>
                     <div className="text-lg font-bold text-white truncate max-w-[80px] md:max-w-[120px]">{displayName}</div>
                   </div>
                   {teamCode && (
                     <img src={getTeamLogoUrl(teamCode)} alt={teamCode} className="w-10 h-10 object-contain" />
                   )}
                 </div>
               )
             })()}
          </div>
      </div>

      {state.winner && (
          <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl text-center animate-in zoom-in">
              <h2 className="text-3xl font-heading font-bold uppercase italic text-amber-400">
                  {state.winner === 'draw' ? t('battle.draw').toUpperCase() : 
                   isFinalGameOver ? `${state.players[state.winner as 'host'|'guest']?.name || 'Gagnant'} ${t('battle.champion')}` :
                   `${state.players[state.winner as 'host'|'guest']?.name || 'Gagnant'} ${t('battle.wins_round')}`}
              </h2>
              {isRoundOver && nextRoundCountdown !== null && (
                <p className="text-amber-300/80 text-sm mt-2 animate-pulse">
                  {t('battle.next_round_in')} <span className="font-bold text-xl">{nextRoundCountdown}</span>s...
                </p>
              )}
          </div>
      )}

      <div className="grid grid-rows-[auto_1fr_1fr_1fr] gap-2">
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
                              key={cell.player.id} 
                              src={getPlayerPhotoUrl(cell.player)} 
                              alt={cell.player.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity animate-in fade-in duration-300"
                           />
                           <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2">
                              <p className="text-[10px] md:text-xs font-bold text-center text-white leading-tight truncate">
                                {cell.player.name}
                              </p>
                           </div>
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
      
      {/* Round Over Overlay */}
      {onNextRound && <RoundOverOverlay state={state} role={role} onNextRound={onNextRound} />}
      
      {/* Game Over Modal (Full Match) */}
      {state.roundStatus === 'finished' && <BattleGameOverModal state={state} role={role} />}
    </div>
  )
}

function RoundOverOverlay({ state, role, onNextRound }: { state: BattleState, role: 'host' | 'guest', onNextRound: (action: 'continue' | 'forfeit') => void }) {
    const { t } = useLanguage()
    if (state.roundStatus !== 'round_over' || !state.winner) return null

    const isDraw = state.winner === 'draw'
    const isWinner = state.winner === role
    const winnerName = isDraw ? t('battle.draw') : (state.players[state.winner as 'host' | 'guest']?.name || t('battle.opponent'))
    
    // ... existing logic
    const amIReady = state.nextRoundReady?.[role] || false
    const opponentRole = role === 'host' ? 'guest' : 'host'
    const opponentReady = state.nextRoundReady?.[opponentRole] || false

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
             <div className="bg-gray-900 border border-white/20 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className={cn(
                    "absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/50 to-transparent",
                    state.winner === 'host' ? "via-nba-blue" : isDraw ? "via-gray-500" : "via-nba-red"
                )} />

                <h2 className="text-3xl font-heading font-bold uppercase italic mb-2">{t('battle.round_over').replace('{n}', (state.roundNumber || 1).toString())}</h2>
                
                <div className="py-6">
                    <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">{t('battle.result')}</p>
                    <p className={cn("text-4xl font-bold mb-4", 
                        state.winner === 'host' ? "text-nba-blue" : 
                        state.winner === 'guest' ? "text-nba-red" : "text-white"
                    )}>
                        {winnerName}
                    </p>
                    {isDraw ? (
                         <div className="inline-block bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {t('battle.no_points')}
                        </div>
                    ) : isWinner ? (
                        <div className="inline-block bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase border border-yellow-500/50">
                            {t('battle.point_won')}
                        </div>
                    ) : (
                        <div className="inline-block bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {t('battle.zero_points')}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-4">
                     <Button 
                        onClick={() => onNextRound('forfeit')}
                        variant="ghost" 
                        className="flex-1 text-slate-500 hover:text-red-500"
                        disabled={amIReady}
                     >
                        {t('battle.surrender')}
                     </Button>
                     <Button 
                        onClick={() => onNextRound('continue')}
                        className={cn(
                            "flex-1 h-12 text-lg font-bold uppercase tracking-widest",
                            amIReady ? "bg-green-600/50 text-white cursor-default" : "bg-white text-black hover:bg-gray-200"
                        )}
                        disabled={amIReady}
                     >
                        {amIReady ? (
                             opponentReady ? t('battle.starting') : t('battle.waiting') 
                        ) : t('battle.continue')}
                     </Button>
                </div>
                
                {amIReady && !opponentReady && (
                    <p className="mt-4 text-xs text-slate-500 animate-pulse">{t('battle.waiting_opponent')}</p>
                )}
            </div>
        </div>
    )
}
