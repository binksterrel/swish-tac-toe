"use client"

import { cn } from "@/lib/utils"
import type { CellState } from "@/hooks/use-game-state"
import { PlayerPhoto } from "@/components/common/player-photo"
import { X, Plus } from "lucide-react"

interface GameCellProps {
  cell: CellState
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

export function GameCell({ cell, isSelected, onClick, disabled }: GameCellProps) {
  const isEmpty = cell.status === "empty"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelected}
      className={cn(
        "group relative aspect-square w-full overflow-hidden rounded-nested border",
        "transition-[background-color,border-color,box-shadow] duration-[120ms] hover:duration-[200ms] ease-snappy",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action",
        isEmpty && !isSelected && ["border-line bg-canvas", !disabled && "cursor-pointer hover:border-ink-muted/40 hover:bg-surface-2"],
        isEmpty && isSelected && "z-10 border-transparent bg-surface-2 ring-2 ring-inset ring-brand-blue-soft",
        cell.status === "correct" && "cursor-default border-transparent bg-canvas",
        cell.status === "incorrect" && "border-action bg-action/10",
        disabled && isEmpty && "cursor-not-allowed",
      )}
    >
      {/* Empty: hint that the cell is playable */}
      {isEmpty && !isSelected && !disabled && (
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100 group-hover:duration-[200ms]">
          <Plus className="size-6 text-ink-muted" strokeWidth={1.5} />
        </span>
      )}

      {/* Correct: headshot with name */}
      {cell.status === "correct" && cell.player ? (
        <>
          <span className="absolute inset-0">
            <PlayerPhoto player={cell.player} fill className="object-cover object-top scale-110 translate-y-[6%]" />
          </span>
          {/* Scrim for name legibility (functional, not decorative) */}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-s8 pb-s8 pt-s24">
            <span className="block text-center font-heading text-[11px] md:text-meta font-bold uppercase leading-tight text-white">
              {cell.player.name}
            </span>
          </span>

          <span className="absolute right-[6px] top-[6px] flex flex-col items-end gap-[4px]">
            {cell.isUnicorn && (
              <span className="rounded-[4px] bg-brand-blue px-[6px] py-[2px] font-heading text-[10px] font-bold uppercase tracking-wide text-white">
                Unicorn
              </span>
            )}
            {cell.score ? (
              <span className="rounded-[4px] bg-black/70 px-[6px] py-[2px] text-[10px] font-semibold tabular-nums text-white">
                +{cell.score}
              </span>
            ) : null}
          </span>
        </>
      ) : null}

      {/* Incorrect: grows out of the cell that was played */}
      {cell.status === "incorrect" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <X className="size-8 text-action animate-in zoom-in-75 duration-200 ease-out" strokeWidth={1.75} />
        </span>
      )}
    </button>
  )
}
