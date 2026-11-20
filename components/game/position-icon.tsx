import { cn } from "@/lib/utils"

/**
 * Half-court diagram with a dot where the position usually plays.
 * Court lines use currentColor; the dot is the accent red.
 */
const SPOTS: Record<string, { x: number; y: number }> = {
  PG: { x: 24, y: 8 }, // above the top of the key
  SG: { x: 41, y: 17 }, // right wing, outside the arc
  SF: { x: 8, y: 39 }, // left corner
  PF: { x: 29, y: 36 }, // right block
  C: { x: 24, y: 31 }, // under the basket
}

export function PositionIcon({ position, className }: { position: string; className?: string }) {
  const spot = SPOTS[position]
  if (!spot) return null

  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={cn("shrink-0", className)}>
      {/* Baseline */}
      <path d="M3 44h42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Three-point line */}
      <path d="M6 44V35a18 18 0 0 1 36 0v9" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      {/* Paint + free-throw circle */}
      <path d="M17 44V27h14v17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 27a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.5" />
      {/* Rim */}
      <circle cx="24" cy="41" r="1.6" stroke="currentColor" strokeWidth="1.2" />
      {/* Position */}
      <circle cx={spot.x} cy={spot.y} r="3.8" className="fill-action" />
    </svg>
  )
}
