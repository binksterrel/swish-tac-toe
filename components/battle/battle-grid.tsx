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

export function BattleGrid({ state, role, onCellClick, selectedCell, onVoteSkip, onNextRound }: BattleGridProps & { onNextRound?: (action: 'continue' | 'forfeit') => void }) {
  // ... imports
  
  // ... existing logic

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ... previous JSX ... */}
      
      {/* Round Over Overlay */}
      {onNextRound && <RoundOverOverlay state={state} role={role} onNextRound={onNextRound} />}
    </div>
  )
}

function RoundOverOverlay({ state, role, onNextRound }: { state: BattleState, role: 'host' | 'guest', onNextRound: (action: 'continue' | 'forfeit') => void }) {
    if (state.roundStatus !== 'round_over' || !state.winner) return null

    const isDraw = state.winner === 'draw'
    const isWinner = state.winner === role
    const winnerName = isDraw ? "Draw!" : (state.players[state.winner as 'host' | 'guest']?.name || 'Opponent')
    
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

                <h2 className="text-3xl font-heading font-bold uppercase italic mb-2">Round {state.roundNumber} Over</h2>
                
                <div className="py-6">
                    <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">Result</p>
                    <p className={cn("text-4xl font-bold mb-4", 
                        state.winner === 'host' ? "text-nba-blue" : 
                        state.winner === 'guest' ? "text-nba-red" : "text-white"
                    )}>
                        {winnerName}
                    </p>
                    {isDraw ? (
                         <div className="inline-block bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            No Points Awarded
                        </div>
                    ) : isWinner ? (
                        <div className="inline-block bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase border border-yellow-500/50">
                            You Won +1 Point
                        </div>
                    ) : (
                        <div className="inline-block bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                            +0 Points
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
                        Surrender
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
                             opponentReady ? "Starting..." : "Waiting..." 
                        ) : "Continue"}
                     </Button>
                </div>
                
                {amIReady && !opponentReady && (
                    <p className="mt-4 text-xs text-slate-500 animate-pulse">Waiting for opponent...</p>
                )}
            </div>
        </div>
    )
}
