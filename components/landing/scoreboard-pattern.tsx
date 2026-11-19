import { useMemo } from "react"

// Deterministic PRNG so server and client render the same pattern.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const COLS = 40
const ROWS = 52
const CELL_W = 12
const CELL_H = 10
const DASH_H = 4

interface Dash { x: number; y: number; w: number; red: boolean; o: number }

function buildDashes(seed: number): Dash[] {
  const rand = mulberry32(seed)

  // Skyline: smoothed random walk, lower towards the outer edge (col 0).
  const tops: number[] = []
  let walk = 0
  for (let c = 0; c < COLS; c++) {
    walk += (rand() - 0.5) * 6
    walk = Math.max(-8, Math.min(8, walk))
    const edgeLift = (c / COLS) * ROWS * 0.35
    tops.push(Math.round(ROWS * 0.25 + edgeLift + walk))
  }

  const dashes: Dash[] = []
  for (let r = 0; r < ROWS; r++) {
    let c = 0
    while (c < COLS) {
      const top = tops[c]
      if (r < top) { c++; continue }
      const depth = (r - top) / Math.max(1, ROWS - top)
      if (rand() < 0.3 + depth * 0.55) {
        let len = 1 + Math.floor(rand() * (depth > 0.5 ? 6 : 3))
        while (len > 1 && (c + len > COLS || r < tops[c + len - 1])) len--
        dashes.push({ x: c, y: r, w: len, red: rand() < 0.035, o: 0.35 + depth * 0.65 })
        c += len + 1
      } else {
        c++
      }
    }
  }
  return dashes
}

export function ScoreboardPattern({ seed, mirror = false, className }: { seed: number; mirror?: boolean; className?: string }) {
  const dashes = useMemo(() => buildDashes(seed), [seed])
  const width = COLS * CELL_W
  const height = ROWS * CELL_H

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      {dashes.map((d, i) => (
        <rect
          key={i}
          x={d.x * CELL_W}
          y={d.y * CELL_H}
          width={d.w * CELL_W - 4}
          height={DASH_H}
          className={d.red ? "fill-action" : "fill-brand-blue-soft"}
          opacity={d.o}
        />
      ))}
    </svg>
  )
}
