"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface SegmentOption<T extends string | number> {
  value: T
  label: ReactNode
  title?: string
}

interface SegmentedProps<T extends string | number> {
  label: string
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
}

/** Shared toggle group used by the game configuration bar. */
export function Segmented<T extends string | number>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="flex w-full sm:w-auto flex-col gap-s8">
      <span className="text-center text-[12px] sm:text-meta text-ink-muted">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex w-full sm:inline-flex sm:w-auto rounded-ref border border-line bg-canvas p-[4px]">
        {options.map((o) => {
          const selected = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              title={o.title}
              onClick={() => onChange(o.value)}
              className={cn(
                "inline-flex h-8 flex-1 sm:flex-none items-center justify-center gap-s8 rounded-nested px-[4px] sm:px-s16 font-heading text-[12px] sm:text-meta font-bold uppercase tracking-wide",
                "transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action",
                selected ? "bg-surface-2 text-ink shadow-soft" : "text-ink-muted hover:text-ink",
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
