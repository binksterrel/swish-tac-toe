"use client"

import { cn } from "@/lib/utils"
import type { CellState } from "@/hooks/use-game-state"
import { getPlayerPhotoUrl } from "@/lib/nba-data"
import { Check, X, Plus } from "lucide-react"

interface GameCellProps {
  cell: CellState
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

export function GameCell({ cell, isSelected, onClick, disabled }: GameCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full h-full aspect-square transition-all duration-200 overflow-hidden group",
        // Official NBA Data Table Style: Rectangular, Sharp, High Contrast
        "rounded-none border border-zinc-800", // Sharp corners, subtle separator

        // Base state (Empty)
        cell.status === "empty" && [
          "bg-[#0a0a0a]", // Dark background
          !disabled && "hover:bg-zinc-900 cursor-pointer",
        ],
        
        // Selected state - NBA Blue Highlighting
        isSelected && cell.status === "empty" && [
          "bg-[#0d121f] ring-2 ring-inset ring-nba-blue z-10",
        ],
        
        // Correct state - Clean Image
        cell.status === "correct" && [
          "cursor-default border-none",
        ],
        
        // Incorrect state - NBA Red Flash
        cell.status === "incorrect" && [
          "bg-nba-red/10 border-nba-red",
        ],
        
        // Disabled
        disabled && !cell.status && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Empty State - Minimalist Plus */}
      {cell.status === "empty" && !isSelected && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <Plus className="w-8 h-8 text-zinc-600" strokeWidth={1} />
        </div>
      )}

      {/* Selected Indicator - Subtle Corner */}
      {isSelected && cell.status === "empty" && (
        <div className="absolute top-1 left-1 w-2 h-2 bg-nba-blue shadow-[0_0_8px_currentColor]" />
      )}

      {/* Correct State - Full Image with Official Data Overlay */}
      {cell.status === "correct" && cell.player ? (
        <>
          {/* Full Background Image */}
          <div className="absolute inset-0 bg-[#0a0a0a]">
             <img
              src={getPlayerPhotoUrl(cell.player)}
              alt={cell.player.name}
              className="w-full h-full object-cover object-top scale-110 translate-y-2 filter brightness-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          {/* Official 'Lower Third' Name Bar */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-6 pb-1 px-1">
            <div className="flex flex-col items-center">
               <div className="h-0.5 w-8 bg-nba-blue mb-1"></div>
               <p className="text-[9px] md:text-[11px] font-heading font-bold text-white uppercase tracking-wider leading-none text-center">
                 {cell.player.name.split(' ').map((n, i) => (
                   <span key={i} className="block">{n}</span>
                 ))}
               </p>
            </div>
            </div>

          
          {/* Rarity & Score Badge */}
          <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5">
             {cell.isUnicorn && (
                 <span className="bg-purple-600/90 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold shadow-lg animate-pulse">
                   UNICORN
                 </span>
             )}
             {cell.score && (
                 <span className="text-[9px] font-mono text-nba-blue bg-black/80 px-1 rounded-sm">
                   +{cell.score}
                 </span>
             )}
          </div>
        </>
      ) : null}

      {/* Incorrect State Feedack - Sharp Red X */}
      {cell.status === "incorrect" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <X className="w-10 h-10 text-nba-red animate-in zoom-in duration-200" strokeWidth={1.5} />
        </div>
      )}
    </button>
  )
}
