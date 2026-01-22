"use client"

import { useEffect, useRef, useState } from "react"
import { getTeamLogoUrl } from "@/lib/nba-data"

const TEAMS = [
  "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
  "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
  "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"
]

export function NBATicker() {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div className="w-full bg-[#000000] border-b border-nba-blue overflow-hidden py-2 relative z-50">
      <div 
        className="flex items-center gap-8 animate-scroll whitespace-nowrap"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ animationPlayState: isHovered ? 'paused' : 'running' }}
      >
        {/* Multiply list for truly seamless loop on large screens */}
        {[...TEAMS, ...TEAMS, ...TEAMS, ...TEAMS].map((team, index) => (
          <div 
            key={`${team}-${index}`} 
            className="flex items-center justify-center w-12 h-12 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110 cursor-pointer opacity-70 hover:opacity-100"
          >
            <img 
              src={getTeamLogoUrl(team)} 
              alt={team} 
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
      
      {/* Vignette effect for depth */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent pointer-events-none" />
    </div>
  )
}
