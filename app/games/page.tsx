"use client"

import { NBATicker } from "@/components/layout/nba-ticker"
import { Header } from "@/components/layout/header"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Trophy, Clock, Frown, PartyPopper, History, Play, Filter, ChevronDown, ChevronUp, Swords, BrainCircuit, Calendar, Grid3X3, Target } from "lucide-react"
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
    difficulty?: string // Optional: old GUESS games don't have this
    mode?: string // 'SWISH' | 'GUESS' | 'BATTLE' | legacy: 'CLASSIC' | 'TIME_ATTACK' | etc. | undefined for old GUESS
    subMode?: string // 'CLASSIC', 'TIME_ATTACK', etc. for SWISH games
    time?: number // Optional: old GUESS games don't have this
    result?: 'WIN' | 'LOSS' | 'DRAW'
    details?: any
    targetPlayer?: string // For GUESS games
}

export default function GamesPage() {
  const { t } = useLanguage()
  const { user, isLoading: authLoading } = useAuth()
  const [history, setHistory] = useState<GameHistoryItem[]>([])
  const [filter, setFilter] = useState<'ALL' | 'SWISH' | 'GUESS' | 'BATTLE'>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(10)

  // Reset visible count when filter changes
  const handleFilterChange = (newFilter: typeof filter) => {
      setFilter(newFilter)
      setVisibleCount(10)
      setExpandedId(null)
  }

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


  // Determine the actual game category, handling all legacy data formats
  const getGameCategory = (h: GameHistoryItem): 'SWISH' | 'GUESS' | 'BATTLE' => {
      const mode = h.mode?.toUpperCase?.() || h.mode

      // Explicit modes (case-insensitive)
      if (mode === 'SWISH') return 'SWISH'
      if (mode === 'BATTLE') return 'BATTLE'
      if (mode === 'GUESS') return 'GUESS'

      // Legacy localStorage SWISH: mode was stored as 'CLASSIC', 'TIME_ATTACK', etc.
      const legacySwishModes = ['CLASSIC', 'TIME_ATTACK', 'SUDDEN_DEATH', 'BLIND']
      if (mode && legacySwishModes.includes(mode)) {
          return 'SWISH'
      }

      // Legacy localStorage GUESS: NO mode field at all
      if (!mode || mode === undefined || mode === null) {
          // Old SWISH games had difficulty, time, mistakes
          if (h.difficulty || h.time || h.subMode || (h as any).mistakes !== undefined) {
              return 'SWISH'
          }
          return 'GUESS' // Minimal fields = old GUESS game
      }

      // Fallback
      return 'SWISH'
  }

  const filteredHistory = history.filter(h => {
      if (filter === 'ALL') return true
      return getGameCategory(h) === filter
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
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-nba-red selection:text-white pb-20 overflow-x-hidden">
      <NBATicker />
      <Header />
      
      {/* BACKGROUND AMBIANCE */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-nba-blue/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-nba-red/10 rounded-full blur-[150px] animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">
        
        {!authLoading && !user ? (
            <LoginRequired title="Game Log Locked" message="Join the league to record your match history and track your progress across seasons." />
        ) : (
            <>
        {/* HERO SECTION */}
        <div className="mb-12 relative">
             <div className="absolute -inset-1 bg-gradient-to-r from-nba-blue to-nba-red opacity-20 blur-xl rounded-full w-2/3 h-2/3 -z-10" />
             <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                         <div className="p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                             <History className="w-5 h-5 text-gray-300" />
                         </div>
                         <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Career History</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-heading font-bold uppercase italic tracking-tighter text-white drop-shadow-2xl pr-4 pb-2"
                    >
                    Game Log
                    </motion.h1>
                </div>
                
                <Link href="/game">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm clip-path-slant overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                           <Play className="w-4 h-4 fill-current" />
                           Play Now
                        </span>
                        <div className="absolute inset-0 bg-gray-200 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </motion.button>
                </Link>
             </div>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
            {(['ALL', 'SWISH', 'GUESS', 'BATTLE'] as const).map((f) => {
                const isActive = filter === f
                return (
                    <button
                        key={f}
                        onClick={() => handleFilterChange(f)}
                        className={cn(
                            "relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border",
                            isActive 
                                ? "bg-black/50 border-white/50 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                : "bg-black/20 border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300"
                        )}
                    >
                        <span className="relative z-10">{f}</span>
                        {isActive && (
                            <motion.div 
                                layoutId="activeFilter"
                                className="absolute inset-0 bg-white/5 rounded-full"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                )
            })}
        </div>

        {/* GAME LIST */}
        <div className="space-y-4">
            {isLoading ? (
                <div className="text-center py-32">
                     <div className="w-12 h-12 border-4 border-white/10 border-t-nba-blue rounded-full animate-spin mx-auto mb-6"/>
                     <p className="text-gray-500 text-xs uppercase tracking-[0.2em] animate-pulse">Retrieving Archives...</p>
                </div>
            ) : filteredHistory.length > 0 ? (
                <>
                    <AnimatePresence mode="popLayout">
                        {filteredHistory.slice(0, visibleCount).map((game, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative"
                            >
                                <div
                                    onClick={() => toggleExpand(i)}
                                    className="relative bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-nba-blue/5 hover:-translate-y-1"
                                >
                                    {/* Hover Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    
                                    {/* Status Indicator Bar */}
                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2", getResultColor(game))} />

                                    <div className="p-5 pl-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        
                                        {/* Left Section: Icon & Info */}
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center border border-white/10 bg-gradient-to-br from-white/5 to-transparent shadow-inner",
                                                getGameCategory(game) === 'BATTLE' ? "text-amber-400" : "text-nba-blue"
                                            )}>
                                                {getGameCategory(game) === 'BATTLE' && <Swords className="w-6 h-6" />}
                                                {getGameCategory(game) === 'SWISH' && <Grid3X3 className="w-6 h-6" />}
                                                {getGameCategory(game) === 'GUESS' && <BrainCircuit className="w-6 h-6" />}
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-base font-bold text-white uppercase tracking-wider">{getGameCategory(game)}</span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10 bg-black/30",
                                                        getResultColor(game).replace('bg-', 'text-')
                                                    )}>
                                                        {game.result || (game.correct === game.total ? 'PERFECT' : 'FINISHED')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono uppercase tracking-wide">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-gray-600" />
                                                        {formatDate(game.date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section: Stats & Action */}
                                        <div className="flex items-center justify-between md:justify-end gap-8 flex-1 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                            <div className="flex gap-8">
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Score</div>
                                                    <div className="text-xl font-heading font-bold italic text-white leading-none">{game.score}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Correct</div>
                                                    <div className="text-xl font-heading font-bold italic text-gray-300 leading-none">
                                                        <span className="text-white">{game.correct}</span>
                                                        <span className="text-gray-600 text-sm">/{game.total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                 <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", expandedId === String(i) && "rotate-180")} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details Panel */}
                                    <AnimatePresence>
                                        {expandedId === String(i) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-black/40 border-t border-white/5 relative"
                                            >
                                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05]" />
                                                <div className="p-6 relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                                                    <DetailItem label="Difficulty" value={game.difficulty || 'Normal'} icon={<Trophy className="w-3 h-3"/>} />
                                                    <DetailItem label="Duration" value={formatTime(game.time || 0)} icon={<Clock className="w-3 h-3"/>} />
                                                    <DetailItem label="Accuracy" value={game.total > 0 ? Math.round((game.correct/game.total)*100) + '%' : '-'} icon={<Target className="w-3 h-3"/>} /> 
                                                    <DetailItem label="Outcome" value={game.result || (game.score > 50 ? 'WIN' : 'LOSS')} isStatus />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* See More Button */}
                    {filteredHistory.length > visibleCount && (
                        <div className="mt-16 text-center">
                            <Button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                variant="outline"
                                size="lg"
                                className="bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/30 uppercase font-bold tracking-widest h-14 px-8 rounded-full transition-all duration-300 backdrop-blur-sm"
                            >
                                <ChevronDown className="w-4 h-4 mr-2 animate-bounce" />
                                Load More Games ({filteredHistory.length - visibleCount})
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-32 bg-white/5 rounded-2xl border border-dashed border-white/10 backdrop-blur-md">
                    <History className="w-16 h-16 text-gray-700 mb-6 mx-auto opacity-50" />
                    <h2 className="text-2xl font-heading font-bold italic uppercase text-gray-300 mb-2">Empty Archives</h2>
                    <p className="text-gray-500 text-sm mb-8 tracking-wide">Your legend begins with a single game.</p>
                    <Link href="/game">
                        <Button className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-wider px-8">
                            Start Career
                        </Button>
                    </Link>
                </div>
            )}
        </div>
            </>
        )}
      </div>
    </div>
  )
}

function DetailItem({ label, value, isStatus, icon }: any) {
    return (
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-1.5">
                {icon}
                {label}
            </span>
            <span className={cn("font-mono font-bold text-lg", isStatus ? "text-white" : "text-gray-300")}>{value}</span>
        </div>
    )
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
}
