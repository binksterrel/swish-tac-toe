"use client"

import { cn } from "@/lib/utils"
import { type Criteria, getTeamLogoUrl } from "@/lib/nba-data"

import { Globe, Crown } from "lucide-react"

interface CriteriaHeaderProps {
  criteria: Criteria
  direction: "row" | "col"
  hidden?: boolean
  blur?: boolean
}

export function CriteriaHeader({ criteria, direction, hidden = false, blur = false }: CriteriaHeaderProps) {
  const isTeam = criteria.type === "team"
  const isCountry = criteria.type === "country"
  const logoUrl = isTeam ? getTeamLogoUrl(criteria.value) : null

  // Country Code Mapping for FlagCDN
  const getCountryFlag = (country: string) => {
    const map: Record<string, string> = {
      "USA": "us",
      "France": "fr",
      "Canada": "ca",
      "Spain": "es",
      "Germany": "de",
      "Serbia": "rs",
      "Slovenia": "si",
      "Greece": "gr",
      "Australia": "au",
      "Cameroon": "cm",
      "Nigeria": "ng",
      "Italy": "it",
      "Argentina": "ar"
    }
    return map[country] || null
  }

  // Helper for cleaner labels
  const getLabel = () => {
    switch (criteria.type) {
      case "mvp": return "KIA MVP"
      case "champion": return "NBA CHAMP"
      case "allStar": return "ALL-STAR"
      case "roy": return "ROY"
      case "dpoy": return "DPOY"
      case "allNBA": return "ALL-NBA"
      case "allDefensive": return "ALL-DEFENSE"
      case "decade": return `${criteria.value.replace("s", "")}'s`
      case "ppg": return "PPS > 20"
      case "rpg": return "REB > 10"
      case "apg": return "AST > 10"
      case "position": return criteria.label || criteria.value
      case "draft_pick_1": return "1ST PICK"
      case "draft_top_3": return "TOP 3 PICK"
      // Country fallback label if image fails
      case "country": return criteria.label || criteria.value
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
          <div className="relative group transition-all duration-300">
             {/* Blurred/Hidden State Overlay */}
             {blur ? (
                 <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0a0a]">
                     <span className="text-xl md:text-2xl font-bold text-zinc-700 animate-pulse">?</span>
                 </div>
             ) : (
                /* Actual Content */
                <div className="transition-all duration-300 flex flex-col items-center">
                    {/* TEAM LOGOS */}
                    {isTeam && logoUrl && (
                        <div className="w-10 h-10 md:w-14 md:h-14 relative flex items-center justify-center mb-1 transition-all hover:scale-110">
                            <img 
                                src={logoUrl} 
                                alt={criteria.value}
                                className="w-full h-full object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                        </div>
                    )}

                    {/* COUNTRY FLAGS */}
                    {isCountry && (
                        <div className="w-10 h-10 md:w-12 md:h-12 relative flex items-center justify-center mb-1 transition-all hover:scale-110">
                            {criteria.value.toLowerCase() === "international" ? (
                                <Globe className="w-8 h-8 md:w-10 md:h-10 text-blue-400" strokeWidth={1.5} />
                            ) : getCountryFlag(criteria.value) ? (
                                <img
                                    src={`https://flagcdn.com/w80/${getCountryFlag(criteria.value)}.png`} 
                                    alt={criteria.value} 
                                    className="w-full h-auto object-cover rounded shadow-sm opacity-90 hover:opacity-100"
                                />
                            ) : (
                                <span className="text-2xl">🌍</span>
                            )}
                        </div>
                    )}

                    {/* DRAFT PICK #1 */}
                    {criteria.type === "draft_pick_1" && (
                         <div className="flex flex-col items-center justify-center mb-1 transition-all hover:scale-110">
                            <Crown className="w-8 h-8 md:w-10 md:h-10 text-amber-400 mb-1" strokeWidth={1.5} />
                            <span className="text-[8px] md:text-[10px] font-heading font-bold uppercase tracking-widest text-amber-500/80 leading-none">
                                1ST PICK
                            </span>
                         </div>
                    )}

                    {/* DRAFT TOP 3 */}
                    {criteria.type === "draft_top_3" && (
                         <div className="flex flex-col items-center justify-center mb-1 transition-all hover:scale-110">
                            <div className="relative">
                                <Crown className="w-8 h-8 md:w-10 md:h-10 text-slate-300 mb-1" strokeWidth={1.5} />
                                <span className="absolute -top-1 -right-2 text-[10px] font-bold text-amber-400 bg-black/80 px-1 rounded-full border border-amber-400/50">3</span>
                            </div>
                            <span className="text-[8px] md:text-[10px] font-heading font-bold uppercase tracking-widest text-slate-400 leading-none">
                                TOP 3 DRAFT
                            </span>
                         </div>
                    )}

                    {/* NBA CHAMPION */}
                    {criteria.type === "champion" && (
                         <div className="w-10 h-10 md:w-16 md:h-16 relative flex items-center justify-center mb-1 transition-all hover:scale-110">
                            <img 
                                src="/images/trophy.png"
                                alt="NBA Champion"
                                className="w-full h-full object-contain"
                            />
                         </div>
                    )}

                    {/* TEXT LABELS (For Awards, Stats, Decades, or Fallbacks) */}
                    {!isTeam && !isCountry && criteria.type !== "draft_pick_1" && criteria.type !== "draft_top_3" && (criteria.type as string) !== "champion" && (
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

                     {/* Label for Country/Team fallback or addition */}
                     {(isTeam || isCountry) && (
                         <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 bg-black px-1 rounded">
                             {criteria.label || criteria.value}
                         </span>
                     )}

                </div>
             )}
          </div>
      )}
    </div>
  )
}
