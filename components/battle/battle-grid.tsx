"use client"

import { GridCell, BattleState } from "@/lib/battle-types"
import { Criteria } from "@/lib/nba-data"
import { CriteriaHeader } from "../game/criteria-header" // Reusing
import { cn } from "@/lib/utils"
import { getPlayerPhotoUrl } from "@/lib/nba-data"
import { Check, X } from "lucide-react"

interface BattleGridProps {
  state: BattleState
  role: 'host' | 'guest'
  onCellClick: (row: number, col: number) => void
  selectedCell: { row: number, col: number } | null
}

export function BattleGrid({ state, role, onCellClick, selectedCell }: BattleGridProps) {
  const { grid, criteria } = state
  const isMyTurn = state.currentTurn === role
  const isGameOver = !!state.winner

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Turn Indicator */}
      <div className="flex justify-between items-center mb-6 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md">
         <div className={cn("text-center transition-opacity", state.currentTurn === 'host' ? "opacity-100" : "opacity-40")}>
            <div className="text-xs uppercase font-bold text-nba-blue mb-1">Host</div>
            <div className="text-xl font-bold text-white">{state.players.host?.name || "Waiting..."}</div>
         </div>
         
         <div className="px-4 py-1 rounded-full bg-white/10 text-xs font-mono">VS</div>

         <div className={cn("text-center transition-opacity", state.currentTurn === 'guest' ? "opacity-100" : "opacity-40")}>
            <div className="text-xs uppercase font-bold text-nba-red mb-1">Guest</div>
            <div className="text-xl font-bold text-white">{state.players.guest?.name || "Waiting..."}</div>
         </div>
      </div>

      {state.winner && (
          <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl text-center animate-in zoom-in">
              <h2 className="text-3xl font-heading font-bold uppercase italic text-amber-400">
                  {state.winner === 'draw' ? 'DRAW!' : `${state.players[state.winner]?.name} WINS!`}
              </h2>
          </div>
      )}

      {!state.winner && (
          <div className={cn("text-center mb-4 transition-colors", isMyTurn ? "text-green-400" : "text-gray-500")}>
             {isMyTurn ? "IT'S YOUR TURN" : `WAITING FOR ${state.currentTurn === 'host' ? 'HOST' : 'GUEST'}...`}
          </div>
      )}

      {/* Grid Layout reusing CSS Grid logic from main game */}
      <div className="grid grid-rows-[auto_1fr_1fr_1fr] gap-2">
        
        {/* Header Row */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2">
           <div className="w-20 md:w-32"></div> {/* Top-Left Spacer */}
           {criteria.cols.map((crit, i) => (
             <div key={`col-header-${i}`} className="w-full aspect-[4/3] flex items-center justify-center">
               <CriteriaHeader criteria={crit} direction="col" />
             </div>
           ))}
        </div>

        {/* Rows */}
        {grid.map((row, rIndex) => (
          <div key={`row-${rIndex}`} className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2">
            
            {/* Row Header */}
            <div className="w-20 md:w-32 flex items-center justify-center">
              <CriteriaHeader criteria={criteria.rows[rIndex]} direction="row" />
            </div>

            {/* Cells */}
            {row.map((cell, cIndex) => {
               const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex
               const isDisabled = cell.status === 'correct' || !isMyTurn || isGameOver
               
               return (
                 <div 
                    key={`cell-${rIndex}-${cIndex}`}
                    onClick={() => !isDisabled && onCellClick(rIndex, cIndex)}
                    className={cn(
                        "relative w-full aspect-square md:aspect-[4/3] rounded-lg border-2 transition-all flex items-center justify-center overflow-hidden cursor-pointer",
                        // Ownership Colors
                        cell.owner === 'host' ? "bg-nba-blue/20 border-nba-blue shadow-[0_0_15px_rgba(29,66,138,0.3)]" : 
                        cell.owner === 'guest' ? "bg-nba-red/20 border-nba-red shadow-[0_0_15px_rgba(206,17,65,0.3)]" : 
                        "bg-white/5 border-white/10 hover:bg-white/10",
                        
                        isSelected && "ring-4 ring-white ring-offset-2 ring-offset-black scale-105 z-10",
                        isDisabled && !cell.player && "opacity-50 cursor-not-allowed",
                        isDisabled && cell.player && "cursor-default"
                    )}
                 >
                    {cell.player ? (
                        <>
                           <img 
                              src={getPlayerPhotoUrl(cell.player)} 
                              alt={cell.player.name}
                              className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                           />
                           <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2">
                              <p className="text-[10px] md:text-xs font-bold text-center text-white leading-tight truncate">
                                {cell.player.name}
                              </p>
                           </div>
                           {/* Owner Badge */}
                           <div className={cn(
                               "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white text-[10px] font-bold shadow-md",
                               cell.owner === 'host' ? "bg-nba-blue text-white" : "bg-nba-red text-white"
                           )}>
                               {cell.owner === 'host' ? 'P1' : 'P2'}
                           </div>
                        </>
                    ) : (
                        <div className="opacity-0 hover:opacity-100 transition-opacity">
                            {isMyTurn && !isGameOver && <div className="text-xs uppercase font-bold tracking-widest text-white/50">Select</div>}
                        </div>
                    )}
                 </div>
               )
            })}
          </div>
        ))}

      </div>
    </div>
  )
}
