import { Button } from "@/components/ui/button"
import { BattleState } from "@/lib/battle-types"
import { Trophy, Home, Frown, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
// Import hooks
import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"

interface BattleGameOverModalProps {
    state: BattleState
    role: 'host' | 'guest'
}

export function BattleGameOverModal({ state, role }: BattleGameOverModalProps) {
    const { t } = useLanguage()
    const { user } = useAuth()
    const router = useRouter()
    const effectRan = useRef(false)
    const [isRematchLoading, setIsRematchLoading] = useState(false)

    // Calculate stats
    const myScore = state.scores?.[role] || 0
    // Correctly count owned cells in grid
    const myCorrectCells = state.grid.flat().filter(c => c.owner === role).length
    
    const opponentRole = role === 'host' ? 'guest' : 'host'
    const opponentScore = state.scores?.[opponentRole] || 0
    
    // Derived result
    const isWinner = state.winner === role
    const isDraw = state.winner === 'draw'

    // Check rematch status
    const hasVotedRematch = state.rematchVotes?.[role] || false
    const opponentVotedRematch = state.rematchVotes?.[opponentRole] || false

    useEffect(() => {
        if (effectRan.current) return
        effectRan.current = true

        // Save to History (only for online battles, not local)
        const saveHistory = () => {
            // Skip saving for local battles
            if (state.code === 'LOCAL') return

            const historyItem = {
                date: new Date().toISOString(),
                score: myScore,
                correct: myCorrectCells,
                mistakes: 0,
                total: 9,
                difficulty: 'Battle',
                mode: 'BATTLE', // Uppercase for consistency
                result: isWinner ? 'WIN' : isDraw ? 'DRAW' : 'LOSS',
                time: 0
            }

            try {
                const existing = localStorage.getItem("nba-ttt-history")
                const history = existing ? JSON.parse(existing) : []
                // Add to beginning
                history.unshift(historyItem)
                // Limit to 50
                if (history.length > 50) history.pop()
                
                localStorage.setItem("nba-ttt-history", JSON.stringify(history))
            } catch (e) {
                console.error("Failed to save battle stats", e)
            }
        }
        
        saveHistory()

        // Sync to DB if logged in (skip local battles)
        if (user && state.code !== 'LOCAL') {
            fetch('/api/match/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'BATTLE',
                    result: isWinner ? 'WIN' : isDraw ? 'DRAW' : 'LOSS',
                    score: myScore,
                    details: {
                        code: state.code,
                        opponent: role === 'host' ? state.players.guest?.name : state.players.host?.name,
                        correct: myCorrectCells,
                        total_rounds: state.roundNumber
                    }
                })
            }).catch(e => console.error("DB Sync failed", e))
        }
    }, [myScore, myCorrectCells, state.code, user, isWinner, isDraw, role, state.players, state.roundNumber]) // Dependencies are stable constants in this modal render context usually
    
    const handleRematch = async () => {
        setIsRematchLoading(true)
        try {
            await fetch('/api/battle/rematch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: state.code, role })
            })
        } catch (e) {
            console.error(e)
            setIsRematchLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
             <div className="max-w-lg w-full mx-4 relative">
                 {/* Glowing accent behind modal */}
                 <div className={cn(
                     "absolute -inset-4 rounded-[32px] opacity-30 blur-2xl",
                     isWinner ? "bg-yellow-500" : isDraw ? "bg-slate-500" : "bg-red-900"
                 )} />
                 
                 <div className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-black border border-white/10 rounded-3xl p-8 text-center shadow-2xl overflow-hidden">
                     {/* Top accent line */}
                     <div className={cn(
                         "absolute top-0 left-0 right-0 h-1",
                         isWinner ? "bg-gradient-to-r from-transparent via-yellow-500 to-transparent" :
                         isDraw ? "bg-gradient-to-r from-transparent via-slate-400 to-transparent" :
                         "bg-gradient-to-r from-transparent via-red-500 to-transparent"
                     )} />

                     {/* Icon */}
                     <div className="mb-8 mt-4">
                         {isWinner ? (
                             <div className="relative inline-block">
                                 <Trophy className="w-24 h-24 text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.7)]" />
                                 <div className="absolute -inset-4 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
                             </div>
                         ) : isDraw ? (
                             <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                                 <span className="text-5xl">🤝</span>
                             </div>
                         ) : (
                             <div className="w-24 h-24 mx-auto rounded-full bg-red-950/50 border-2 border-red-900/50 flex items-center justify-center">
                                 <Frown className="w-14 h-14 text-red-400/70" />
                             </div>
                         )}
                     </div>

                     {/* Result Text */}
                     <h1 className={cn(
                         "text-5xl md:text-6xl font-heading font-black uppercase italic mb-3 tracking-tighter",
                         isWinner ? "text-yellow-500" : isDraw ? "text-slate-200" : "text-red-400"
                     )}>
                         {isWinner ? t('battle.victory') : isDraw ? t('battle.draw') : t('battle.defeat')}
                     </h1>

                     <p className="text-slate-500 mb-10 uppercase tracking-[0.25em] text-xs">
                         {isWinner ? t('battle.win_msg') : isDraw ? t('battle.draw_msg') : t('battle.loss_msg')}
                     </p>

                     {/* Scoreboard */}
                     <div className="flex items-stretch justify-center gap-4 mb-10">
                         {/* My Score */}
                         <div className={cn(
                             "flex-1 p-6 rounded-2xl border transition-all",
                             isWinner 
                                 ? "bg-yellow-500/10 border-yellow-500/30" 
                                 : "bg-white/5 border-white/10"
                         )}>
                             <p className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-widest">{t('battle.you')}</p>
                             <div className={cn(
                                 "text-5xl font-heading font-black",
                                 isWinner ? "text-yellow-500" : "text-white"
                             )}>
                                 {myScore}
                             </div>
                         </div>
                         
                         {/* VS Divider */}
                         <div className="flex items-center justify-center">
                             <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center">
                                 <span className="text-xs font-bold text-slate-600">VS</span>
                             </div>
                         </div>
                         
                         {/* Opponent Score */}
                         <div className={cn(
                             "flex-1 p-6 rounded-2xl border transition-all",
                             !isWinner && !isDraw 
                                 ? "bg-red-500/10 border-red-500/30" 
                                 : "bg-white/5 border-white/10"
                         )}>
                             <p className="text-xs uppercase font-bold text-slate-500 mb-2 tracking-widest">{t('battle.opponent')}</p>
                             <div className={cn(
                                 "text-5xl font-heading font-black",
                                 !isWinner && !isDraw ? "text-red-400" : "text-white"
                             )}>
                                 {opponentScore}
                             </div>
                         </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="space-y-3">
                         {/* Rematch Button */}
                         {!hasVotedRematch ? (
                            <Button 
                                onClick={handleRematch}
                                disabled={isRematchLoading}
                                className={cn(
                                    "w-full h-14 text-lg font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all",
                                    isWinner 
                                        ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/30" 
                                        : "bg-white hover:bg-gray-100 text-black shadow-white/20"
                                )}
                            >
                                <RefreshCw className={cn("w-5 h-5 mr-2", isRematchLoading && "animate-spin")} />
                                {t('battle.rematch_button')}
                            </Button>
                         ) : (
                            <div className="w-full bg-green-600/20 border border-green-500/30 text-green-400 h-14 flex items-center justify-center text-sm font-bold uppercase tracking-widest rounded-xl gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                {opponentVotedRematch ? t('battle.starting') : t('battle.waiting_opponent')}
                            </div>
                         )}

                         <Button 
                             onClick={() => router.push('/')}
                             variant="ghost"
                             className="w-full h-12 text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl text-sm font-bold uppercase tracking-widest transition-all"
                         >
                             <Home className="w-4 h-4 mr-2" />
                             {t('battle.return_home')}
                         </Button>
                     </div>
                 </div>
             </div>
        </div>
    )
}
