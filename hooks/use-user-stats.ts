"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { calculateXPByMode, getRank, XP_MULTIPLIERS } from "@/lib/ranking"

export interface GameHistoryItem {
    id?: string
    date: string
    fullDate?: Date
    score: number
    correct: number
    total: number
    difficulty?: string
    mode?: string
    subMode?: string
    time?: number
    result?: 'WIN' | 'LOSS' | 'DRAW'
    details?: any
    targetPlayer?: string
}

export function useUserStats() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [rawHistory, setRawHistory] = useState<any[]>([])

    useEffect(() => {
        async function loadStats() {
            setIsLoading(true)
            let historyData: any[] = []

            if (user) {
                try {
                    // Increased limit to ensuring better accuracy for "Career" stats
                    // Ideally this should be an aggregate query on DB, but for now we fetch recent history.
                    const res = await fetch('/api/user/matches?limit=200') 
                    const data = await res.json()
                    if (data.history) {
                         historyData = data.history.map((h: any) => ({
                             ...h,
                             date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                             fullDate: new Date(h.date),
                             correct: h.details?.correct || 0,
                             total: h.details?.total || h.details?.total_rounds || 9 
                         })).reverse() // Oldest first
                    }
                } catch (e) { console.error("DB fetch failed", e) }
            } 
            
            // Fallback: Merge LocalStorage if DB is empty (Legacy support)
            if (historyData.length === 0) {
                const saved = localStorage.getItem("nba-ttt-history")
                if (saved) {
                    try {
                        const local: any[] = JSON.parse(saved)
                        historyData = local.map(h => ({
                            ...h,
                            date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                             fullDate: new Date(h.date),
                            details: { correct: h.correct, total: h.total }
                        })).reverse()
                    } catch(e) {}
                }
            }

            setRawHistory(historyData)
            setIsLoading(false)
        }
        
        loadStats()
    }, [user])

    const stats = useMemo(() => {
        if (!rawHistory.length) return null

        // 1. Categorization
        const getGameCategory = (h: any): 'SWISH' | 'GUESS' | 'BATTLE' => {
            const mode = h.mode?.toUpperCase?.() || h.mode
            if (mode === 'SWISH') return 'SWISH'
            if (mode === 'BATTLE') return 'BATTLE'
            if (mode === 'GUESS') return 'GUESS'
            const legacySwishModes = ['CLASSIC', 'TIME_ATTACK', 'SUDDEN_DEATH', 'BLIND']
            if (mode && legacySwishModes.includes(mode)) return 'SWISH'
            if (!mode) {
                if (h.difficulty || h.time || h.subMode || h.mistakes !== undefined) return 'SWISH'
                return 'GUESS'
            }
            return 'SWISH'
        }

        // 2. XP & OVR Calculation
        const swishGames = rawHistory.filter(h => getGameCategory(h) === 'SWISH')
        const battleGames = rawHistory.filter(h => getGameCategory(h) === 'BATTLE')
        const guessGames = rawHistory.filter(h => getGameCategory(h) === 'GUESS')

        const swishWins = swishGames.filter(h => h.result === 'WIN' || h.correct === h.total).length
        const swishDraws = swishGames.filter(h => h.result === 'DRAW').length
        const swishLosses = swishGames.length - swishWins - swishDraws

        const battleWins = battleGames.filter(h => h.result === 'WIN').length
        const battleDraws = battleGames.filter(h => h.result === 'DRAW').length
        const battleLosses = battleGames.length - battleWins - battleDraws

        // XP
        const xp = calculateXPByMode(
            { wins: swishWins, draws: swishDraws, losses: swishLosses, total: swishGames.length },
            { wins: battleWins, draws: battleDraws, losses: battleLosses, total: battleGames.length }
        )

        // OVR (Rated Games Only)
        const ratedHistory = rawHistory.filter(h => getGameCategory(h) !== 'GUESS')
        const gamesPlayed = rawHistory.length // For display stats, we usually show total games played
        
        // Stats Metrics
        const totalScore = rawHistory.reduce((acc, curr) => acc + curr.score, 0)
        const avgScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0
        const bestScore = rawHistory.length > 0 ? Math.max(...rawHistory.map(h => h.score)) : 0

        const totalCorrect = rawHistory.reduce((acc, curr) => acc + (curr.correct || 0), 0)
        const totalPossible = rawHistory.reduce((acc, curr) => acc + (curr.total || 0), 0)
        const accuracy = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0

        // OVR Metrics (Rated only)
        const ratedGamesPlayed = ratedHistory.length
        const ratedWins = ratedHistory.filter(h => h.result === 'WIN' || h.correct === h.total).length
        const winRate = ratedGamesPlayed > 0 ? Math.round((ratedWins / ratedGamesPlayed) * 100) : 0

        // Streak
        let currentStreak = 0
        for (let i = ratedHistory.length - 1; i >= 0; i--) {
            if (ratedHistory[i].result === 'WIN' || ratedHistory[i].correct === ratedHistory[i].total) {
                currentStreak++
            } else {
                break
            }
        }

        // Final OVR Formula
        // Cap games factor at 100 games
        const ovr = Math.min(99, Math.floor(winRate * 0.4 + accuracy * 0.4 + (Math.min(gamesPlayed, 100)) * 0.2))

        const rankData = { ...getRank(xp), ovr }

        const modeData = [
            { name: `Swish (x${XP_MULTIPLIERS.SWISH})`, value: swishGames.length, color: '#3b82f6' },
            { name: 'Guess (casual)', value: guessGames.length, color: '#8b5cf6' },
            { name: `Battle (x${XP_MULTIPLIERS.BATTLE})`, value: battleGames.length, color: '#f59e0b' }
        ].filter(d => d.value > 0)

        return {
            gamesPlayed,
            avgScore,
            bestScore,
            accuracy,
            winRate,
            currentStreak,
            modeData,
            xp,
            rankData,
            rawHistory // Expose for charts if needed
        }
    }, [rawHistory])

    return { stats, isLoading }
}
