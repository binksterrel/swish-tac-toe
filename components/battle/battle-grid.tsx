"use client"

import { GridCell, BattleState } from "@/lib/battle-types"
import { Criteria } from "@/lib/nba-data"
import { motion, AnimatePresence } from "framer-motion"
import { CriteriaHeader } from "../game/criteria-header" // Reusing
import { cn } from "@/lib/utils"
import { Check, X, Loader2, SkipForward, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TeamLogo } from "@/components/common/team-logo"
import { PlayerPhoto } from "@/components/common/player-photo"

interface BattleGridProps {
  state: BattleState
  role: 'host' | 'guest'
  onCellClick: (row: number, col: number) => void
  selectedCell: { row: number, col: number } | null
  onVoteSkip?: () => void
  onPassTurn?: () => void
}

import { useEffect, useState, useMemo, useRef } from "react"
import { GameTimer } from "../game/game-timer"
import { BattleGameOverModal } from "./battle-game-over-modal"
import { useLanguage } from "@/contexts/language-context"
// ... imports

export function BattleGrid({ state, role, onCellClick, selectedCell, onVoteSkip, onPassTurn, onNextRound }: BattleGridProps & { onNextRound?: (action: 'continue' | 'forfeit') => void }) {
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
                   body: JSON.stringify({ code: state.code, playerRole: role, currentTurn: state.currentTurn })
               }).catch(console.error)
          }
      }, 1000)
      
      return () => clearInterval(interval)
  }, [turnExpiry, isMyTurn, isGameOver, state.code, role, state.currentTurn])

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

  // Pass Turn Logic
  const [isPassing, setIsPassing] = useState(false)

  const handlePassTurn = async () => {
      if (!isMyTurn || isGameOver || isPassing) return
      setIsPassing(true)
      try {
          if (onPassTurn) onPassTurn()
      } finally {
          setIsPassing(false)
      }
  }

  // Auto-Transition to Next Round (5 seconds countdown)
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null)
  // Use roundStatus from server as source of truth
  const isRoundOver = state.roundStatus === 'round_over' && (state.roundNumber || 1) < 5
  const isFinalGameOver = state.roundStatus === 'finished' || ((state.roundNumber || 1) >= 5 && !!state.winner)

  const [showFinalModal, setShowFinalModal] = useState(false)

  useEffect(() => {
    if (state.roundStatus === 'finished') {
      const timer = setTimeout(() => setShowFinalModal(true), 2500)
      return () => clearTimeout(timer)
    } else {
      setShowFinalModal(false)
    }
  }, [state.roundStatus])

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

  // TURN FLASH LOGIC
  const [showTurnFlash, setShowTurnFlash] = useState(false)
  const prevTurn = useRef(state.currentTurn)

  useEffect(() => {
    // If it BECAME my turn (and wasn't before)
    if (state.currentTurn === role && prevTurn.current !== role && !isGameOver) {
        setShowTurnFlash(true)
        const timer = setTimeout(() => setShowTurnFlash(false), 800)
        return () => clearTimeout(timer)
    }
    prevTurn.current = state.currentTurn
  }, [state.currentTurn, role, isGameOver])

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* SCREEN FLASH EFFECT */}
      <AnimatePresence>
        {showTurnFlash && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className={cn(
                    "fixed inset-0 z-50 pointer-events-none mix-blend-overlay",
                    role === 'host' ? "bg-nba-blue" : "bg-action"
                )}
            />
        )}
      </AnimatePresence>
      
      {showTurnFlash && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
             <h1 className="text-6xl md:text-8xl font-heading font-bold uppercase italic text-white ">
                 A TOI !
             </h1>
          </motion.div>
      )}
      {/* Scoreboard & Round Info - Grid Layout for perfect centering */}
      <div className="grid grid-cols-3 items-end mb-4 px-2">
          {/* Left: Round */}
          <div className="text-left">
              <div className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">{t('battle.round')}</div>
              <div className="text-2xl font-heading font-bold text-white leading-none">
                  {state.roundNumber || 1}<span className="text-ink-muted/50 text-lg">/5</span>
              </div>
          </div>
          
          {/* Center: Scores */}
          <div className="flex gap-8 pb-1 justify-center">
              <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-brand-blue-soft leading-none">{state.scores?.host || 0}</div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-action leading-none">{state.scores?.guest || 0}</div>
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
                     "border border-line hover:border-white/30 hover:bg-surface-2",
                     hasVotedSkip && "bg-brand-blue/20 text-brand-blue-soft border-brand-blue-soft/50 hover:bg-brand-blue/30",
                     opponentVoted && !hasVotedSkip && "border-brand-blue-soft/50 text-brand-blue-soft animate-pulse",
                     !hasVotedSkip && !opponentVoted && "text-ink-muted hover:text-white"
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
                     <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                     {t('battle.en_attente')}
                   </span>
                 ) : opponentVoted ? (
                   <span className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
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
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-s16 rounded-ref border border-line bg-surface p-s16 md:p-s24 shadow-soft">
             
             {/* Host */}
             {(() => {
               const hostPlayer = state.players.host
               const displayName = hostPlayer?.name || "En attente..."
               const teamCode = hostPlayer?.avatar // Already parsed in use-battle.ts
               return (
                 <div className={cn("flex min-w-0 items-center gap-s16 transition-opacity duration-[200ms] ease-snappy", state.currentTurn === 'host' ? "opacity-100" : "opacity-50")}>
                   {teamCode && (
                     <span className="hidden sm:flex shrink-0"><TeamLogo teamId={teamCode} size={40} /></span>
                   )}
                   <div className="min-w-0">
                     <div className="flex items-center gap-s8 text-meta font-semibold text-brand-blue-soft">
                       {t('battle.host')}
                     </div>
                     <div className="mt-[4px] truncate font-heading text-lead font-bold uppercase tracking-tight text-ink">{displayName}</div>
                     <div className={cn("mt-s8 h-[2px] w-8 rounded-full", state.currentTurn === 'host' ? "bg-brand-blue-soft" : "bg-transparent")} />
                   </div>
                 </div>
               )
             })()}
             
             {/* Central Timer */}
             <div className="flex flex-col items-center gap-s8 text-center">
                <GameTimer time={timeLeft} variant={timeLeft <= 10 ? "danger" : "default"} />
                <AnimatePresence>
                  {isMyTurn && !isGameOver && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePassTurn}
                        disabled={isPassing}
                        className="h-8 rounded-nested border border-line px-s8 font-heading text-meta font-bold uppercase tracking-wide text-ink-muted transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 hover:text-ink"
                      >
                        {isPassing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1">
                            <ChevronsRight className="w-3 h-3" />
                            {t('battle.pass_turn')}
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* Guest */}
             {(() => {
               const guestPlayer = state.players.guest
               const displayName = guestPlayer?.name || "En attente..."
               const teamCode = guestPlayer?.avatar // Already parsed in use-battle.ts
               return (
                 <div className={cn("flex min-w-0 items-center justify-end gap-s16 text-right transition-opacity duration-[200ms] ease-snappy", state.currentTurn === 'guest' ? "opacity-100" : "opacity-50")}>
                   <div className="min-w-0">
                     <div className="text-meta font-semibold text-action">{t('battle.guest')}</div>
                     <div className="mt-[4px] truncate font-heading text-lead font-bold uppercase tracking-tight text-ink">{displayName}</div>
                     <div className={cn("ml-auto mt-s8 h-[2px] w-8 rounded-full", state.currentTurn === 'guest' ? "bg-action" : "bg-transparent")} />
                   </div>
                   {teamCode && (
                     <span className="hidden sm:flex shrink-0"><TeamLogo teamId={teamCode} size={40} /></span>
                   )}
                 </div>
               )
             })()}
          </div>
      </div>

      {state.winner && (
          <div className="mb-6 p-4 bg-brand-blue/20 border border-brand-blue-soft/50 rounded-xl text-center animate-in zoom-in">
              <h2 className="text-3xl font-heading font-bold uppercase italic text-brand-blue-soft">
                  {state.winner === 'draw' ? t('battle.draw').toUpperCase() : 
                   isFinalGameOver ? `${state.players[state.winner as 'host'|'guest']?.name || 'Gagnant'} ${t('battle.champion')}` :
                   `${state.players[state.winner as 'host'|'guest']?.name || 'Gagnant'} ${t('battle.wins_round')}`}
              </h2>
              {isRoundOver && nextRoundCountdown !== null && (
                <p className="text-brand-blue-soft/80 text-sm mt-2 animate-pulse">
                  {t('battle.next_round_in')} <span className="font-bold text-xl">{nextRoundCountdown}</span>s...
                </p>
              )}
          </div>
      )}

      {/* Grid - Memoized to prevent re-renders on timer tick */}
      {useMemo(() => (
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
                            cell.owner === 'host' ? "bg-nba-blue/20 border-nba-blue shadow-soft" : 
                            cell.owner === 'guest' ? "bg-nba-red/20 border-action shadow-soft" : 
                            "bg-surface-2 border-line hover:bg-surface-2",
                            
                            isSelected && "ring-4 ring-white ring-offset-2 ring-offset-black scale-105 z-10",
                            isDisabled && !cell.player && "opacity-50 cursor-not-allowed",
                            isDisabled && cell.player && "cursor-default"
                        )}
                     >
                        {cell.player ? (
                            <>
                               <div className="absolute inset-0">
                                  <PlayerPhoto
                                    player={cell.player}
                                    fill
                                    className="object-cover object-top scale-110 translate-y-2 opacity-80 hover:opacity-100 transition-opacity animate-in fade-in duration-300"
                                  />
                               </div>
                               <div className="absolute bottom-0 inset-x-0 p-2">
                                  <p className="text-[10px] md:text-xs font-bold text-center text-white leading-tight truncate">
                                    {cell.player.name}
                                  </p>
                               </div>
                               <div className={cn(
                                   "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white text-[10px] font-bold shadow-md",
                                   cell.owner === 'host' ? "bg-nba-blue text-white" : "bg-action text-white"
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
      ), [grid, criteria, selectedCell, isMyTurn, isGameOver, onCellClick])}
      
      {/* Round Over Overlay */}
      {onNextRound && <RoundOverOverlay state={state} role={role} onNextRound={onNextRound} />}
      
      {/* Game Over Modal (Full Match) */}
      {state.roundStatus === 'finished' && showFinalModal && <BattleGameOverModal state={state} role={role} />}
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
                <div className="backdrop-blur-lg px-10 py-8 rounded-3xl border border-line shadow-raised text-center">
                    {/* Result Badge */}
                    <div className={cn(
                        "inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4",
                        isDraw ? "bg-line text-ink-soft" :
                        isWinner ? "bg-success/20 text-success border border-success/50" :
                        "bg-action/20 text-action border border-action/50"
                    )}>
                        {isDraw ? t('battle.draw') : isWinner ? t('battle.victory') : t('battle.defeat')}
                    </div>
                    
                    {/* Winner Name */}
                    <p className={cn(
                        "text-4xl font-heading font-bold uppercase italic mb-3",
                        state.winner === 'host' ? "text-brand-blue-soft" : 
                        state.winner === 'guest' ? "text-action" : "text-white"
                    )}>
                        {winnerName}
                    </p>
                    <p className="text-ink-muted text-sm">{t('battle.wins_round')}</p>
                    
                    {/* Countdown */}
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-surface-2 border border-line flex items-center justify-center">
                            <span className="text-2xl font-bold text-white animate-pulse">{countdown}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
             <div className="border border-line p-8 rounded-3xl max-w-md w-full text-center shadow-raised relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Top Accent Line */}
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    state.winner === 'host' ? "   " : 
                    state.winner === 'guest' ? "   " :
                    "   "
                )} />
                
                {/* Round Header */}
                <p className="text-ink-muted text-xs uppercase tracking-[0.2em] mb-2">{t('battle.round_over').replace('{n}', '')}</p>
                <h2 className="text-5xl font-heading font-bold mb-6">{state.roundNumber || 1}<span className="text-ink-muted/50">/5</span></h2>
                
                {/* Result Section */}
                <div className="py-6 px-4 bg-black/30 rounded-2xl border border-line mb-6">
                    <p className="text-ink-muted text-xs uppercase tracking-widest mb-3">{t('battle.result')}</p>
                    <p className={cn("text-4xl font-bold mb-4", 
                        state.winner === 'host' ? "text-brand-blue-soft" : 
                        state.winner === 'guest' ? "text-action" : "text-white"
                    )}>
                        {winnerName}
                    </p>
                    
                    {/* Points Badge */}
                    {isDraw ? (
                         <div className="inline-block bg-surface-2/50 text-ink-muted px-4 py-2 rounded-full text-sm font-bold uppercase border border-line">
                            {t('battle.no_points')}
                        </div>
                    ) : isWinner ? (
                        <div className="inline-flex items-center gap-2 bg-success/20 text-success px-4 py-2 rounded-full text-sm font-bold uppercase border border-success/50">
                            <span className="w-2 h-2 rounded-full bg-success" />
                            {t('battle.point_won')}
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 bg-action/20 text-action px-4 py-2 rounded-full text-sm font-bold uppercase border border-action/50">
                            <span className="w-2 h-2 rounded-full bg-action" />
                            {t('battle.zero_points')}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                     <Button 
                        onClick={() => onNextRound('forfeit')}
                        variant="ghost" 
                        className="flex-1 h-12 text-ink-muted hover:text-action hover:bg-action/10 border border-transparent hover:border-action/20 rounded-xl transition-all"
                        disabled={amIReady}
                     >
                        {t('battle.surrender')}
                     </Button>
                     <Button 
                        onClick={() => onNextRound('continue')}
                        className={cn(
                            "flex-1 h-12 text-lg font-bold uppercase tracking-wider rounded-xl transition-all",
                            amIReady 
                                ? "bg-success/30 text-success border border-success/30 cursor-default" 
                                : "bg-white text-black hover:bg-ink-muted shadow-raised shadow-white/20"
                        )}
                        disabled={amIReady}
                     >
                        {amIReady ? (
                             opponentReady ? t('battle.starting') : t('battle.waiting') 
                        ) : t('battle.continue')}
                     </Button>
                </div>
                
                {amIReady && !opponentReady && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t('battle.waiting_opponent')}
                    </div>
                )}
            </div>
        </div>
    )
}
