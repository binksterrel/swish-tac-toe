"use client"

import { NBAGame } from "@/components/game/nba-game"
import { NBATicker } from "@/components/layout/nba-ticker"
import { useLanguage } from "@/contexts/language-context"
import { Header, SiteFooter } from "@/components/layout/header"

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen flex flex-col bg-canvas text-ink font-sans text-body">
      <NBATicker />
      <Header />

      <section className="flex-1 w-full max-w-5xl mx-auto px-s16 md:px-s32 py-s32 md:py-s48">
        <NBAGame />

        <div className="mt-s48 text-center text-meta text-ink-muted">
          <p>{t('game.data_disclaimer_1')}</p>
          <p className="mt-s8">{t('game.data_disclaimer_2')}</p>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
