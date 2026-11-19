"use client"

import { cn } from "@/lib/utils"
import type { CellState } from "@/hooks/use-game-state"
import type { Criteria } from "@/lib/nba-data"
import { GameCell } from "./game-cell"
import { CriteriaHeader } from "./criteria-header"
import { Fragment, type CSSProperties } from "react"

interface GameGridProps {
  grid: CellState[][]
  rows: Criteria[]
  cols: Criteria[]
  selectedCell: { row: number; col: number } | null
  onCellClick: (row: number, col: number) => void
  disabled?: boolean
  hidden?: boolean
  mode?: "classic" | "time_attack" | "sudden_death" | "blind"
  size?: number
}

export function GameGrid({
  grid,
  rows,
  cols,
  selectedCell,
  onCellClick,
  disabled,
  hidden = false,
  mode = "classic",
  size = 3,
}: GameGridProps) {
  const isBlind = mode === "blind"

  // Phones: [criteria | cells]. From md up, an empty column mirrors the criteria
  // column on the right so the cells themselves sit in the middle of the page.
  const gridColsClass =
    size === 3 ? "grid-cols-4 md:grid-cols-5" : size === 4 ? "grid-cols-5 md:grid-cols-6" : "grid-cols-6 md:grid-cols-7"
  // Keep the cells the same size as before despite the extra column
  const desktopFactor = (size + 2) / (size + 1)
  const baseMax = `min(${size > 3 ? "56rem" : "42rem"}, max(300px, calc(100dvh - 160px)))`

  return (
    <div
      className="w-full mx-auto max-w-[var(--grid-max)] md:max-w-[var(--grid-max-md)]"
      // The grid is square (header row + header column), so capping its width
      // by the viewport height keeps scoreboard + grid visible at once.
      style={
        {
          "--grid-max": baseMax,
          "--grid-max-md": `calc(${baseMax} * ${desktopFactor})`,
        } as CSSProperties
      }
    >
      {/* Grid container */}
      <div className={cn("grid gap-[4px] sm:gap-s8", gridColsClass)}>
        {/* Empty corner */}
        <div className="aspect-square" />
        
        {/* Column headers */}
        {cols?.map((col, i) => (
          <CriteriaHeader 
            key={`col-${i}`} 
            criteria={col} 
            direction="col" 
            hidden={hidden} 
            blur={isBlind && !disabled && !hidden} 
           />
        ))}
        <div className="hidden md:block" aria-hidden />

        {/* Rows with cells */}
        {rows?.map((row, rowIndex) => (
          <Fragment key={`row-group-${rowIndex}`}>
            {/* Row header */}
            <CriteriaHeader
              criteria={row}
              direction="row"
              hidden={hidden}
              blur={isBlind && !disabled && !hidden}
            />

            {/* Cells */}
            {grid[rowIndex]?.map((cell, colIndex) => (
              <GameCell
                key={`cell-${rowIndex}-${colIndex}`}
                cell={cell}
                isSelected={
                  selectedCell?.row === rowIndex &&
                  selectedCell?.col === colIndex
                }
                onClick={() => onCellClick(rowIndex, colIndex)}
                disabled={disabled || cell.status === "correct"}
              />
            ))}
            <div className="hidden md:block" aria-hidden />
          </Fragment>
        ))}
      </div>
    </div>
  )
}
