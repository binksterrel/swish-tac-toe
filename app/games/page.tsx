"use client"

import { NBATicker } from "@/components/nba-ticker"
import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/language-context"
import { Trophy, Clock, Frown, PartyPopper, History, Play } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface GameHistoryItem {
    date: string
    score: number
    correct: number
    mistakes?: number 
    total: number
    difficulty: string
    mode: string
    time: number
}

export default function GamesPage() {
  const { t } = useLanguage()
  const [history, setHistory] = useState<GameHistoryItem[]>([])

  useEffect(() => {
      const saved = localStorage.getItem("nba-ttt-history")
      if (saved) {
          try {
              setHistory(JSON.parse(saved))
          } catch (e) {
              console.error("Failed to parse history", e)
          }
      }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
  }

  const getTierColor = (correct: number, total: number) => {
      const pct = (correct / total) * 100
      if (pct >= 100) return "text-amber-400"
      if (pct >= 80) return "text-nba-blue"
      if (pct >= 50) return "text-white"
      return "text-gray-500"
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-nba-red selection:text-white">
      <NBATicker />
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 border-b border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold uppercase italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              {t('game.games')}
            </h1>
            <p className="text-xl text-gray-400 font-mono tracking-widest uppercase flex items-center gap-2">
              <History className="w-5 h-5" />
              Match History
            </p>
          </div>
          
          <Link href="/game">
             <Button className="bg-nba-red hover:bg-red-700 text-white font-bold uppercase tracking-wider px-8">
                <Play className="w-4 h-4 mr-2 fill-current" />
                Play New Game
             </Button>
          </Link>
        </div>

        {/* History List */}
        {history.length > 0 ? (
            <div className="space-y-4">
                {history.map((game, i) => (
                    <div key={i} className="bg-gray-900/50 border border-gray-800 p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-gray-900 transition-colors">
                        
                        {/* Date & Mode */}
                        <div className="flex flex-col gap-1 min-w-[150px]">
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{game.difficulty} • {game.mode}</span>
                            <span className="text-white font-mono">{formatDate(game.date)}</span>
                        </div>

                        {/* Result Icon */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/50 border border-gray-700">
                            {game.correct === game.total ? (
                                <PartyPopper className="w-6 h-6 text-amber-400" />
                            ) : game.correct >= (game.total / 2) ? (
                                <Trophy className="w-6 h-6 text-nba-blue" />
                            ) : (
                                <Frown className="w-6 h-6 text-gray-600" />
                            )}
                        </div>

                        {/* Score Stats */}
                        <div className="grid grid-cols-4 gap-4 flex-1 text-center md:text-left">
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Score</div>
                                <div className="text-2xl font-bold font-mono text-white">{game.score}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Accuracy</div>
                                <div className={`text-2xl font-bold font-mono ${getTierColor(game.correct, game.total)}`}>
                                    {game.correct}/{game.total}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Mistakes</div>
                                <div className="text-2xl font-bold font-mono text-red-400">
                                    {game.mistakes !== undefined ? game.mistakes : (
                                        // Fallback for old history without mistakes field
                                        "-"
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Time</div>
                                <div className="text-2xl font-bold font-mono text-gray-400">{formatTime(game.time)}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-gray-900/30 rounded-lg border border-gray-800 border-dashed">
                <Clock className="w-16 h-16 text-gray-700 mb-6 mx-auto" />
                <h2 className="text-3xl font-bold uppercase mb-2">No Games Yet</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    Your match history will appear here once you complete your first game.
                </p>
                <Link href="/game">
                    <Button variant="outline" className="uppercase font-bold tracking-widest">
                        Start Your Career
                    </Button>
                </Link>
            </div>
        )}
      </div>
    </div>
  )
}
