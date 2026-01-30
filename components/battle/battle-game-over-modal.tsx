"use client"

import { Button } from "@/components/ui/button"
import { BattleState } from "@/lib/battle-types"
import { Trophy, Home, Frown } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
// Import hooks
import { useEffect, useRef } from "react"
import { useLanguage } from "@/contexts/language-context"

interface BattleGameOverModalProps {
    state: BattleState
    role: 'host' | 'guest'
}

export function BattleGameOverModal({ state, role }: BattleGameOverModalProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const effectRan = useRef(false)

    // Calculate stats
    const myScore = state.scores?.[role] || 0
    // Correctly count owned cells in grid
    const myCorrectCells = state.grid.flat().filter(c => c.owner === role).length
    
    const opponentRole = role === 'host' ? 'guest' : 'host'
    const opponentScore = state.scores?.[opponentRole] || 0
    
    // Derived result
    const isWinner = state.winner === role
    const isDraw = state.winner === 'draw'

    useEffect(() => {
        if (effectRan.current) return
        effectRan.current = true

        // Save to History
        const saveHistory = () => {
            const historyItem = {
                date: new Date().toISOString(),
                score: myScore,
                correct: myCorrectCells,
                mistakes: 0,
                total: 9,
                difficulty: 'Battle',
                mode: 'Battle',
                time: 0 // Ideally we track duration
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
    }, [myScore, myCorrectCells]) // Dependencies are stable constants in this modal render context usually
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
             <div className="max-w-md w-full bg-gray-900 border border-white/20 rounded-2xl p-8 text-center relative overflow-hidden shadow-2xl">
                 {/* Background Burst */}
                 <div className={cn(
                     "absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]",
                     isWinner ? "from-yellow-500 via-transparent to-transparent" :
                     isDraw ? "from-gray-500 via-transparent to-transparent" :
                     "from-red-900 via-transparent to-transparent"
                 )} />

                 <div className="relative z-10">
                     <div className="mb-6">
                         {isWinner ? (
                             <Trophy className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-bounce" />
                         ) : isDraw ? (
                             <div className="text-6xl mx-auto mb-2">🤝</div>
                         ) : (
                             <Frown className="w-20 h-20 text-slate-600 mx-auto" />
                         )}
                     </div>

                     <h1 className={cn(
                         "text-4xl font-heading font-bold uppercase italic mb-2 tracking-tighter",
                         isWinner ? "text-yellow-500" : isDraw ? "text-slate-200" : "text-slate-400"
                     )}>
                         {isWinner ? t('battle.victory') : isDraw ? t('battle.draw') : t('battle.defeat')}
                     </h1>

                     <p className="text-slate-400 mb-8 uppercase tracking-widest text-sm">
                         {isWinner ? t('battle.win_msg') : isDraw ? t('battle.draw_msg') : t('battle.loss_msg')}
                     </p>

                     {/* Scoreboard */}
                     <div className="flex items-center justify-center gap-8 mb-8 bg-black/30 p-4 rounded-xl border border-white/5">
                         <div className="text-center">
                             <p className="text-xs uppercase font-bold text-slate-500 mb-1">{t('battle.you')}</p>
                             <div className={cn("text-4xl font-heading font-bold", isWinner ? "text-yellow-500" : "text-white")}>
                                 {myScore}
                             </div>
                         </div>
                         <div className="text-2xl text-slate-600 font-mono">VS</div>
                         <div className="text-center">
                             <p className="text-xs uppercase font-bold text-slate-500 mb-1">{t('battle.opponent')}</p>
                             <div className="text-4xl font-heading font-bold text-white">
                                 {opponentScore}
                             </div>
                         </div>
                     </div>

                     <div className="space-y-3">
                         <Button 
                             onClick={() => router.push('/')}
                             className="w-full bg-white text-black hover:bg-gray-200 h-12 text-lg font-bold uppercase tracking-widest"
                         >
                             <Home className="w-4 h-4 mr-2" />
                             {t('battle.return_home')}
                         </Button>
                         {/* <Button variant="ghost" className="w-full text-slate-500 uppercase">View Stats (Coming Soon)</Button> */}
                     </div>
                 </div>
             </div>
        </div>
    )
}
