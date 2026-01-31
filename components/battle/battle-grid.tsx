"use client"

import { GridCell, BattleState } from "@/lib/battle-types"
import { Criteria, getTeamLogoUrl } from "@/lib/nba-data"
import { CriteriaHeader } from "../game/criteria-header" // Reusing
import { cn } from "@/lib/utils"
import { getPlayerPhotoUrl } from "@/lib/nba-data"
import { Check, X, Loader2, SkipForward } from "lucide-react"
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
  // Use roundStatus from server as source of truth
  const isRoundOver = state.roundStatus === 'round_over' && (state.roundNumber || 1) < 5
  const isFinalGameOver = state.roundStatus === 'finished' || ((state.roundNumber || 1) >= 5 && !!state.winner)

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
  }, [isRoundOver, isFinalGameOver, state.code, role, state.roundStatus])

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
                 variant={hasVotedSkip ? "secondary" : "ghost"} 
                 size="sm"
                 onClick={handleSkip}
                 disabled={isSkipping || hasVotedSkip || isGameOver}
                 className={cn(
                     "text-xs uppercase tracking-widest h-9 px-4 ml-auto rounded-full transition-all duration-300",
                     "border border-white/10 hover:border-white/30 hover:bg-white/5",
                     hasVotedSkip && "bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30",
                     opponentVoted && !hasVotedSkip && "border-amber-500/50 text-amber-400 animate-pulse",
                     !hasVotedSkip && !opponentVoted && "text-slate-400 hover:text-white"
                 )}
               >
                 {isSkipping ? (
                   <Loader2 className="w-3 h-3 animate-spin" />
                 ) : hasVotedSkip && opponentVoted ? (
                   <span className="flex items-center gap-1.5">
                     <Loader2 className="w-3 h-3 animate-spin" />
                     {t('battle.passing')}
                   </span>
                 ) : hasVotedSkip ? (
                   <span className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                     {t('battle.en_attente')}
                   </span>
                 ) : opponentVoted ? (
                   <span className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                     {t('battle.passer')} ?
                   </span>
                 ) : (
                   <span className="flex items-center gap-1.5">
                     <SkipForward className="w-3.5 h-3.5" />
                     {t('battle.vote_skip')}
                   </span>
                 )}
               </Button>

          </div>
      </div>

          {/* Turn Indicator & Timer */}
          <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md relative overflow-hidden">
             
             {/* Host */}
             {(() => {
               const hostPlayer = state.players.host
               const displayName = hostPlayer?.name || "En attente..."
               const teamCode = hostPlayer?.avatar // Already parsed in use-battle.ts
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
               const guestPlayer = state.players.guest
               const displayName = guestPlayer?.name || "En attente..."
               const teamCode = guestPlayer?.avatar // Already parsed in use-battle.ts
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

      {/* Grid - key on criteria to trigger clean re-render on round change */}
      <div 
        key={`grid-${criteria.rows.map(c => c.value).join('-')}-${criteria.cols.map(c => c.value).join('-')}`}
        className="grid grid-rows-[auto_1fr_1fr_1fr] gap-2 animate-in fade-in duration-200"
      >
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
    const [showModal, setShowModal] = useState(false)
    const [countdown, setCountdown] = useState(5)
    
    // Delay showing the modal by 5 seconds so players can see the winning move
    useEffect(() => {
        if (state.roundStatus === 'round_over' && state.winner) {
            setShowModal(false)
            setCountdown(5)
            
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setShowModal(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            
            return () => clearInterval(timer)
        }
    }, [state.roundStatus, state.winner])
    
    if (state.roundStatus !== 'round_over' || !state.winner) return null

    const isDraw = state.winner === 'draw'
    const isWinner = state.winner === role
    const winnerName = isDraw ? t('battle.draw') : (state.players[state.winner as 'host' | 'guest']?.name || t('battle.opponent'))
    
    const amIReady = state.nextRoundReady?.[role] || false
    const opponentRole = role === 'host' ? 'guest' : 'host'
    const opponentReady = state.nextRoundReady?.[opponentRole] || false
    
    // Show countdown before modal
    if (!showModal) {
        return (
            <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-lg px-10 py-8 rounded-3xl border border-white/10 shadow-2xl text-center">
                    {/* Result Badge */}
                    <div className={cn(
                        "inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4",
                        isDraw ? "bg-slate-700 text-slate-300" :
                        isWinner ? "bg-green-500/20 text-green-400 border border-green-500/50" :
                        "bg-red-500/20 text-red-400 border border-red-500/50"
                    )}>
                        {isDraw ? t('battle.draw') : isWinner ? t('battle.victory') : t('battle.defeat')}
                    </div>
                    
                    {/* Winner Name */}
                    <p className={cn(
                        "text-4xl font-heading font-bold uppercase italic mb-3",
                        state.winner === 'host' ? "text-nba-blue" : 
                        state.winner === 'guest' ? "text-nba-red" : "text-white"
                    )}>
                        {winnerName}
                    </p>
                    <p className="text-slate-400 text-sm">{t('battle.wins_round')}</p>
                    
                    {/* Countdown */}
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white animate-pulse">{countdown}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Top Accent Line */}
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    state.winner === 'host' ? "bg-gradient-to-r from-transparent via-nba-blue to-transparent" : 
                    state.winner === 'guest' ? "bg-gradient-to-r from-transparent via-nba-red to-transparent" :
                    "bg-gradient-to-r from-transparent via-slate-500 to-transparent"
                )} />
                
                {/* Round Header */}
                <p className="text-slate-500 text-xs uppercase tracking-[0.2em] mb-2">{t('battle.round_over').replace('{n}', '')}</p>
                <h2 className="text-5xl font-heading font-bold mb-6">{state.roundNumber || 1}<span className="text-slate-600">/5</span></h2>
                
                {/* Result Section */}
                <div className="py-6 px-4 bg-black/30 rounded-2xl border border-white/5 mb-6">
                    <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">{t('battle.result')}</p>
                    <p className={cn("text-4xl font-bold mb-4", 
                        state.winner === 'host' ? "text-nba-blue" : 
                        state.winner === 'guest' ? "text-nba-red" : "text-white"
                    )}>
                        {winnerName}
                    </p>
                    
                    {/* Points Badge */}
                    {isDraw ? (
                         <div className="inline-block bg-slate-800/50 text-slate-400 px-4 py-2 rounded-full text-sm font-bold uppercase border border-slate-700">
                            {t('battle.no_points')}
                        </div>
                    ) : isWinner ? (
                        <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold uppercase border border-green-500/50">
                            <span className="w-2 h-2 rounded-full bg-green-400" />
                            {t('battle.point_won')}
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-bold uppercase border border-red-500/50">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            {t('battle.zero_points')}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                     <Button 
                        onClick={() => onNextRound('forfeit')}
                        variant="ghost" 
                        className="flex-1 h-12 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all"
                        disabled={amIReady}
                     >
                        {t('battle.surrender')}
                     </Button>
                     <Button 
                        onClick={() => onNextRound('continue')}
                        className={cn(
                            "flex-1 h-12 text-lg font-bold uppercase tracking-wider rounded-xl transition-all",
                            amIReady 
                                ? "bg-green-600/30 text-green-400 border border-green-500/30 cursor-default" 
                                : "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/20"
                        )}
                        disabled={amIReady}
                     >
                        {amIReady ? (
                             opponentReady ? t('battle.starting') : t('battle.waiting') 
                        ) : t('battle.continue')}
                     </Button>
                </div>
                
                {amIReady && !opponentReady && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t('battle.waiting_opponent')}
                    </div>
                )}
            </div>
        </div>
    )
}
