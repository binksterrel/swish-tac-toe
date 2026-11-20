"use client"

import { cn } from "@/lib/utils"
import { type Criteria, getTeamLogoUrl } from "@/lib/nba-data"
import { Globe, Crown, Award, Star, Shield, ShieldCheck, Sprout, Users, Flame, Hand, Handshake, CalendarDays, type LucideIcon } from "lucide-react"
import Image from "next/image"
import { TeamLogo } from "@/components/common/team-logo"
import { PositionIcon } from "./position-icon"

interface CriteriaHeaderProps {
  criteria: Criteria
  direction: "row" | "col"
  hidden?: boolean
  blur?: boolean
}

// Country code mapping for FlagCDN
const COUNTRY_FLAGS: Record<string, string> = {
  USA: "us",
  France: "fr",
  Canada: "ca",
  Spain: "es",
  Germany: "de",
  Serbia: "rs",
  Slovenia: "si",
  Greece: "gr",
  Australia: "au",
  Cameroon: "cm",
  Nigeria: "ng",
  Italy: "it",
  Argentina: "ar",
}

// Icons for criteria that have no logo, flag or image of their own
// (teams, countries, champion, draft picks and positions have theirs below)
const CRITERIA_ICONS: Partial<Record<string, LucideIcon>> = {
  mvp: Award,
  allStar: Star,
  dpoy: Shield,
  roy: Sprout,
  allNBA: Users,
  allDefensive: ShieldCheck,
  ppg: Flame,
  rpg: Hand,
  apg: Handshake,
  decade: CalendarDays,
}

function getLabel(criteria: Criteria) {
  switch (criteria.type) {
    case "mvp": return "MVP"
    case "champion": return "Champion"
    case "allStar": return "All-Star"
    case "roy": return "ROY"
    case "dpoy": return "DPOY"
    case "allNBA": return "All-NBA"
    case "allDefensive": return "All-Defense"
    case "decade": return `${criteria.value.replace("s", "")}'s`
    case "ppg": return "20+ PTS"
    case "rpg": return "10+ REB"
    case "apg": return "10+ AST"
    case "position": return criteria.label || criteria.value
    case "draft_pick_1": return "1st Pick"
    case "draft_top_3": return "Top 3 Pick"
    case "country": return criteria.label || criteria.value
    default: return criteria.value.toUpperCase()
  }
}

const LABEL = "font-heading text-meta font-bold uppercase leading-tight tracking-wide text-ink-soft text-center"

export function CriteriaHeader({ criteria, direction, hidden = false, blur = false }: CriteriaHeaderProps) {
  const isTeam = criteria.type === "team"
  const isCountry = criteria.type === "country"
  const logoUrl = isTeam ? getTeamLogoUrl(criteria.value) : null
  const flag = isCountry ? COUNTRY_FLAGS[criteria.value] : null
  const name = criteria.label || criteria.value
  const Icon = CRITERIA_ICONS[criteria.type]

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-s8 p-s8",
        direction === "col" ? "justify-end" : "",
      )}
      title={hidden || blur ? undefined : name}
    >
      {hidden || blur ? (
        <span className="font-heading text-lead font-bold text-ink-muted/50 select-none" aria-label="Critère caché">?</span>
      ) : (
        <>
          {isTeam && logoUrl && (
            <span className="relative flex size-10 md:size-14 items-center justify-center">
              <TeamLogo teamId={criteria.value} size={56} className="h-full w-full" />
            </span>
          )}

          {isCountry && (
            <span className="flex h-8 w-10 md:h-10 md:w-14 items-center justify-center">
              {criteria.value.toLowerCase() === "international" ? (
                <Globe className="size-8 md:size-10 text-blue-400" strokeWidth={1.5} />
              ) : flag ? (
                <Image
                  src={`https://flagcdn.com/w80/${flag}.png`}
                  alt={criteria.value}
                  width={80}
                  height={60}
                  className="h-auto w-full rounded-[4px] object-cover opacity-90"
                />
              ) : (
                <span className="text-2xl" aria-hidden>🌍</span>
              )}
            </span>
          )}

          {criteria.type === "position" && (
            <PositionIcon position={criteria.value} className="size-10 md:size-12 text-ink-soft" />
          )}

          {criteria.type === "champion" && (
            <span className="relative flex size-10 md:size-16 items-center justify-center">
              <Image src="/images/trophy.png" alt="" width={64} height={64} className="h-full w-full object-contain" />
            </span>
          )}

          {criteria.type === "draft_pick_1" && (
            <Crown className="size-8 md:size-10 text-amber-400" strokeWidth={1.5} />
          )}

          {criteria.type === "draft_top_3" && (
            <span className="relative">
              <Crown className="size-8 md:size-10 text-slate-300" strokeWidth={1.5} />
              <span className="absolute -right-2 -top-1 rounded-full border border-amber-400/50 bg-black/80 px-1 text-[10px] font-bold text-amber-400">3</span>
            </span>
          )}

          {Icon && <Icon className="size-8 md:size-10 text-ink-soft" strokeWidth={1.5} />}

          {/* Text label for everything that is not a team logo */}
          {!isTeam && <span className={LABEL}>{getLabel(criteria)}</span>}

          {/* Team name: discreet, always visible from md up */}
          {isTeam && <span className="hidden md:block text-meta text-ink-muted text-center leading-tight">{name}</span>}
        </>
      )}
    </div>
  )
}
