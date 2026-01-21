"use client"

import { cn } from "@/lib/utils"
import { type Criteria, getTeamLogoUrl } from "@/lib/nba-data"

interface CriteriaHeaderProps {
  criteria: Criteria
  direction: "row" | "col"
  hidden?: boolean
}

export function CriteriaHeader({ criteria, direction, hidden = false }: CriteriaHeaderProps) {
  const isTeam = criteria.type === "team"
  const logoUrl = isTeam ? getTeamLogoUrl(criteria.value) : null

  // Helper for cleaner labels
  const getLabel = () => {
    switch (criteria.type) {
      case "mvp": return "KIA MVP"
      case "champion": return "NBA CHAMP"
      case "allStar": return "ALL-STAR"
      case "roy": return "ROOKIE"
      case "dpoy": return "DPOY"
      case "allNBA": return "ALL-NBA"
      case "allDefensive": return "ALL-DEFENSE"
      case "decade": return `${criteria.value.replace("s", "")}'s`
      case "ppg": return "PPS > 20"
      case "rpg": return "REB > 10"
      case "apg": return "AST > 10"
      case "position": return criteria.label || criteria.value
      default: return criteria.value.toUpperCase()
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-2 h-full w-full bg-[#0a0a0a]", // Almost black background
        "border-zinc-800", // Subtle separator
        direction === "col" ? "border-b" : "border-r"
      )}
    >
      {hidden ? (
          <div className="flex flex-col items-center justify-center animate-pulse">
             <span className="text-3xl font-heading font-bold text-zinc-800 select-none">?</span>
          </div>
      ) : (
          /* Official Box-Score Style: Minimalist and Sharp */
          <>
          {isTeam && logoUrl ? (
            <div className="w-10 h-10 md:w-14 md:h-14 relative flex items-center justify-center mb-1 transition-all hover:scale-110">
              <img 
                src={logoUrl} 
                alt={criteria.value}
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Accent Line for awards */}
              <div className={cn("w-8 h-1 mb-1", 
                criteria.type === "mvp" ? "bg-nba-blue" : 
                criteria.type === "champion" ? "bg-amber-400" :
                criteria.type === "allStar" ? "bg-nba-red" : "bg-zinc-700"
              )} />
              
              <span className="text-[10px] md:text-xs font-heading font-normal uppercase tracking-widest text-zinc-400 text-center leading-none">
                {getLabel()}
              </span>
            </div>
          )}
          </>
      )}
    </div>
  )
}
