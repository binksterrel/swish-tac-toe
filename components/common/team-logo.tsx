import Image from "next/image"
import { NBA_TEAMS, getTeamLogoUrl } from "@/lib/nba-data"
import { cn } from "@/lib/utils"

interface TeamLogoProps {
  teamId?: string | null
  size?: number
  className?: string
  alt?: string
}

export function TeamLogo({ teamId, size = 64, className, alt }: TeamLogoProps) {
  if (!teamId) return null
  const src = getTeamLogoUrl(teamId)
  const label = alt || NBA_TEAMS[teamId]?.name || teamId

  return (
    <Image
      src={src}
      alt={label}
      width={size}
      height={size}
      className={cn("object-contain", className)}
      unoptimized
    />
  )
}
