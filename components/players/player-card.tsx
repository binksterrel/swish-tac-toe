"use client"

import React from "react"
import { NBAPlayer, getModernTeam } from "@/lib/nba-data"
import { TeamLogo } from "@/components/common/team-logo"
import { PlayerPhoto } from "@/components/common/player-photo"
import { useLanguage } from "@/contexts/language-context"

interface PlayerCardProps {
  player: NBAPlayer
}

// French position names (same wording as the grid criteria); English keeps the usual abbreviations
const POSITION_FR: Record<string, string> = {
  PG: "Meneur",
  SG: "Arrière",
  SF: "Ailier",
  PF: "Ailier fort",
  C: "Pivot",
  G: "Arrière",
  F: "Ailier",
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { language } = useLanguage()
  const fr = language === "fr"

  const badges: { label: string; color: string }[] = []
  if (player.mvp) badges.push({ label: "MVP", color: "bg-brand-blue" })
  if (player.champion) badges.push({ label: fr ? "Champion" : "Champ", color: "bg-brand-blue" })
  if (player.allStar) badges.push({ label: "All-Star", color: "bg-brand-blue" })
  if (player.dpoy) badges.push({ label: "DPOY", color: "bg-action" })
  if (player.roy) badges.push({ label: "ROY", color: "bg-success" })

  const teams = Array.from(new Set(player.teams.map((t) => getModernTeam(t))))
  const status = player.active ? (fr ? "En activité" : "Active") : fr ? "Retraité" : "Retired"
  const positionCode = (player.position || "").split(/[-/]/)[0]
  const position = fr ? (POSITION_FR[positionCode] ?? "N/A") : positionCode || "N/A"

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-nested border border-line bg-surface transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:border-brand-blue-soft">
      {/* Photo */}
      <div className="relative h-28 sm:h-48 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
          {player.teams[0] && <TeamLogo teamId={player.teams[0]} size={128} className="grayscale" />}
        </div>
        <div className="relative z-10 h-full w-full">
          <PlayerPhoto player={player} fill className="object-contain object-bottom" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-s8 border-t border-line p-s8 sm:p-s16">
        <div className="min-w-0">
          <h3 className="truncate text-meta sm:text-lead font-semibold leading-tight text-ink">{player.name}</h3>
          <p className="mt-[2px] truncate text-[11px] sm:text-meta text-ink-muted">
            {position} · {status}
            {player.country && player.country !== "USA" ? ` · ${player.country}` : ""}
          </p>
        </div>

        {/* Awards: a row under the name, never on top of the face */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-[4px]">
            {badges.map((badge) => (
              <span key={badge.label} className={`rounded-[4px] px-[6px] py-[1px] text-[10px] font-semibold text-white ${badge.color}`}>
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Teams */}
        <div className="mt-auto flex flex-wrap items-center gap-[4px]" aria-label={fr ? "Équipes" : "Teams"}>
          {teams.map((team) => (
            <span key={team} className="flex size-5 sm:size-6 items-center justify-center rounded-[4px] bg-white p-[2px]" title={team}>
              <TeamLogo teamId={team} size={24} className="h-full w-full" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
