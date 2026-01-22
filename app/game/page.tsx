"use client"

import { NBAGame } from "@/components/game/nba-game"
import { NBATicker } from "@/components/nba-ticker"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { Header } from "@/components/header"

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-background relative flex flex-col font-sans">
      
      {/* 1. Official NBA Ticker */}
      <NBATicker />

      {/* 2. Broadcast Header */}
      <Header />

      {/* 3. Main Content Area - Technical Background */}
      <section className="flex-1 container mx-auto px-4 py-8 relative z-0">
        {/* Background Grid Lines affecting the pro feel */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50"></div>
        <NBAGame />
        
        {/* Data Disclaimer */}
        <div className="mt-8 text-center text-xs text-zinc-600 font-mono">
           <p>{t('game.data_disclaimer_1')}</p>
           <p className="opacity-50 mt-1">{t('game.data_disclaimer_2')}</p>
        </div>
      </section>

      {/* Footer - Official Copyright Look */}
      <footer className="bg-black text-gray-500 py-8 border-t border-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-6 mb-6 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">{t('game.privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('game.terms')}</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">{t('game.help')}</a>
          </div>
          <p className="text-[10px] md:text-xs font-mono">
            &copy; 2024 NBA MEDIA VENTURES, LLC. {t('game.rights')}
          </p>
        </div>
      </footer>
    </main>
  )
}
