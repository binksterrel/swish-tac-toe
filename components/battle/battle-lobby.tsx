"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, ChevronRight, ChevronLeft, Users, RefreshCw, Zap, Globe, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { NBA_TEAMS, getTeamLogoUrl } from "@/lib/nba-data"
import { cn } from "@/lib/utils"
import { getPusherClient } from "@/lib/pusher-client"
import { Segmented } from "@/components/game/segmented"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { TeamLogo } from "@/components/common/team-logo"

interface BattleLobbyProps {
  onJoin: (code: string, name: string) => Promise<void>
  onCreate: (name: string, difficulty: string) => Promise<void>
  isLoading: boolean
}

interface OpenBattle {
  code: string
  host_name: string
  difficulty: string
  created_at: string
}

export function BattleLobby({ onJoin, onCreate, isLoading }: BattleLobbyProps) {
  const { t } = useLanguage()
  const { user, supabase } = useAuth()
  const router = useRouter()
  
  const [view, setView] = useState<'selection' | 'online'>('selection')
  const DEFAULT_TEAM = "LAL"
  
  // Initialize with user preferences if available
  const [name, setName] = useState(() => {
    return user?.user_metadata?.username || user?.user_metadata?.full_name || ""
  })
  
  const [code, setCode] = useState("")
  const [mode, setMode] = useState<'menu' | 'join' | 'create'>('menu')
  const [difficulty, setDifficulty] = useState("medium")
  
  const [selectedTeam, setSelectedTeam] = useState(() => {
    return user?.user_metadata?.favorite_team || DEFAULT_TEAM
  })
  const [prefsLoaded, setPrefsLoaded] = useState(false)

  // Update when user changes (though it shouldn't change mid-session usually)
  useEffect(() => {
    if (user) {
        setName((prev: string) => prev || user.user_metadata?.username || user.user_metadata?.full_name || "")
        setSelectedTeam((prev: string) => user.user_metadata?.favorite_team || prev || DEFAULT_TEAM)
    }
  }, [user])

  // Hydrate defaults from Supabase profile (persists favorite team & username)
  useEffect(() => {
    let isMounted = true
    const loadProfilePrefs = async () => {
        if (!user || prefsLoaded) return
        const { data, error } = await supabase
            .from('profiles')
            .select('favorite_team, username')
            .eq('id', user.id)
            .single()

        if (!isMounted) return
        if (!error && data) {
            setSelectedTeam((prev: string) => {
                const preferred = data.favorite_team || prev || DEFAULT_TEAM
                return (prev === DEFAULT_TEAM || !prev) ? preferred : prev
            })
            setName((prev: string) => prev || data.username || "")
        }
        setPrefsLoaded(true)
    }
    loadProfilePrefs()
    return () => { isMounted = false }
  }, [user, supabase, prefsLoaded])
  
  // Public Battles
  const [openBattles, setOpenBattles] = useState<OpenBattle[]>([])
  const [loadingBattles, setLoadingBattles] = useState(false)

  // Only include the 30 current NBA teams
  const CURRENT_NBA_TEAMS = [
    "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
    "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
    "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"
  ]
  const teamKeys = CURRENT_NBA_TEAMS.filter(t => NBA_TEAMS[t])

  const fetchOpenBattles = async () => {
    setLoadingBattles(true)
    try {
        const res = await fetch('/api/battle/list')
        const data = await res.json()
        if (data.battles) {
            setOpenBattles(data.battles)
        }
    } catch (e) {
        // Silent fail
    } finally {
        setLoadingBattles(false)
    }
  }

  // Fetch & Subscribe only when in Online mode + Join sub-mode
  useEffect(() => {
    if (view !== 'online' || mode !== 'join') return

    fetchOpenBattles()

    const channel = getPusherClient().subscribe('lobby-updates')
    
    channel.bind('battle-created', (newBattle: OpenBattle) => {
        setOpenBattles(prev => {
            if (prev.find(b => b.code === newBattle.code)) return prev
            return [newBattle, ...prev]
        })
        toast.info("Nouvelle partie détectée !", { duration: 2000 })
    })

    channel.bind('battle-removed', (data: { code: string }) => {
        setOpenBattles(prev => prev.filter(b => b.code !== data.code))
    })

    return () => {
        getPusherClient().unsubscribe('lobby-updates')
    }
  }, [view, mode])

  const handleCreateSubmit = () => {
    if (!name) {
        toast.error(t('battle.enter_nickname'))
        return
    }
    const fullName = `${selectedTeam}|${name}`
    onCreate(fullName, difficulty)
  }

  const handleJoin = () => {
    if (!name) {
        toast.error(t('battle.enter_nickname'))
        return
    }
    if (!code) {
        toast.error(t('battle.enter_code_error') || "Code requis")
        return
    }
    const fullName = `${selectedTeam}|${name}`
    onJoin(code, fullName)
  }

  const handleJoinOpenBattle = (battleCode: string) => {
    if (!name) {
        toast.error(t('battle.enter_nickname'))
        return
    }
    const fullName = `${selectedTeam}|${name}`
    onJoin(battleCode, fullName)
  }

  const BTN_PRIMARY =
    "chamfer inline-flex h-12 w-full items-center justify-center gap-s8 bg-action px-s24 font-heading text-body font-bold uppercase tracking-wider text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
  const BTN_SECONDARY =
    "inline-flex h-12 w-full items-center justify-center gap-s8 rounded-nested border border-line px-s24 font-heading text-body font-bold uppercase tracking-wider text-ink transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
  const BTN_GHOST =
    "inline-flex h-10 items-center gap-s8 rounded-nested px-s8 text-meta font-medium text-ink-muted transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
  const FIELD =
    "h-12 rounded-nested border-line bg-canvas px-s16 text-body text-ink placeholder:text-ink-muted focus-visible:ring-0 focus-visible:border-brand-blue-soft"
  const LABEL = "text-meta text-ink-muted"

  // Sub-views unfold from the card they live in
  const panel = "flex flex-col gap-s24 animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out"

  // SCREEN 1: MODE SELECTION (Online vs Local)
  if (view === 'selection') {
      // Mini board shown on each card: host = blue, guest = red (same as in a live game)
      type Mark = 'h' | 'g' | null
      const BOARD_ONLINE: Mark[] = ['h', 'g', null, 'g', 'h', null, null, null, 'h']
      const BOARD_LOCAL: Mark[] = ['g', 'h', null, 'h', 'g', null, null, null, 'g']
      const MiniBoard = ({ cells }: { cells: Mark[] }) => (
        <div aria-hidden="true" className="grid grid-cols-3 gap-[4px]">
          {cells.map((c, i) => (
            <span
              key={i}
              className={cn(
                "size-7 rounded-[6px] border",
                c === 'h' ? "border-transparent bg-brand-blue-soft" : c === 'g' ? "border-transparent bg-action" : "border-line bg-surface-2",
              )}
            />
          ))}
        </div>
      )

      const modes = [
        {
          key: 'online', icon: Globe, title: t('battle.online_title'), desc: t('battle.online_desc'), meta: t('battle.online_meta'),
          onClick: () => setView('online'),
          board: BOARD_ONLINE,
          chips: <span className="rounded-[6px] border border-line bg-canvas px-s8 py-[2px] font-heading text-meta font-bold tabular-nums tracking-wider text-ink-soft">NBA-XXXX</span>,
        },
        {
          key: 'local', icon: Users, title: t('battle.local_title'), desc: t('battle.local_desc'), meta: t('battle.local_meta'),
          onClick: () => router.push('/battle/local'),
          board: BOARD_LOCAL,
          chips: (
            <span className="flex items-center gap-s8">
              <span className="rounded-[6px] border border-brand-blue-soft/40 px-s8 py-[2px] text-meta font-semibold text-brand-blue-soft">{t('battle.player_1')}</span>
              <span className="rounded-[6px] border border-action/40 px-s8 py-[2px] text-meta font-semibold text-action">{t('battle.player_2')}</span>
            </span>
          ),
        },
      ]
      return (
        <div className="w-full max-w-3xl mx-auto">
            <p className="font-heading text-meta font-semibold uppercase tracking-wider text-ink-muted">{t('battle.hero_eyebrow')}</p>
            <h1 className="mt-s8 font-heading text-display-sm font-bold uppercase tracking-tight text-ink">
                {t('battle.hero_title')}
            </h1>
            <p className="mt-s8 max-w-[60ch] text-ink-muted">{t('battle.hero_sub')}</p>

            <div className="mt-s32 grid grid-cols-1 sm:grid-cols-2 gap-s16">
                {modes.map(({ key, icon: Icon, title, desc, meta, onClick, chips, board }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={onClick}
                        className="group flex flex-col rounded-ref border border-line bg-surface p-s16 text-left shadow-soft transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:border-ink-muted/40 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                    >
                        {/* Preview */}
                        <span className="flex h-36 flex-col items-center justify-center gap-s16 rounded-nested border border-line bg-canvas">
                            <MiniBoard cells={board} />
                            {chips}
                        </span>

                        <span className="mt-s16 flex items-center gap-s8 font-heading text-lead font-bold uppercase tracking-tight text-ink">
                            <Icon className="size-5 text-ink-muted" strokeWidth={1.75} />
                            {title}
                        </span>
                        <span className="mt-s8 text-meta text-ink-muted">{desc}</span>
                        <span className="mt-s16 flex w-full items-center justify-between border-t border-line pt-s16">
                            <span className="text-meta text-ink-muted">{meta}</span>
                            <span className="inline-flex items-center gap-s8 font-heading text-meta font-bold uppercase tracking-wider text-ink">
                                {t('battle.choose')}
                                <ChevronRight className="size-4 transition-transform duration-[120ms] group-hover:translate-x-1 group-hover:duration-[200ms] ease-snappy" strokeWidth={1.75} />
                            </span>
                        </span>
                    </button>
                ))}
            </div>
        </div>
      )
  }

  const cycleTeam = (dir: 1 | -1) => {
    const idx = teamKeys.indexOf(selectedTeam)
    const nextIdx = (idx + dir + teamKeys.length) % teamKeys.length
    setSelectedTeam(teamKeys[nextIdx])
  }

  // SCREEN 2: ONLINE LOBBY
  return (
    <div className="w-full max-w-md mx-auto">
        <button type="button" onClick={() => setView('selection')} className={BTN_GHOST}>
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            {t('battle.back')}
        </button>

        <div className="mt-s8 rounded-ref border border-line bg-surface p-s24 shadow-window animate-in fade-in zoom-in-95 duration-200 ease-out">
            <div>
                <p className="font-heading text-meta font-semibold uppercase tracking-wider text-ink-muted">{t('battle.online_meta')}</p>
                <h1 className="mt-s8 font-heading text-display-sm font-bold uppercase tracking-tight text-ink">{t('battle.online_heading')}</h1>
            </div>

            {!isLoading ? (
                <div className="mt-s24">
                    {mode === 'menu' && (
                        <div key="menu" className={panel}>
                            {/* Team picker */}
                            <div className="flex flex-col gap-s8">
                                <span className={LABEL}>{t('battle.your_team')}</span>
                                <div className="flex items-center justify-between gap-s16 rounded-nested border border-line bg-canvas p-s16">
                                    <button type="button" aria-label="Équipe précédente" onClick={() => cycleTeam(-1)} className="inline-flex size-10 items-center justify-center rounded-nested text-ink-muted transition-colors duration-[120ms] ease-snappy hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-action">
                                        <ChevronLeft className="size-5" strokeWidth={1.75} />
                                    </button>
                                    <div className="flex min-w-0 flex-1 items-center gap-s16">
                                        <span className="relative flex size-16 shrink-0 items-center justify-center">
                                            <TeamLogo teamId={selectedTeam} size={64} className="h-full w-full" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate font-heading text-lead font-bold uppercase tracking-tight text-ink">{NBA_TEAMS[selectedTeam].name}</span>
                                            <span className="block truncate text-meta text-ink-muted">{NBA_TEAMS[selectedTeam].city}</span>
                                        </span>
                                    </div>
                                    <button type="button" aria-label="Équipe suivante" onClick={() => cycleTeam(1)} className="inline-flex size-10 items-center justify-center rounded-nested text-ink-muted transition-colors duration-[120ms] ease-snappy hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-action">
                                        <ChevronRight className="size-5" strokeWidth={1.75} />
                                    </button>
                                </div>
                            </div>

                            <label className="flex flex-col gap-s8">
                                <span className={LABEL}>{t('battle.nickname')}</span>
                                <Input
                                    placeholder={t('battle.nickname_placeholder')}
                                    className={FIELD}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={12}
                                />
                            </label>

                            <div className="flex flex-col gap-s8">
                                <button type="button" onClick={() => setMode('create')} disabled={!name} className={BTN_PRIMARY}>
                                    {t('battle.create_room')}
                                </button>
                                <button type="button" onClick={() => setMode('join')} disabled={!name} className={BTN_SECONDARY}>
                                    {t('battle.join_room')}
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'create' && (
                        <div key="create" className={panel}>
                            <Segmented
                                label={t('battle.select_difficulty')}
                                value={difficulty as 'easy' | 'medium' | 'hard'}
                                onChange={(v) => setDifficulty(v)}
                                options={[
                                    { value: 'easy', label: t('battle.difficulty_easy') },
                                    { value: 'medium', label: t('battle.difficulty_medium') },
                                    { value: 'hard', label: t('battle.difficulty_hard') },
                                ]}
                            />
                            <div className="flex flex-col gap-s8">
                                <button type="button" onClick={handleCreateSubmit} className={BTN_PRIMARY}>
                                    <Zap className="size-4" strokeWidth={1.75} />
                                    {t('battle.start')}
                                </button>
                                <button type="button" onClick={() => setMode('menu')} className={cn(BTN_GHOST, "self-center")}>
                                    {t('battle.back')}
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'join' && (
                        <div key="join" className={panel}>
                            <label className="flex flex-col gap-s8">
                                <span className={LABEL}>{t('battle.room_code')}</span>
                                <Input
                                    placeholder="NBA-XXXX"
                                    className={cn(FIELD, "font-heading text-lead uppercase tracking-wider tabular-nums")}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    maxLength={8}
                                    autoFocus
                                />
                            </label>

                            <button type="button" onClick={handleJoin} className={BTN_PRIMARY}>
                                {t('battle.enter_arena')}
                            </button>

                            {/* Public games */}
                            <div className="border-t border-line pt-s24">
                                <div className="flex items-center justify-between">
                                    <h3 className="inline-flex items-center gap-s8 text-meta font-semibold text-ink-soft">
                                        <span className="size-2 rounded-full bg-success" />
                                        {t('battle.open_battles')}
                                    </h3>
                                    <button type="button" aria-label="Actualiser" onClick={fetchOpenBattles} className="inline-flex size-8 items-center justify-center rounded-nested text-ink-muted transition-colors duration-[120ms] ease-snappy hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-action">
                                        <RefreshCw className={cn("size-4", loadingBattles && "animate-spin")} strokeWidth={1.75} />
                                    </button>
                                </div>

                                <div className="mt-s16 flex max-h-48 flex-col gap-s8 overflow-y-auto">
                                    {loadingBattles ? (
                                        <div className="py-s16 text-center"><Loader2 className="mx-auto size-4 animate-spin text-ink-muted" /></div>
                                    ) : openBattles.length > 0 ? (
                                        openBattles.map(battle => (
                                            <button
                                                key={battle.code}
                                                type="button"
                                                onClick={() => handleJoinOpenBattle(battle.code)}
                                                className="group flex items-center justify-between gap-s16 rounded-nested border border-line bg-canvas px-s16 py-s8 text-left transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-action"
                                            >
                                                <span className="flex min-w-0 items-center gap-s8">
                                                    <span className="truncate font-medium text-ink">
                                                        {battle.host_name?.includes('|') ? battle.host_name.split('|')[1] : battle.host_name}
                                                    </span>
                                                    <span className="rounded-[4px] border border-line px-[6px] py-[2px] text-meta text-ink-muted">
                                                        {battle.difficulty || 'medium'}
                                                    </span>
                                                </span>
                                                <span className="font-heading text-meta font-bold uppercase tracking-wider text-ink-muted transition-colors group-hover:text-ink">
                                                    {t('battle.join_short')}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="rounded-nested border border-dashed border-line py-s24 text-center text-meta text-ink-muted">{t('battle.no_public')}</p>
                                    )}
                                </div>
                            </div>

                            <button type="button" onClick={() => setMode('menu')} className={cn(BTN_GHOST, "self-center")}>
                                {t('battle.back')}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-s16 py-s48">
                    <Loader2 className="size-6 animate-spin text-ink-muted" />
                    <p className="text-meta text-ink-muted">
                        {mode === 'create' ? t('battle.initializing') : t('battle.connecting')}
                    </p>
                </div>
            )}
        </div>
    </div>
  )
}
