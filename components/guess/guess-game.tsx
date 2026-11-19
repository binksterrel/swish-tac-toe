"use client"

import { useState, useEffect } from "react"
import { NBAPlayer, getRandomNotablePlayer, getPlayerSuggestions } from "@/lib/nba-data"
import { TeamLogo } from "@/components/common/team-logo"
import { PlayerPhoto } from "@/components/common/player-photo"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, ArrowRight, RotateCcw, Target, HelpCircle, Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

export function GuessGame() {
  const { t } = useLanguage()
  const [targetPlayer, setTargetPlayer] = useState<NBAPlayer | null>(null)
  const [guess, setGuess] = useState("")
  const [suggestions, setSuggestions] = useState<NBAPlayer[]>([])
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing")
  const [streak, setStreak] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Initialization - GUESS mode is casual, streak is session-only
  useEffect(() => {
    setMounted(true)
    startNewGame()
    // Note: Streak starts at 0 for each session (casual mode, not affecting OVR rating)
  }, [])

  // Note: GUESS mode does NOT record to database - it doesn't affect OVR rating/stats
  // Only saves to localStorage for history display

  const saveToLocalStorage = (score: number, correct: number, total: number) => {
      try {
          const historyItem = {
              score,
              correct,
              total,
              date: new Date().toISOString(),
              mode: 'GUESS', // Identify as Guess the Player game
              targetPlayer: targetPlayer?.name // For legacy detection
          }
          const saved = localStorage.getItem("nba-ttt-history")
          const history = saved ? JSON.parse(saved) : []
          const newHistory = [historyItem, ...history].slice(0, 50) // Keep last 50
          localStorage.setItem("nba-ttt-history", JSON.stringify(newHistory))
      } catch (e) {
          console.error("Failed to save to local storage", e)
      }
  }

  const startNewGame = () => {
    const newPlayer = getRandomNotablePlayer()
    setTargetPlayer(newPlayer)
    setGuess("")
    setSuggestions([])
    setStatus("playing")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGuess(value)
    if (value.length > 1) {
      setSuggestions(getPlayerSuggestions(value))
    } else {
      setSuggestions([])
    }
  }

  const handleGuess = (player: NBAPlayer) => {
    if (!targetPlayer) return

    if (player.id === targetPlayer.id) {
      setStatus("won")
      setStreak(s => s + 1)
      setErrorMessage(null)
      saveToLocalStorage(100, 1, 1) // 100 pts for win, 1/1 correct
    } else {
      setErrorMessage(t('gest.error_incorrect').replace('{name}', player.name))
      setGuess("")
      setSuggestions([])
      setTimeout(() => setErrorMessage(null), 2000)
    }
  }

  const handleGiveUp = () => {
    setStatus("lost")
    setStreak(0)
    saveToLocalStorage(0, 0, 1) // 0 pts, 0/1 correct
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault()
      handleGuess(suggestions[0])
    }
  }

  if (!mounted || !targetPlayer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-line border-t-ink" aria-label={t('gest.loading')} />
      </div>
    )
  }

  const origin = targetPlayer.college && targetPlayer.college !== "None" ? targetPlayer.college : targetPlayer.country
  const SECTION_TITLE = "inline-flex items-center gap-s8 font-heading text-meta font-bold uppercase tracking-wider text-ink-soft"

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-s32">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-s24">
        <div className="min-w-0">
          <p className="font-heading text-meta font-semibold uppercase tracking-wider text-ink-muted">{t('gest.title')}</p>
          <h1 className="mt-s8 font-heading text-display-sm font-bold uppercase tracking-tight text-ink">{t('gest.guess_the_player')}</h1>
          <p className="mt-s8 text-ink-muted">{t('gest.subtitle')}</p>
        </div>
        <div className="flex items-center gap-s24">
          <div className="text-right">
            <p className="text-meta text-ink-muted">{t('gest.streak')}</p>
            <p className="font-heading text-display-sm font-bold tabular-nums text-ink">
              {streak} <span className="font-sans text-meta font-normal text-ink-muted">{t('gest.streak_unit')}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => startNewGame()}
            className="inline-flex h-10 items-center gap-s8 rounded-nested border border-line px-s16 font-heading text-meta font-bold uppercase tracking-wider text-ink-soft transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            <RotateCcw className="size-4" strokeWidth={1.75} />
            {t('gest.skip')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-s16 md:grid-cols-12">
        {/* CLUES */}
        <section aria-label={t('gest.clues')} className="md:col-span-7 rounded-ref border border-line bg-surface shadow-soft">
          {/* Career path */}
          <div className="p-s24">
            <h2 className={SECTION_TITLE}>
              <Users className="size-4 text-ink-muted" strokeWidth={1.75} />
              {t('gest.career_path')}
            </h2>
            <ol className="mt-s16 flex flex-wrap items-center gap-s8">
              {targetPlayer.teams.map((team, idx) => (
                <li key={`${team}-${idx}`} className="flex items-center gap-s8">
                  {idx > 0 && <ArrowRight className="size-4 text-ink-muted/60" strokeWidth={1.75} />}
                  <span className="flex flex-col items-center gap-s8">
                    <span className="flex size-14 items-center justify-center rounded-nested border border-line bg-canvas p-s8">
                      <TeamLogo teamId={team} size={48} className="h-full w-full" />
                    </span>
                    <span className="text-meta font-semibold tabular-nums text-ink-muted">{team}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 border-t border-line sm:grid-cols-2">
            {/* Awards */}
            <div className="p-s24 sm:border-r sm:border-line">
              <h2 className={SECTION_TITLE}>
                <Trophy className="size-4 text-ink-muted" strokeWidth={1.75} />
                {t('gest.awards')}
              </h2>
              <div className="mt-s16 flex flex-wrap gap-s8">
                {targetPlayer.awards.length > 0 ? (
                  targetPlayer.awards.map((award, i) => (
                    <Badge key={i} className="rounded-[6px] border border-line bg-surface-2 px-s8 py-[2px] font-heading text-meta font-bold uppercase tracking-wide text-ink-soft shadow-none hover:bg-surface-2">
                      {award}
                    </Badge>
                  ))
                ) : (
                  <span className="text-meta text-ink-muted">{t('gest.no_awards')}</span>
                )}
                {targetPlayer.championYears && targetPlayer.championYears.length > 0 && (
                  <Badge className="rounded-[6px] border-none bg-brand-blue px-s8 py-[2px] font-heading text-meta font-bold uppercase tracking-wide text-white shadow-none hover:bg-brand-blue">
                    {targetPlayer.championYears.length}× {t('gest.champ')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Profile */}
            <div className="border-t border-line p-s24 sm:border-t-0">
              <h2 className={SECTION_TITLE}>
                <Target className="size-4 text-ink-muted" strokeWidth={1.75} />
                {t('gest.profile')}
              </h2>
              <dl className="mt-s16 flex flex-col">
                {[
                  { k: t('gest.position'), v: targetPlayer.position },
                  { k: t('gest.era'), v: targetPlayer.decades[0] },
                  { k: t('gest.origin'), v: origin },
                ].map(({ k, v }, i) => (
                  <div key={k} className={cn("flex items-center justify-between gap-s16 py-s8", i > 0 && "border-t border-line")}>
                    <dt className="text-meta text-ink-muted">{k}</dt>
                    <dd className="truncate font-heading text-body font-bold tracking-wide text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* INTERACTION */}
        <section
          aria-live="polite"
          className={cn(
            "md:col-span-5 flex flex-col items-center justify-center rounded-ref border bg-surface p-s24 md:p-s32 shadow-soft transition-colors duration-[200ms] ease-snappy",
            status === 'won' ? 'border-success/60' : status === 'lost' ? 'border-action/60' : 'border-line',
          )}
        >
          {status === 'playing' ? (
            <div className="flex w-full flex-col items-center gap-s24">
              <div className="flex size-32 items-center justify-center rounded-ref border border-dashed border-line bg-canvas">
                <HelpCircle className="size-10 text-ink-muted/60" strokeWidth={1.5} />
              </div>

              <div className="text-center">
                <h2 className="font-heading text-display-sm font-bold uppercase tracking-tight text-ink">{t('gest.who_is')}</h2>
                <p className="mt-s8 text-meta text-ink-muted">{t('gest.type_name')}</p>
              </div>

              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                <Input
                  placeholder={t('gest.placeholder')}
                  value={guess}
                  onChange={handleSearchChange}
                  onKeyDown={onKeyDown}
                  aria-invalid={!!errorMessage}
                  className={cn(
                    "h-12 w-full rounded-nested bg-canvas pl-s48 text-body text-ink placeholder:text-ink-muted focus-visible:ring-0",
                    errorMessage ? "border-action" : "border-line focus-visible:border-brand-blue-soft",
                  )}
                  autoFocus
                  autoComplete="off"
                />

                {suggestions.length > 0 && (
                  <ul role="listbox" className="absolute left-0 right-0 top-full z-50 mt-s8 max-h-64 origin-top overflow-y-auto rounded-nested border border-line bg-surface p-[4px] shadow-window animate-in fade-in slide-in-from-top-1 duration-200 ease-out">
                    {suggestions.map(p => (
                      <li key={p.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          onClick={() => handleGuess(p)}
                          className="flex w-full items-center justify-between gap-s16 rounded-[6px] px-s16 py-s8 text-left transition-colors duration-[120ms] ease-snappy hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
                        >
                          <span className="truncate font-medium text-ink">{p.name}</span>
                          <span className="shrink-0 text-meta tabular-nums text-ink-muted">{p.teams[p.teams.length - 1]}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className={cn("min-h-[20px] text-center text-meta", errorMessage ? "text-action" : "text-transparent")}>
                {errorMessage ?? "·"}
              </p>

              <button
                type="button"
                onClick={handleGiveUp}
                className="text-meta text-ink-muted underline decoration-line underline-offset-4 transition-colors duration-[120ms] ease-snappy hover:text-ink hover:decoration-action focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action rounded-[2px]"
              >
                {t('gest.give_up')}
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center gap-s24 animate-in fade-in zoom-in-95 duration-200 ease-out">
              <span className={cn(
                "rounded-[6px] px-s8 py-[2px] font-heading text-meta font-bold uppercase tracking-wider",
                status === 'won' ? "bg-success/15 text-success" : "bg-action/15 text-action",
              )}>
                {status === 'won' ? t('gest.correct') : t('gest.revealed')}
              </span>

              <div className={cn(
                "relative size-48 overflow-hidden rounded-ref border-2 bg-canvas",
                status === 'won' ? 'border-success' : 'border-action',
              )}>
                <PlayerPhoto player={targetPlayer} fill className="object-cover object-top" />
              </div>

              <div className="text-center">
                <p className="text-meta text-ink-muted">{t('gest.was')}</p>
                <h2 className="mt-s8 font-heading text-display-sm font-bold uppercase tracking-tight text-ink">{targetPlayer.name}</h2>
              </div>

              <button
                type="button"
                onClick={startNewGame}
                className="chamfer group inline-flex h-12 w-full max-w-xs items-center justify-center gap-s8 bg-action px-s24 font-heading text-body font-bold uppercase tracking-wider text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
              >
                {t('gest.next')}
                <ArrowRight className="size-4 transition-transform duration-[120ms] group-hover:translate-x-1 group-hover:duration-[200ms] ease-snappy" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
