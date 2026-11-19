"use client"

import { Segmented } from "./segmented"

type Mode = "classic" | "time_attack" | "sudden_death" | "blind"

export const MODE_LABELS: Record<Mode, string> = {
  classic: "Classique",
  time_attack: "Chrono",
  sudden_death: "Sniper",
  blind: "Blind",
}

export function modeDetail(mode: Mode, gridSize: number) {
  switch (mode) {
    case "classic":
      return gridSize === 3 ? "15 essais" : gridSize === 4 ? "25 essais" : "40 essais"
    case "time_attack":
      return gridSize === 3 ? "90 s" : gridSize === 4 ? "3 min" : "5 min"
    case "sudden_death":
      return "1 vie"
    case "blind":
      return "Critères cachés"
  }
}

interface ModeSelectorProps {
  mode: Mode
  gridSize: number
  onSelect: (mode: Mode) => void
}

export function ModeSelector({ mode, gridSize, onSelect }: ModeSelectorProps) {
  return (
    <Segmented
      label="Mode"
      value={mode}
      onChange={onSelect}
      options={(Object.keys(MODE_LABELS) as Mode[]).map((m) => ({
        value: m,
        label: MODE_LABELS[m],
        title: `${MODE_LABELS[m]} · ${modeDetail(m, gridSize)}`,
      }))}
    />
  )
}
