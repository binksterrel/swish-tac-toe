"use client"

import { useState } from "react"
import Image from "next/image"
import { getTeamLogoUrl } from "@/lib/nba-data"

const TEAMS = [
  "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
  "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
  "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"
]

// Edge fade done with a mask (no painted gradient overlay).
const EDGE_MASK = "linear-gradient(to right, transparent, black 48px, black calc(100% - 48px), transparent)"

export function NBATicker() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="w-full bg-canvas border-b border-line overflow-hidden py-s8 relative z-50"
      style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
      aria-hidden="true"
    >
      <div
        className="flex items-center gap-s32 animate-scroll motion-reduce:animate-none whitespace-nowrap"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ animationPlayState: isHovered ? 'paused' : 'running' }}
      >
        {/* Multiply list for truly seamless loop on large screens */}
        {[...TEAMS, ...TEAMS, ...TEAMS, ...TEAMS].map((team, index) => (
          <div
            key={`${team}-${index}`}
            className="flex items-center justify-center size-8 flex-shrink-0 grayscale opacity-60"
          >
            <Image
              src={getTeamLogoUrl(team)}
              alt=""
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority={index < 20}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
