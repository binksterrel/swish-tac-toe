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

import { User } from "lucide-react"
import { useState, useEffect } from "react"

export function PlayerPhoto({ player, className, fill, width = 64, height = 64, alt }: PlayerPhotoProps) {
  const src = getPlayerPhotoUrl(player)
  const [hasError, setHasError] = useState(false)

  // Reset error state when player changes
  useEffect(() => {
    setHasError(false)
  }, [player.id])

  const props = fill ? { fill: true, sizes: "100%" as const } : { width, height }

  if (!src || hasError) {
    return (
      <Image 
        src="/images/1920.png"
        alt={alt || player.name}
        className={cn("object-cover", className)}
        unoptimized
        {...props}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt || player.name}
      className={cn("object-cover", className)}
      unoptimized
      onError={() => setHasError(true)}
      {...props}
    />
  )
}
