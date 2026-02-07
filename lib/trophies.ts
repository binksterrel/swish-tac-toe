import type { GameHistoryItem } from "@/hooks/use-user-stats"

export interface TrophyContext {
    gamesPlayed: number
    wins: number
    accuracy: number
    currentStreak: number
    maxStreak: number
    bestScore: number
    avgScore: number
    xp: number
    rankId: string
    swishGames: GameHistoryItem[]
    battleGames: GameHistoryItem[]
    guessGames: GameHistoryItem[]
    rawHistory: GameHistoryItem[]
}

export interface TrophyDef {
    id: string
    label: string
    description: string
    category: 'general' | 'accuracy' | 'streak' | 'swish' | 'battle' | 'guess' | 'rank'
    icon: string
    color: string
    bgColor: string
    borderColor: string
    evaluate: (ctx: TrophyContext) => { unlocked: boolean; progress: number }
}

export interface EvaluatedTrophy extends TrophyDef {
    unlocked: boolean
    progress: number
}

// Helper: count wins in a list of games
function countWins(games: GameHistoryItem[]): number {
    return games.filter(g => g.result === 'WIN' || (g.correct != null && g.total != null && g.correct === g.total)).length
}

export const TROPHIES: TrophyDef[] = [
    // ── GENERAL ──────────────────────────────────────────
    {
        id: 'first_win',
        label: 'First Win',
        description: 'Win your first rated game',
        category: 'general',
        icon: 'Trophy',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.wins >= 1,
            progress: Math.min(100, ctx.wins >= 1 ? 100 : 0)
        })
    },
    {
        id: 'veteran',
        label: 'Veteran',
        description: 'Play 50 games',
        category: 'general',
        icon: 'Medal',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.gamesPlayed >= 50,
            progress: Math.min(100, Math.round((ctx.gamesPlayed / 50) * 100))
        })
    },
    {
        id: 'centurion',
        label: 'Centurion',
        description: 'Play 100 games',
        category: 'general',
        icon: 'Medal',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.gamesPlayed >= 100,
            progress: Math.min(100, Math.round((ctx.gamesPlayed / 100) * 100))
        })
    },
    {
        id: 'grinder',
        label: 'Grinder',
        description: 'Play 200 games',
        category: 'general',
        icon: 'Flame',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.gamesPlayed >= 200,
            progress: Math.min(100, Math.round((ctx.gamesPlayed / 200) * 100))
        })
    },

    // ── ACCURACY ─────────────────────────────────────────
    {
        id: 'sharpshooter',
        label: 'Sharpshooter',
        description: 'Reach 50% accuracy (min 10 games)',
        category: 'accuracy',
        icon: 'Target',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.gamesPlayed >= 10 && ctx.accuracy >= 50,
            progress: ctx.gamesPlayed < 10 ? Math.round((ctx.gamesPlayed / 10) * 50) : Math.min(100, Math.round((ctx.accuracy / 50) * 100))
        })
    },
    {
        id: 'sniper',
        label: 'Sniper',
        description: 'Reach 75% accuracy (min 20 games)',
        category: 'accuracy',
        icon: 'Target',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.gamesPlayed >= 20 && ctx.accuracy >= 75,
            progress: ctx.gamesPlayed < 20 ? Math.round((ctx.gamesPlayed / 20) * 50) : Math.min(100, Math.round((ctx.accuracy / 75) * 100))
        })
    },
    {
        id: 'perfect_aim',
        label: 'Perfect Aim',
        description: 'Reach 90% accuracy (min 30 games)',
        category: 'accuracy',
        icon: 'Target',
        color: 'text-teal-400',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.gamesPlayed >= 30 && ctx.accuracy >= 90,
            progress: ctx.gamesPlayed < 30 ? Math.round((ctx.gamesPlayed / 30) * 50) : Math.min(100, Math.round((ctx.accuracy / 90) * 100))
        })
    },

    // ── STREAKS ──────────────────────────────────────────
    {
        id: 'hot_hand',
        label: 'Hot Hand',
        description: 'Win 3 games in a row',
        category: 'streak',
        icon: 'Flame',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.maxStreak >= 3,
            progress: Math.min(100, Math.round((ctx.maxStreak / 3) * 100))
        })
    },
    {
        id: 'on_fire',
        label: 'On Fire',
        description: 'Win 5 games in a row',
        category: 'streak',
        icon: 'Flame',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.maxStreak >= 5,
            progress: Math.min(100, Math.round((ctx.maxStreak / 5) * 100))
        })
    },
    {
        id: 'untouchable',
        label: 'Untouchable',
        description: 'Win 10 games in a row',
        category: 'streak',
        icon: 'Crown',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.maxStreak >= 10,
            progress: Math.min(100, Math.round((ctx.maxStreak / 10) * 100))
        })
    },

    // ── SWISH MODE ───────────────────────────────────────
    {
        id: 'swish_rookie',
        label: 'Swish Rookie',
        description: 'Play your first Swish game',
        category: 'swish',
        icon: 'Zap',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.swishGames.length >= 1,
            progress: ctx.swishGames.length >= 1 ? 100 : 0
        })
    },
    {
        id: 'swish_master',
        label: 'Swish Master',
        description: 'Play 50 Swish games',
        category: 'swish',
        icon: 'Star',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.swishGames.length >= 50,
            progress: Math.min(100, Math.round((ctx.swishGames.length / 50) * 100))
        })
    },
    {
        id: 'perfect_grid',
        label: 'Perfect Grid',
        description: 'Complete a grid with 100% accuracy',
        category: 'swish',
        icon: 'Crown',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        evaluate: (ctx) => {
            const perfectGames = ctx.swishGames.filter(g => g.correct != null && g.total != null && g.correct === g.total && g.total > 0)
            return {
                unlocked: perfectGames.length >= 1,
                progress: perfectGames.length >= 1 ? 100 : 0
            }
        }
    },
    {
        id: 'speed_demon',
        label: 'Speed Demon',
        description: 'Win a Time Attack game',
        category: 'swish',
        icon: 'Zap',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        evaluate: (ctx) => {
            const taWins = ctx.swishGames.filter(g =>
                (g.subMode === 'TIME_ATTACK' || g.mode === 'TIME_ATTACK') &&
                (g.result === 'WIN' || (g.correct != null && g.total != null && g.correct === g.total))
            )
            return {
                unlocked: taWins.length >= 1,
                progress: taWins.length >= 1 ? 100 : 0
            }
        }
    },

    // ── BATTLE MODE ──────────────────────────────────────
    {
        id: 'arena_debut',
        label: 'Arena Debut',
        description: 'Play your first Battle',
        category: 'battle',
        icon: 'Swords',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.battleGames.length >= 1,
            progress: ctx.battleGames.length >= 1 ? 100 : 0
        })
    },
    {
        id: 'gladiator',
        label: 'Gladiator',
        description: 'Win 10 Battles',
        category: 'battle',
        icon: 'Swords',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        evaluate: (ctx) => {
            const wins = countWins(ctx.battleGames)
            return {
                unlocked: wins >= 10,
                progress: Math.min(100, Math.round((wins / 10) * 100))
            }
        }
    },
    {
        id: 'battle_hardened',
        label: 'Battle Hardened',
        description: 'Play 25 Battles',
        category: 'battle',
        icon: 'Shield',
        color: 'text-slate-300',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.battleGames.length >= 25,
            progress: Math.min(100, Math.round((ctx.battleGames.length / 25) * 100))
        })
    },
    {
        id: 'dominator',
        label: 'Dominator',
        description: '60%+ Battle win rate (min 10 games)',
        category: 'battle',
        icon: 'Crown',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        evaluate: (ctx) => {
            const total = ctx.battleGames.length
            const wins = countWins(ctx.battleGames)
            const wr = total > 0 ? (wins / total) * 100 : 0
            return {
                unlocked: total >= 10 && wr >= 60,
                progress: total < 10 ? Math.round((total / 10) * 50) : Math.min(100, Math.round((wr / 60) * 100))
            }
        }
    },

    // ── GUESS MODE ───────────────────────────────────────
    {
        id: 'detective',
        label: 'Detective',
        description: 'Guess 10 players correctly',
        category: 'guess',
        icon: 'Eye',
        color: 'text-violet-400',
        bgColor: 'bg-violet-500/10',
        borderColor: 'border-violet-500/20',
        evaluate: (ctx) => {
            const correct = ctx.guessGames.filter(g => g.correct && g.correct > 0).length
            return {
                unlocked: correct >= 10,
                progress: Math.min(100, Math.round((correct / 10) * 100))
            }
        }
    },
    {
        id: 'oracle',
        label: 'Oracle',
        description: 'Guess 50 players correctly',
        category: 'guess',
        icon: 'Eye',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        evaluate: (ctx) => {
            const correct = ctx.guessGames.filter(g => g.correct && g.correct > 0).length
            return {
                unlocked: correct >= 50,
                progress: Math.min(100, Math.round((correct / 50) * 100))
            }
        }
    },

    // ── RANK ─────────────────────────────────────────────
    {
        id: 'rising_star',
        label: 'Rising Star',
        description: 'Reach Semi-Pro rank',
        category: 'rank',
        icon: 'Zap',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.xp >= 1500,
            progress: Math.min(100, Math.round((ctx.xp / 1500) * 100))
        })
    },
    {
        id: 'all_star',
        label: 'All-Star',
        description: 'Reach All-Star rank',
        category: 'rank',
        icon: 'Star',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.xp >= 20000,
            progress: Math.min(100, Math.round((ctx.xp / 20000) * 100))
        })
    },
    {
        id: 'superstar_rank',
        label: 'Superstar',
        description: 'Reach Superstar rank',
        category: 'rank',
        icon: 'Flame',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.xp >= 50000,
            progress: Math.min(100, Math.round((ctx.xp / 50000) * 100))
        })
    },
    {
        id: 'hall_of_fame',
        label: 'Hall of Famer',
        description: 'Reach Hall of Fame rank',
        category: 'rank',
        icon: 'Crown',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        evaluate: (ctx) => ({
            unlocked: ctx.xp >= 85000,
            progress: Math.min(100, Math.round((ctx.xp / 85000) * 100))
        })
    },
]

export const TROPHY_CATEGORIES: { id: TrophyDef['category']; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'accuracy', label: 'Accuracy' },
    { id: 'streak', label: 'Streaks' },
    { id: 'swish', label: 'Swish Mode' },
    { id: 'battle', label: 'Battle Mode' },
    { id: 'guess', label: 'Guess Mode' },
    { id: 'rank', label: 'Rank' },
]

export function evaluateTrophies(ctx: TrophyContext): EvaluatedTrophy[] {
    return TROPHIES.map(trophy => {
        const { unlocked, progress } = trophy.evaluate(ctx)
        return { ...trophy, unlocked, progress }
    })
}

export function buildTrophyContext(
    stats: {
        gamesPlayed: number
        accuracy: number
        currentStreak: number
        bestScore: number
        avgScore: number
        xp: number
        rankData: { current: { id: string } }
        rawHistory: GameHistoryItem[]
    }
): TrophyContext {
    const rawHistory = stats.rawHistory || []

    const getCategory = (h: GameHistoryItem): 'SWISH' | 'GUESS' | 'BATTLE' => {
        const mode = h.mode?.toUpperCase?.() || ''
        if (mode === 'BATTLE') return 'BATTLE'
        if (mode === 'GUESS') return 'GUESS'
        if (mode === 'SWISH') return 'SWISH'
        const legacySwish = ['CLASSIC', 'TIME_ATTACK', 'SUDDEN_DEATH', 'BLIND']
        if (legacySwish.includes(mode)) return 'SWISH'
        if (h.difficulty || h.time || h.subMode) return 'SWISH'
        return 'GUESS'
    }

    const swishGames = rawHistory.filter(h => getCategory(h) === 'SWISH')
    const battleGames = rawHistory.filter(h => getCategory(h) === 'BATTLE')
    const guessGames = rawHistory.filter(h => getCategory(h) === 'GUESS')

    const ratedHistory = rawHistory.filter(h => getCategory(h) !== 'GUESS')
    const wins = ratedHistory.filter(h => h.result === 'WIN' || (h.correct != null && h.total != null && h.correct === h.total)).length

    // Compute maxStreak
    let maxStreak = 0
    let streak = 0
    for (const h of ratedHistory) {
        if (h.result === 'WIN' || (h.correct != null && h.total != null && h.correct === h.total)) {
            streak++
            maxStreak = Math.max(maxStreak, streak)
        } else {
            streak = 0
        }
    }

    return {
        gamesPlayed: stats.gamesPlayed,
        wins,
        accuracy: stats.accuracy,
        currentStreak: stats.currentStreak,
        maxStreak,
        bestScore: stats.bestScore,
        avgScore: stats.avgScore,
        xp: stats.xp,
        rankId: stats.rankData?.current?.id || 'ROOKIE',
        swishGames,
        battleGames,
        guessGames,
        rawHistory,
    }
}
