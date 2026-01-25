import { GridCell } from "./battle-types"

export function checkBattleWinner(grid: GridCell[][]): 'host' | 'guest' | 'draw' | null {
  const size = grid.length

  // Helper to check owner consistency
  const checkLine = (cells: GridCell[]) => {
    if (cells.some(c => c.status !== 'correct')) return null
    const firstOwner = cells[0].owner
    if (!firstOwner) return null
    if (cells.every(c => c.owner === firstOwner)) return firstOwner
    return null
  }

  // Rows
  for (let i = 0; i < size; i++) {
    const winner = checkLine(grid[i])
    if (winner) return winner
  }

  // Columns
  for (let j = 0; j < size; j++) {
    const colResults = []
    for (let i = 0; i < size; i++) colResults.push(grid[i][j])
    const winner = checkLine(colResults)
    if (winner) return winner
  }

  // Diagonals
  const d1 = [], d2 = []
  for (let i = 0; i < size; i++) {
    d1.push(grid[i][i])
    d2.push(grid[i][size - 1 - i])
  }
  
  const w1 = checkLine(d1)
  if (w1) return w1
  
  const w2 = checkLine(d2)
  if (w2) return w2

  // Draw? (If full and no winner)
  const isFull = grid.every(row => row.every(c => c.status !== 'empty'))
  if (isFull) return 'draw'

  return null
}
