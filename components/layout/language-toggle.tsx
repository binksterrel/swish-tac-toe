"use client"

import { useLanguage } from "@/contexts/language-context"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
      className="flex items-center gap-s8 px-s16 py-s8 rounded-ref bg-surface border border-line shadow-soft text-meta font-semibold transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
      title={language === 'fr' ? "Switch to English" : "Passer en Français"}
    >
      <span className={language === 'fr' ? 'text-ink' : 'text-ink-muted'}>FR</span>
      <span className="text-line" aria-hidden="true">|</span>
      <span className={language === 'en' ? 'text-ink' : 'text-ink-muted'}>EN</span>
    </button>
  )
}
