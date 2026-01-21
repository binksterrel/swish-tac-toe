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
}

export function GameGrid({
  grid,
  rows,
  cols,
  selectedCell,
  onCellClick,
  disabled,
  hidden = false,
}: GameGridProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Grid container */}
      <div className="grid grid-cols-4 gap-1 md:gap-2">
        {/* Empty corner */}
        <div className="aspect-square" />
        
        {/* Column headers */}
        {cols?.map((col, i) => (
          <CriteriaHeader key={`col-${i}`} criteria={col} direction="col" hidden={hidden} />
        ))}

        {/* Rows with cells */}
        {rows?.map((row, rowIndex) => (
          <Fragment key={`row-group-${rowIndex}`}>
            {/* Row header */}
            <CriteriaHeader
              criteria={row}
              direction="row"
              hidden={hidden}
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
