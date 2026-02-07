
import { Trophy, Medal, Star, Crown, Flame, Zap } from "lucide-react"

export type RankTier = 'ROOKIE' | 'SEMI_PRO' | 'PRO' | 'ALL_STAR' | 'SUPERSTAR' | 'HOF'

export interface RankInfo {
    id: RankTier
    label: string
    minXP: number
    color: string
    gradient: string
    icon: any
}

export const RANKS: Record<RankTier, RankInfo> = {
    ROOKIE: {
        id: 'ROOKIE',
        label: 'Rookie',
        minXP: 0,
        color: 'text-slate-400',
        gradient: 'from-slate-400 to-slate-600',
        icon: Medal
    },
    SEMI_PRO: {
        id: 'SEMI_PRO',
        label: 'Semi-Pro',
        minXP: 1500,
        color: 'text-emerald-400',
        gradient: 'from-emerald-400 to-teal-600',
        icon: Zap
    },
    PRO: {
        id: 'PRO',
        label: 'Pro',
        minXP: 6000,
        color: 'text-blue-400',
        gradient: 'from-blue-400 to-indigo-600',
        icon: Star
    },
    ALL_STAR: {
        id: 'ALL_STAR',
        label: 'All-Star',
        minXP: 20000,
        color: 'text-purple-400',
        gradient: 'from-purple-400 to-pink-600',
        icon: Star
    },
    SUPERSTAR: {
        id: 'SUPERSTAR',
        label: 'Superstar',
        minXP: 50000,
        color: 'text-orange-400',
        gradient: 'from-orange-400 to-red-600',
        icon: Flame
    },
    HOF: {
        id: 'HOF',
        label: 'Hall of Fame',
        minXP: 85000,
        color: 'text-yellow-400',
        gradient: 'from-yellow-400 to-amber-600',
        icon: Crown
    }
}

// XP multipliers by game mode
export const XP_MULTIPLIERS = {
    SWISH: 1,      // Base XP
    BATTLE: 2.5,   // 2.5x XP for competitive multiplayer
    GUESS: 0       // Casual mode, no XP
}

// Difficulty multipliers (applies to both Swish and Battle)
export const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
    easy: 0.5,
    medium: 1,
    hard: 2,
}

export function getDifficultyMultiplier(difficulty?: string): number {
    if (!difficulty) return 1
    return DIFFICULTY_MULTIPLIERS[difficulty.toLowerCase()] ?? 1
}

export function calculateXP(stats: { wins: number, draws: number, losses: number, total_matches: number }): number {
    if (!stats) return 0
    return (stats.wins * 100) + (stats.draws * 25) + (stats.losses * 10) + ((stats.total_matches * 5))
}

// Legacy aggregate XP (kept for backwards compat, but prefer calculateXPFromHistory)
export function calculateXPByMode(
    swishStats: { wins: number, draws: number, losses: number, total: number },
    battleStats: { wins: number, draws: number, losses: number, total: number }
): number {
    const swishXP = ((swishStats.wins * 100) + (swishStats.draws * 25) + (swishStats.losses * 10) + (swishStats.total * 5)) * XP_MULTIPLIERS.SWISH
    const battleXP = ((battleStats.wins * 100) + (battleStats.draws * 25) + (battleStats.losses * 10) + (battleStats.total * 5)) * XP_MULTIPLIERS.BATTLE
    return Math.round(swishXP + battleXP)
}

// Per-game XP with difficulty scaling
// Base: WIN=100, DRAW=25, LOSS=10, participation=5
// Final = (base + 5) * difficultyMult * modeMult
export function calculateXPFromHistory(
    games: { result?: string; correct?: number; total?: number; difficulty?: string; mode?: string }[],
    getCategory: (g: { mode?: string; difficulty?: string; subMode?: string; time?: number }) => 'SWISH' | 'BATTLE' | 'GUESS'
): number {
    let totalXP = 0
    for (const game of games) {
        const category = getCategory(game)
        const modeMult = XP_MULTIPLIERS[category] ?? 0
        if (modeMult === 0) continue

        const diffMult = getDifficultyMultiplier(game.difficulty)
        const isWin = game.result === 'WIN' || (game.correct != null && game.total != null && game.correct === game.total)
        const isDraw = game.result === 'DRAW'
        const baseXP = isWin ? 100 : isDraw ? 25 : 10
        totalXP += (baseXP + 5) * diffMult * modeMult
    }
    return Math.round(totalXP)
}

export function getRank(xp: number) {
    let currentRank = RANKS.ROOKIE
    let nextRank = RANKS.SEMI_PRO

    if (xp >= RANKS.HOF.minXP) {
        currentRank = RANKS.HOF
        nextRank = RANKS.HOF // No next rank
    } else if (xp >= RANKS.SUPERSTAR.minXP) {
        currentRank = RANKS.SUPERSTAR
        nextRank = RANKS.HOF
    } else if (xp >= RANKS.ALL_STAR.minXP) {
        currentRank = RANKS.ALL_STAR
        nextRank = RANKS.SUPERSTAR
    } else if (xp >= RANKS.PRO.minXP) {
        currentRank = RANKS.PRO
        nextRank = RANKS.ALL_STAR
    } else if (xp >= RANKS.SEMI_PRO.minXP) {
        currentRank = RANKS.SEMI_PRO
        nextRank = RANKS.PRO
    }

    const progress = nextRank === currentRank ? 100 : Math.min(100, Math.max(0, ((xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100))

    return {
        current: currentRank,
        next: nextRank,
        progress
    }
}
