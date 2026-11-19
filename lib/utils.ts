import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge our custom tokens (app/globals.css) so that
// `text-meta` (size) and `text-ink` (colour) are not treated as conflicts.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['s8', 's16', 's24', 's32', 's48', 's64'],
      radius: ['ref', 'nested'],
      shadow: ['raised', 'soft', 'window'],
    },
    classGroups: {
      'font-size': [{ text: ['meta', 'body', 'lead', 'display', 'display-sm'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
