"use client"

import { NBATicker } from "@/components/layout/nba-ticker"
import { Header } from "@/components/layout/header"
import { useLanguage } from "@/contexts/language-context"
import { Trophy, TrendingUp, Users, Activity, Medal, Star } from "lucide-react"
import { useState, useEffect } from "react"

interface GameHistoryItem {
    score: number
    correct: number
    total: number
}

export default function StatsPage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState({
      gamesPlayed: 0,
      avgScore: 0,
      bestScore: 0,
      perfectGames: 0,
      totalCorrect: 0,
      accuracy: 0
  })

  useEffect(() => {
      const saved = localStorage.getItem("nba-ttt-history")
      if (saved) {
          try {
              const history: GameHistoryItem[] = JSON.parse(saved)
              if (history.length > 0) {
                  const gamesPlayed = history.length
                  const totalScore = history.reduce((acc, curr) => acc + curr.score, 0)
                  const avgScore = Math.round(totalScore / gamesPlayed)
                  const bestScore = Math.max(...history.map(h => h.score))
                  const perfectGames = history.filter(h => h.correct === h.total).length
                  const totalCorrect = history.reduce((acc, curr) => acc + curr.correct, 0)
                  const totalPossible = history.reduce((acc, curr) => acc + curr.total, 0)
                  const accuracy = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0

                  setStats({
                      gamesPlayed,
                      avgScore,
                      bestScore,
                      perfectGames,
                      totalCorrect,
                      accuracy
                  })
              }
          } catch (e) {
              console.error("Failed to parse stats", e)
          }
      }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-nba-red selection:text-white">
      <NBATicker />
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 border-b border-gray-800 pb-6">
          <h1 className="text-5xl md:text-7xl font-heading font-bold uppercase italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            {t('game.stats')}
          </h1>
          <p className="text-xl text-gray-400 font-mono tracking-widest uppercase">
            Your Personal Analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Games Played */}
            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-sm hover:border-nba-blue transition-colors group">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold uppercase tracking-wide text-gray-300 group-hover:text-white">Games Played</h3>
                    <Activity className="w-8 h-8 text-gray-600 group-hover:text-nba-blue transition-colors" />
                </div>
                <div className="text-5xl font-mono font-bold text-white mb-2">{stats.gamesPlayed}</div>
                <p className="text-gray-500 text-sm uppercase tracking-widest">Total Matches</p>
            </div>

            {/* Average Score */}
            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-sm hover:border-nba-red transition-colors group">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold uppercase tracking-wide text-gray-300 group-hover:text-white">Avg. Score</h3>
                    <TrendingUp className="w-8 h-8 text-gray-600 group-hover:text-nba-red transition-colors" />
                </div>
                <div className="text-5xl font-mono font-bold text-white mb-2">{stats.avgScore}</div>
                <p className="text-gray-500 text-sm uppercase tracking-widest">Points Per Game</p>
            </div>

            {/* Best Score */}
            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-sm hover:border-amber-400 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold uppercase tracking-wide text-gray-300 group-hover:text-white">Career High</h3>
                    <Trophy className="w-8 h-8 text-gray-600 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="text-5xl font-mono font-bold text-white mb-2">{stats.bestScore}</div>
                <p className="text-gray-500 text-sm uppercase tracking-widest">Personal Best</p>
            </div>

            {/* Wins / Perfect Games */}
            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-sm hover:border-purple-400 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold uppercase tracking-wide text-gray-300 group-hover:text-white">Perfect Games</h3>
                    <Star className="w-8 h-8 text-gray-600 group-hover:text-purple-400 transition-colors" />
                </div>
                <div className="text-5xl font-mono font-bold text-white mb-2">{stats.perfectGames}</div>
                <p className="text-gray-500 text-sm uppercase tracking-widest">100% Completion</p>
            </div>

            {/* Accuracy */}
            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-sm hover:border-green-400 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold uppercase tracking-wide text-gray-300 group-hover:text-white">Accuracy</h3>
                    <Medal className="w-8 h-8 text-gray-600 group-hover:text-green-400 transition-colors" />
                </div>
                <div className="text-5xl font-mono font-bold text-white mb-2">{stats.accuracy}%</div>
                <p className="text-gray-500 text-sm uppercase tracking-widest">Correct Answers</p>
            </div>
        </div>
      </div>
    </div>
  )
}
