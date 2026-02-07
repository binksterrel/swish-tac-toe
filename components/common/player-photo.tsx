import Image from "next/image"
import { getPlayerPhotoUrl, NBAPlayer } from "@/lib/nba-data"
import { cn } from "@/lib/utils"

interface PlayerPhotoProps {
  player: NBAPlayer
  className?: string
  fill?: boolean
  width?: number
  height?: number
  alt?: string
}

export function PlayerPhoto({ player, className, fill, width = 64, height = 64, alt }: PlayerPhotoProps) {
  const src = getPlayerPhotoUrl(player)
  const props = fill ? { fill: true, sizes: "100%" as const } : { width, height }
  return (
    <Image
      src={src}
      alt={alt || player.name}
      className={cn("object-cover", className)}
      unoptimized
      {...props}
    />
  )
}
