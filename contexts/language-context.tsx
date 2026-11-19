
"use client"

import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react'
import { translations, Language } from '@/lib/translations'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// useLayoutEffect warns during SSR; this runs it on the client only
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to French as per recent iterations
  const [language, setLanguage] = useState<Language>('fr')
  const [mounted, setMounted] = useState(false)

  // Layout effect: runs before the browser paints the hydrated page, so a saved
  // language replaces the French default without a visible flash.
  useIsoLayoutEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('swish-lang')
    if (saved === 'fr' || saved === 'en') setLanguage(saved)
  }, [])

  useEffect(() => {
     if (mounted) {
       localStorage.setItem('swish-lang', language)
     }
  }, [language, mounted])

  const t = (path: string) => {
    const keys = path.split('.')
    let current: any = translations[language]
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Missing translation for key: ${path}`)
        return path
      }
      current = current[key]
    }
    return current as string
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
