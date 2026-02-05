"use client"

import { NBATicker } from "@/components/layout/nba-ticker"
import { Header } from "@/components/layout/header"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Trophy, Clock, Frown, PartyPopper, History, Play, Filter, ChevronDown, ChevronUp, Swords, BrainCircuit, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { LoginRequired } from "@/components/auth/login-required"

interface GameHistoryItem {
    id?: string
    date: string
    score: number
    correct: number
    total: number
    difficulty: string
    mode: 'GUESS' | 'BATTLE'
    time: number
    result?: 'WIN' | 'LOSS' | 'DRAW'
    details?: any
}

export default function GamesPage() {
  const { t } = useLanguage()
  const { user, isLoading: authLoading } = useAuth()
  const [history, setHistory] = useState<GameHistoryItem[]>([])
  const [filter, setFilter] = useState<'ALL' | 'GUESS' | 'BATTLE'>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
        setIsLoading(true)
        let loadedHistory: any[] = []

        if (user) {
             try {
                const res = await fetch('/api/user/matches?limit=50')
                const data = await res.json()
                if (data.history) {
                     loadedHistory = data.history.map((h: any) => ({
                         ...h,
                         // Ensure compatibility with old and new structure
                         correct: h.details?.correct || 0,
                         total: h.details?.total || h.details?.total_rounds || 9,
                         time: h.details?.time || 0
                     }))
                }
            } catch (e) { console.error("DB history fetch failed", e) }
        }
        
        // Fallback/Merge
        if (loadedHistory.length === 0) {
            const saved = localStorage.getItem("nba-ttt-history")
            if (saved) {
                try {
                    loadedHistory = JSON.parse(saved)
                } catch (e) {}
            }
        }

        setHistory(loadedHistory)
        setIsLoading(false)
    }
    loadHistory()
  }, [user])


  const filteredHistory = history.filter(h => {
      if (filter === 'ALL') return true
      const category = ['CLASSIC', 'TIME_ATTACK', 'SUDDEN_DEATH', 'BLIND'].includes(h.mode) ? 'GUESS' : h.mode
      return category === filter
  })

  const toggleExpand = (index: number) => {
      const id = String(index)
      setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
  }

  const getResultColor = (game: GameHistoryItem) => {
      // Determine win/loss based on result OR score calculation
      if (game.result === 'WIN') return 'bg-green-500'
      if (game.result === 'LOSS') return 'bg-red-500'
      if (game.result === 'DRAW') return 'bg-gray-500'
      
      // Fallback logic for old data
      if (game.correct === game.total && game.total > 0) return 'bg-amber-400' // Perfect
      if (game.correct > game.total / 2) return 'bg-nba-blue'
      return 'bg-gray-600'
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-nba-red selection:text-white pb-20">
      <NBATicker />
      <Header />
      
      {/* BACKGROUND AMBIANCE */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-nba-blue/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-nba-red/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
        
        {!authLoading && !user ? (
            <LoginRequired title="Game Log Locked" message="Join the league to record your match history and track your progress across seasons." />
        ) : (
            <>
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase italic tracking-tighter mb-2 text-white">
              Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-nba-blue to-nba-red">Log</span>
            </h1>
            <p className="text-gray-400 font-mono tracking-widest uppercase text-sm flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Activity
            </p>
          </div>
          
          <Link href="/game">
             <Button className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-wider px-6 h-12 rounded-none clip-path-slant">
                <Play className="w-4 h-4 mr-2 fill-current" />
                Play Now
             </Button>
          </Link>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-4 h-4 text-gray-500 mr-2" />
            {(['ALL', 'GUESS', 'BATTLE'] as const).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                        filter === f 
                            ? "bg-white text-black border-white" 
                            : "bg-black/40 text-gray-400 border-white/10 hover:border-white/30"
                    )}
                >
                    {f}
                </button>
            ))}
        </div>

        {/* GAME LIST */}
        <div className="space-y-3">
            {isLoading ? (
                <div className="text-center py-20">
                     <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"/>
                     <p className="text-gray-500 text-xs uppercase tracking-widest">Loading History...</p>
                </div>
            ) : filteredHistory.length > 0 ? (
                <AnimatePresence>
                    {filteredHistory.map((game, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative"
                        >
                            <div 
                                onClick={() => toggleExpand(i)}
                                className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer rounded-lg overflow-hidden relative"
                            >
                                {/* Result Strip */}
                                <div className={cn("absolute left-0 top-0 bottom-0 w-1", getResultColor(game))} />

                                <div className="p-4 pl-6 flex items-center justify-between gap-4">
                                    {/* Left: Mode & Date */}
                                    <div className="flex items-center gap-4">
                                        <div className="bg-black/40 p-2.5 rounded-md border border-white/5 text-gray-300">
                                            {game.mode === 'BATTLE' ? <Swords className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-bold text-white uppercase tracking-wide">{game.mode}</span>
                                                <span className={cn("text-[10px] px-1.5 rounded font-bold uppercase", getResultColor(game).replace('bg-', 'text-'))}>
                                                    {game.result || (game.correct === game.total ? 'PERFECT' : 'FINISHED')}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(game.date)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Score & Expand */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden md:block">
                                            <div className="text-sm font-bold text-white font-mono">{game.score} PTS</div>
                                            <div className="text-xs text-gray-500">{game.correct}/{game.total} Correct</div>
                                        </div>
                                        <ChevronDown className={cn("w-5 h-5 text-gray-600 transition-transform", expandedId === String(i) && "rotate-180")} />
                                    </div>
                                </div>
                                
                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedId === String(i) && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden bg-black/20 border-t border-white/5"
                                        >
                                            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                                <DetailItem label="Difficulty" value={game.difficulty || 'Normal'} />
                                                <DetailItem label="Time" value={formatTime(game.time || 0)} />
                                                <DetailItem label="Accuracy" value={game.total > 0 ? Math.round((game.correct/game.total)*100) + '%' : '-'} />
                                                <DetailItem label="Result" value={game.result || (game.score > 50 ? 'WIN' : 'LOSS')} isStatus />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            ) : (
                <div className="text-center py-20 bg-white/5 rounded-lg border border-white/10 border-dashed">
                    <History className="w-12 h-12 text-gray-700 mb-4 mx-auto" />
                    <h2 className="text-xl font-bold uppercase text-gray-300 mb-2">No Games Found</h2>
                    <p className="text-gray-500 text-sm mb-6">Play your first match to start building your career.</p>
                </div>
            )}
        </div>
            </>
        )}
      </div>
    </div>
  )
}

function DetailItem({ label, value, isStatus }: any) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{label}</span>
            <span className={cn("font-mono font-bold text-lg", isStatus ? "text-white" : "text-gray-300")}>{value}</span>
        </div>
    )
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
}
