"use client"

import { cn } from "@/lib/utils"
import { RotateCcw, Share2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface GameOverModalProps {
  won: boolean
  score: number
  correctCells: number
  onNewGame: () => void
  gridSize?: number
  gameTime?: number
}

export function GameOverModal({
  won,
  score,
  correctCells,
  onNewGame,
  gridSize = 3,
  gameTime = 0,
}: GameOverModalProps) {
  const { t } = useLanguage()
  const totalCells = gridSize * gridSize
  const percentage = Math.round((correctCells / totalCells) * 100)

  // Determine tier based on percentage
  let tier = 0 // Airball (0%)
  if (percentage >= 100) tier = 6 // Hall of Fame
  else if (percentage >= 80) tier = 5 // All-Star
  else if (percentage >= 60) tier = 4 // Starter
  else if (percentage >= 40) tier = 3 // 6th Man
  else if (percentage >= 20) tier = 2 // Rookie
  else if (percentage >= 1) tier = 1 // G-League
  
  // Type-safe tier result keys
  const titleKeys = [
    'game.result_title_0', 'game.result_title_1', 'game.result_title_2',
    'game.result_title_3', 'game.result_title_4', 'game.result_title_5', 'game.result_title_6'
  ] as const
  const descKeys = [
    'game.result_desc_0', 'game.result_desc_1', 'game.result_desc_2',
    'game.result_desc_3', 'game.result_desc_4', 'game.result_desc_5', 'game.result_desc_6'
  ] as const
  
  const title = t(titleKeys[tier])
  const description = t(descKeys[tier])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleShare = () => {
    const timeStr = gameTime > 0 ? `\nTemps : ${formatTime(gameTime)}` : ""
    const text = `Swish Tac Toe\n${title}\nScore : ${score}\nCases : ${correctCells}/${totalCells}${timeStr}\n\nJouez sur : ${window.location.href}`
    
    if (navigator.share) {
      navigator.share({ text }).catch((err) => {
        // Ignore AbortError which happens if user cancels share
        if (err.name !== 'AbortError') {
            console.error('Share failed:', err)
        }
      })
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  const stats: { label: string; value: string }[] = [
    { label: t("game.score_final"), value: String(score) },
    { label: t("game.found"), value: `${correctCells}/${totalCells}` },
    { label: "Précision", value: `${percentage}%` },
    ...(gameTime > 0 ? [{ label: "Temps", value: formatTime(gameTime) }] : []),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-s16 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
        className="w-full max-w-sm overflow-hidden rounded-ref border border-line bg-surface shadow-window animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out"
      >
        <div className="p-s24 text-center">
          <p className="text-meta text-ink-muted">{won ? "Grille complète" : "Fin de partie"}</p>
          <h2 id="game-over-title" className="mt-s8 font-heading text-display-sm font-bold uppercase tracking-tight text-ink">
            {title}
          </h2>
          <p className="mx-auto mt-s8 max-w-[40ch] text-ink-muted">{description}</p>
        </div>

        <dl className="grid grid-cols-2 border-y border-line">
          {stats.map((s, i) => (
            <div key={s.label} className={cn("p-s16", i % 2 === 0 && "border-r border-line", i < stats.length - 2 && "border-b border-line")}>
              <dt className="text-meta text-ink-muted">{s.label}</dt>
              <dd className="mt-s8 font-heading text-display-sm font-bold tabular-nums text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-s8 p-s16">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex h-11 flex-1 items-center justify-center gap-s8 rounded-nested border border-line font-medium text-ink-soft transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            <Share2 className="size-4" strokeWidth={1.75} />
            {t("game.share")}
          </button>
          <button
            type="button"
            onClick={onNewGame}
            className="chamfer inline-flex h-11 flex-1 items-center justify-center gap-s8 bg-action font-heading text-meta font-bold uppercase tracking-wider text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
          >
            <RotateCcw className="size-4" strokeWidth={1.75} />
            {t("game.reset")}
          </button>
        </div>
      </div>
    </div>
  )
}
