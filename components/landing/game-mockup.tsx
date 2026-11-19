import Image from "next/image"
import { Search, X } from "lucide-react"
import type { Criteria } from "@/lib/nba-data"
import { CriteriaHeader } from "@/components/game/criteria-header"
import { ScorePanel } from "@/components/game/score-panel"
import { useLanguage } from "@/contexts/language-context"

const headshot = (id: number) => `https://cdn.nba.com/headshots/nba/latest/1040x760/${id}.png`

type Cell = { name: string; nbaId: number } | "selected" | null

const COLS: Criteria[] = [
  { type: "mvp", value: "mvp", label: "MVP" },
  { type: "champion", value: "champion", label: "Champion" },
  { type: "dpoy", value: "dpoy", label: "DPOY" },
]

const ROWS: Criteria[] = [
  { type: "team", value: "LAL", label: "Lakers" },
  { type: "team", value: "BOS", label: "Celtics" },
  { type: "team", value: "CHI", label: "Bulls" },
]

// Every filled answer below is valid in the real game data.
const GRID: Cell[][] = [
  [{ name: "Kobe Bryant", nbaId: 977 }, { name: "Shaquille O'Neal", nbaId: 406 }, "selected"],
  [{ name: "Larry Bird", nbaId: 1449 }, null, { name: "Kevin Garnett", nbaId: 708 }],
  [{ name: "Michael Jordan", nbaId: 893 }, null, null],
]

// Same markup and classes as components/game/game-cell.tsx
function MockCell({ cell }: { cell: Cell }) {
  if (cell === "selected") {
    return <div className="aspect-square w-full rounded-nested border border-transparent bg-surface-2 ring-2 ring-inset ring-brand-blue-soft" />
  }
  if (!cell) {
    return <div className="aspect-square w-full rounded-nested border border-line bg-canvas" />
  }
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-nested border border-transparent bg-canvas">
      <Image src={headshot(cell.nbaId)} alt={cell.name} fill unoptimized sizes="160px" className="object-cover object-top scale-110 translate-y-[6%]" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-s8 pb-s8 pt-s24">
        <span className="block text-center font-heading text-[11px] md:text-meta font-bold uppercase leading-tight text-white">{cell.name}</span>
      </span>
    </div>
  )
}

export function GameMockup() {
  const { language } = useLanguage()
  const fr = language === "fr"

  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-window">
      {/* Window chrome */}
      <div className="relative flex h-10 items-center gap-s8 border-b border-line px-s16">
        <span className="size-3 rounded-full bg-[#ff5f57]/80" />
        <span className="size-3 rounded-full bg-[#febc2e]/80" />
        <span className="size-3 rounded-full bg-[#28c840]/80" />
        <span className="pointer-events-none absolute inset-x-0 text-center text-meta text-ink-muted">Swish Tac Toe</span>
      </div>

      {/* Page content: scoreboard + grid, as on /game */}
      <div className="flex flex-col items-center gap-s24 bg-canvas p-s16 sm:p-s24 lg:flex-row lg:items-start lg:justify-center lg:gap-s32 lg:p-s32">
        <div className="w-full max-w-[520px] space-y-s16 sm:space-y-s24">
          <ScorePanel score={5} attempts={5} maxAttempts={15} correctCells={5} gameTime={83} />

          <div className="grid grid-cols-4 gap-[4px] sm:gap-s8">
            <div className="aspect-square" />
            {COLS.map((c) => (
              <CriteriaHeader key={c.type} criteria={c} direction="col" />
            ))}
            {ROWS.map((r, ri) => (
              <div key={r.value} className="contents">
                <CriteriaHeader criteria={r} direction="row" />
                {GRID[ri].map((cell, ci) => (
                  <MockCell key={ci} cell={cell} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Player search dialog: same structure as components/game/player-input.tsx */}
        <div className="hidden w-full max-w-[400px] lg:mt-[88px] lg:block">
          <div className="overflow-hidden rounded-ref border border-line bg-surface shadow-window">
            <div className="border-b border-line p-s16">
              <div className="flex items-center justify-between gap-s16">
                <h3 className="font-heading text-lead font-bold uppercase tracking-tight text-ink">
                  {fr ? "Trouver un joueur" : "Find a player"}
                </h3>
                <X className="size-5 text-ink-muted" strokeWidth={1.75} />
              </div>
              <p className="mt-s8 text-meta text-ink-muted">
                {fr ? "Qui a joué pour les " : "Who played for the "}
                <span className="font-semibold text-ink">Lakers</span>
                {fr ? " et est " : " and is "}
                <span className="font-semibold text-ink">DPOY</span> ?
              </p>
            </div>

            <div className="p-s16">
              <div className="relative">
                <Search className="absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                <div className="flex h-12 items-center rounded-nested border border-brand-blue-soft bg-canvas pl-s48 text-body text-ink">
                  Rodm
                  <span className="ml-px h-5 w-px animate-pulse bg-ink" />
                </div>
              </div>
              <div className="mt-s16 flex items-center gap-s16 rounded-nested bg-surface-2 px-s8 py-s8">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-full border border-line bg-canvas">
                  <Image src={headshot(23)} alt="" fill unoptimized className="object-cover object-top scale-110 translate-y-[2px]" />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-ink">Dennis Rodman</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-s8 border-t border-line p-s16">
              <span className="inline-flex h-10 items-center px-s16 font-medium text-ink-soft">{fr ? "Annuler" : "Cancel"}</span>
              <span className="chamfer inline-flex h-10 items-center bg-action px-s24 font-heading text-meta font-bold uppercase tracking-wider text-white">
                {fr ? "Valider" : "Confirm"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
