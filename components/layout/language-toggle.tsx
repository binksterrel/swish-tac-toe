
"use client"

import { useLanguage } from "@/contexts/language-context"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <button 
      onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-md"
      title={language === 'fr' ? "Switch to English" : "Passer en Français"}
    >
      <span className={`text-xs font-bold ${language === 'fr' ? 'text-white' : 'text-slate-400'}`}>FR</span>
      <span className="text-slate-600">|</span>
      <span className={`text-xs font-bold ${language === 'en' ? 'text-white' : 'text-slate-400'}`}>EN</span>
    </button>
  )
}
