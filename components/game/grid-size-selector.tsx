"use client"

import { Segmented } from "./segmented"

interface GridSizeSelectorProps {
  size: number
  onSelect: (size: number) => void
  label?: string
}

export function GridSizeSelector({ size, onSelect, label = "Grille" }: GridSizeSelectorProps) {
  return (
    <Segmented
      label={label}
      value={size}
      onChange={onSelect}
      options={[3, 4, 5].map((n) => ({ value: n, label: `${n}×${n}` }))}
    />
  )
}
