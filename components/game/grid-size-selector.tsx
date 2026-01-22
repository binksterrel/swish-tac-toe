"use client"

import { cn } from "@/lib/utils"
import { Grid3x3 } from "lucide-react"

interface GridSizeSelectorProps {
  size: number
  onSelect: (size: number) => void
}

export function GridSizeSelector({ size, onSelect }: GridSizeSelectorProps) {
  const sizes = [
    { value: 3, cells: 9, label: "3×3" },
    { value: 4, cells: 16, label: "4×4" },
    { value: 5, cells: 25, label: "5×5" },
  ]

  return (
    <div className="flex gap-1">
      {sizes.map((s) => {
        const isSelected = size === s.value
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onSelect(s.value)}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1.5 rounded-md border transition-all duration-200 min-w-[50px]",
              isSelected
                ? "border-primary bg-primary/10 scale-105"
                : "border-border/50 bg-card/40 hover:border-primary/50"
            )}
          >
            {/* Grid visualization */}
            <div
              className={cn(
                "grid gap-[1px]",
                s.value === 3 && "grid-cols-3",
                s.value === 4 && "grid-cols-4",
                s.value === 5 && "grid-cols-5"
              )}
              style={{ width: '20px', height: '20px' }}
            >
              {Array.from({ length: s.cells }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-[1px]",
                    isSelected ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            {/* Label */}
            <span className={cn(
              "text-[10px] font-bold",
              isSelected ? "text-primary" : "text-foreground"
            )}>
              {s.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
