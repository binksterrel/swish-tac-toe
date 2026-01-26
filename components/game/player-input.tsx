"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { getPlayerSuggestions, type NBAPlayer, getPlayerPhotoUrl } from "@/lib/nba-data"
import { Search, X, AlertCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Reverting to previous state without Hint System
interface PlayerInputProps {
  onSubmit: (player: NBAPlayer) => void
  onCancel: () => void
  usedPlayers: Set<string>
  rowLabel: string
  colLabel: string
  hiddenLabels?: boolean
}

export function PlayerInput({
  onSubmit,
  onCancel,
  usedPlayers,
  rowLabel,
  colLabel,
  hiddenLabels = false,
}: PlayerInputProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<NBAPlayer[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border bg-secondary/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-foreground">Trouver un joueur</h3>
            <button
              type="button"
              onClick={onCancel}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          {hiddenLabels ? (
            <p className="text-sm text-yellow-500 font-bold animate-pulse">
                🕵️ Critères Mystères : À vous de déduire !
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
                Qui a joué pour <span className="text-primary font-semibold">{rowLabel}</span> et est{" "}
                <span className="text-primary font-semibold">{colLabel}</span> ?
            </p>
          )}
        </div>

        {/* Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Entrez un nom de joueur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mt-2 flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-3 space-y-1">
              {suggestions.map((player, index) => {
                const isUsed = usedPlayers.has(player.id)
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => handleSubmit(player)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-colors",
                      "flex items-center gap-3",
                      selectedIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                      isUsed && "opacity-75" // Just slightly dim to show it's used, but clickable
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0 border border-border">
                      <img
                        src={getPlayerPhotoUrl(player)}
                        alt={player.name}
                        className="w-full h-full object-cover scale-110 translate-y-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                          <span className="font-medium truncate">{player.name}</span>
                          {isUsed && (
                              <span className="text-[10px] uppercase font-bold text-destructive border border-destructive px-1.5 rounded-sm">
                                  Utilisé
                              </span>
                          )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && suggestions.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground text-center py-4">
              Aucun joueur trouvé. Essayez un autre nom.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30 flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
            Annuler
          </Button>
          <Button
            onClick={() => {
              if (suggestions.length > 0) {
                handleSubmit(suggestions[0])
              }
            }}
            disabled={suggestions.length === 0}
            className="flex-1"
          >
            Valider
          </Button>
        </div>
      </div>
    </div>
  )
}
