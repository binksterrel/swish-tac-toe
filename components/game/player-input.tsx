"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { getPlayerSuggestions, type NBAPlayer } from "@/lib/nba-data"
import { PlayerPhoto } from "@/components/common/player-photo"
import { Search, X, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useKeyboardViewport } from "@/hooks/use-keyboard-viewport"

// Helper to format criteria text grammatically
function formatCriteriaText(label: string, type?: string): { prefix: string; text: string } {
  const teamTypes = ['team']
  const awardTypes = ['mvp', 'dpoy', 'roy', 'champion', 'allStar', 'allNBA', 'allDefensive', 'draft_pick_1', 'draft_top_3']
  const statTypes = ['ppg', 'rpg', 'apg']
  const otherTypes = ['decade', 'country', 'position']

  if (!type) {
    // Fallback: guess based on label
    return { prefix: "correspond à", text: label }
  }

  if (teamTypes.includes(type)) {
    return { prefix: "a joué pour les", text: label }
  } else if (awardTypes.includes(type)) {
    return { prefix: "est", text: label }
  } else if (statTypes.includes(type)) {
    return { prefix: "a une moyenne de", text: `${label}+` }
  } else if (type === 'country') {
    return { prefix: "vient de", text: label === 'International' ? "l'étranger" : label }
  } else if (type === 'position') {
    return { prefix: "joue", text: label }
  } else if (type === 'decade') {
    return { prefix: "a joué dans les", text: label }
  }

  return { prefix: "correspond à", text: label }
}

// Reverting to previous state without Hint System
interface PlayerInputProps {
  onSubmit: (player: NBAPlayer) => void
  onCancel: () => void
  usedPlayers: Set<string>
  rowLabel: string
  colLabel: string
  hiddenLabels?: boolean
  rowType?: string
  colType?: string
}

export function PlayerInput({
  onSubmit,
  onCancel,
  usedPlayers,
  rowLabel,
  colLabel,
  hiddenLabels = false,
  rowType,
  colType,
}: PlayerInputProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<NBAPlayer[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { containerStyle, panelStyle } = useKeyboardViewport()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const results = getPlayerSuggestions(query, 6)
    setSuggestions(results)
    setSelectedIndex(-1)
    setError(null)
  }, [query])

  const handleSubmit = (player: NBAPlayer) => {
    onSubmit(player)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSubmit(suggestions[selectedIndex])
      } else if (suggestions.length > 0) {
        // If no selection but suggestions exist, take the first one
         handleSubmit(suggestions[0])
      }
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  const row = formatCriteriaText(rowLabel, rowType)
  const col = formatCriteriaText(colLabel, colType)

  return (
    <div
      // Phones: sits at the bottom and rides above the on-screen keyboard (see useKeyboardViewport)
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-s16 transition-[padding] duration-200 ease-out motion-reduce:transition-none animate-in fade-in"
      style={containerStyle}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-input-title"
        style={panelStyle}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-ref border border-line bg-surface shadow-window animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-line p-s16 sm:p-s24">
          <div className="flex items-center justify-between gap-s16">
            <h3 id="player-input-title" className="font-heading text-lead font-bold uppercase tracking-tight text-ink">Trouver un joueur</h3>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Fermer"
              className="inline-flex size-8 items-center justify-center rounded-nested text-ink-muted transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
            >
              <X className="size-5" strokeWidth={1.75} />
            </button>
          </div>
          {hiddenLabels ? (
            <p className="mt-s8 text-ink-muted">Critères cachés : à vous de les deviner.</p>
          ) : (
            <p className="mt-s8 max-w-[60ch] text-ink-muted">
              Qui {row.prefix} <span className="font-semibold text-ink">{row.text}</span> et {col.prefix}{" "}
              <span className="font-semibold text-ink">{col.text}</span> ?
            </p>
          )}
        </div>

        {/* Input + results: the only part that scrolls when space is short */}
        <div className="min-h-0 flex-1 overflow-y-auto p-s16 sm:p-s24">
          <div className="relative">
            <Search className="pointer-events-none absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Nom du joueur…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-12 rounded-nested border-line bg-canvas pl-s48 text-body text-ink placeholder:text-ink-muted focus-visible:ring-0 focus-visible:border-brand-blue-soft"
            />
          </div>

          {error && (
            <div className="mt-s8 flex items-center gap-s8 text-meta text-action">
              <AlertCircle className="size-4" strokeWidth={1.75} />
              {error}
            </div>
          )}

          {suggestions.length > 0 && (
            <ul className="mt-s16 flex flex-col gap-[4px]" role="listbox">
              {suggestions.map((player, index) => {
                const isUsed = usedPlayers.has(player.id)
                const active = selectedIndex === index
                return (
                  <li key={player.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => handleSubmit(player)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "flex w-full items-center gap-s16 rounded-nested px-s8 py-s8 text-left",
                        "transition-colors duration-[120ms] ease-snappy",
                        active ? "bg-surface-2" : "hover:bg-surface-2",
                        isUsed && "opacity-60",
                      )}
                    >
                      <span className="relative size-8 shrink-0 overflow-hidden rounded-full border border-line bg-canvas">
                        <PlayerPhoto player={player} width={32} height={32} className="object-cover object-top scale-110 translate-y-[2px]" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">{player.name}</span>
                      {isUsed && (
                        <span className="rounded-[4px] border border-line px-[6px] py-[2px] text-meta text-ink-muted">Déjà utilisé</span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {query.length >= 2 && suggestions.length === 0 && (
            <p className="mt-s16 py-s16 text-center text-ink-muted">Aucun joueur trouvé. Essayez un autre nom.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-s8 border-t border-line p-s16">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-nested px-s16 font-medium text-ink-soft transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => { if (suggestions.length > 0) handleSubmit(suggestions[selectedIndex >= 0 ? selectedIndex : 0]) }}
            disabled={suggestions.length === 0}
            className="chamfer inline-flex h-10 items-center bg-action px-s24 font-heading text-meta font-bold uppercase tracking-wider text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  )
}
