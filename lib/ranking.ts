
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
        minXP: 500,
        color: 'text-emerald-400',
        gradient: 'from-emerald-400 to-teal-600',
        icon: Zap
    },
    PRO: {
        id: 'PRO',
        label: 'Pro',
        minXP: 1500,
        color: 'text-blue-400',
        gradient: 'from-blue-400 to-indigo-600',
        icon: Star
    },
    ALL_STAR: {
        id: 'ALL_STAR',
        label: 'All-Star',
        minXP: 4000,
        color: 'text-purple-400',
        gradient: 'from-purple-400 to-pink-600',
        icon: Star
    },
    SUPERSTAR: {
        id: 'SUPERSTAR',
        label: 'Superstar',
        minXP: 10000,
        color: 'text-orange-400',
        gradient: 'from-orange-400 to-red-600',
        icon: Flame
    },
    HOF: {
        id: 'HOF',
        label: 'Hall of Fame',
        minXP: 25000,
        color: 'text-yellow-400',
        gradient: 'from-yellow-400 to-amber-600',
        icon: Crown
    }
}

export function calculateXP(stats: { wins: number, draws: number, losses: number, total_matches: number }): number {
    if (!stats) return 0
    return (stats.wins * 100) + (stats.draws * 25) + (stats.losses * 10) + ((stats.total_matches * 5)) // Approx for correct cells
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
