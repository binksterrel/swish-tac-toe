"use client"

import { cn } from "@/lib/utils"
import type { CellState } from "@/hooks/use-game-state"
import type { Criteria } from "@/lib/nba-data"
import { GameCell } from "./game-cell"
import { CriteriaHeader } from "./criteria-header"
import { Fragment } from "react"

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

  const gridColsClass = size === 3 ? "grid-cols-4" : size === 4 ? "grid-cols-5" : "grid-cols-6"

  return (
    <div
      className="w-full mx-auto"
      // The grid is square (header row + header column), so capping its width
      // by the viewport height keeps scoreboard + grid visible at once.
      style={{ maxWidth: `min(${size > 3 ? "56rem" : "42rem"}, max(300px, calc(100dvh - 160px)))` }}
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
          </Fragment>
        ))}
      </div>
    </div>
  )
}
