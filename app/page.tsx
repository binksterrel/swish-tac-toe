"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { NBATicker } from "@/components/layout/nba-ticker"
import { Header, SiteFooter } from "@/components/layout/header"
import { GameMockup } from "@/components/landing/game-mockup"
import CRTWarp from "@/components/landing/CRTWarp"
import { FeatureBento } from "@/components/landing/feature-bento"
import { useLanguage } from "@/contexts/language-context"

// Set to true to bring back the animated CRT backdrop behind the header + hero.
const SHOW_CRT_BACKDROP = true

// Shared interaction tokens: 200ms in (hover), 120ms out, ease-out.
const MOTION = "duration-[120ms] hover:duration-[200ms] ease-snappy"
// clip-path would cut an outline, so focus is drawn as an inset ring.
const FOCUS = "focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"

export default function LandingPage() {
  const { t } = useLanguage()

  const stats = [1, 2, 3, 4].map((n) => ({ value: t(`landing.stat_${n}_value`), label: t(`landing.stat_${n}_label`) }))

  return (
    <main className="min-h-screen bg-canvas text-ink font-sans text-body flex flex-col selection:bg-action selection:text-white">
      {/* 1. Ticker */}
      <NBATicker />
      {/* Header + hero share one backdrop: the CRT runs behind the header too */}
      <div className="relative overflow-hidden">
      {/* CRT backdrop: decorative, sits behind everything */}
      {SHOW_CRT_BACKDROP && (
        <div aria-hidden className="absolute inset-x-0 top-0 h-[860px] md:h-[920px]">
          {/* Dimmed CRT: same effect, less intensity */}
          <div className="absolute inset-0 opacity-60">
            <CRTWarp
              color="#3b82f6"
              backgroundColor="#09090c"
              mask="shadow"
              curvature={0.5}
              persistence={0.25}
              speed={0.6}
              levels={5}
              columns={96}
              corners={0}
              scanlineStrength={0.55}
              scanlineFrequency={240}
              maskStrength={0.55}
              bloom={1.3}
              rgbShift={0.004}
              vignette={0.5}
              className="h-full"
            />
          </div>
          {/* Legibility scrim behind the headline */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_30%,rgba(9,9,12,0.82),transparent_100%)]" />
          {/* Long fade to black so the buttons, stats and mockup stay clean */}
          <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-canvas via-canvas/85 to-transparent" />
        </div>
      )}

      <Header />

      {/* Hero + product shot */}
      <section className="relative pb-s64">
        <div className="relative z-10 mx-auto max-w-6xl px-s16 md:px-s32 pt-s48 md:pt-s64 text-center">
          <h1 className="mx-auto font-sans text-[clamp(30px,6vw,64px)] leading-[1.05] font-semibold tracking-tight text-ink">
            {t("landing.headline_1").split("NBA").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && <span className="text-action">NBA</span>}
              </span>
            ))}
            <br />
            <span className="text-ink">{t("landing.headline_2")}</span>
          </h1>

          <p className="mx-auto mt-s24 max-w-[72ch] text-balance text-body sm:text-lead text-ink-soft">{t("landing.hero_sub")}</p>

          <div className="mt-s32 flex flex-col sm:flex-row items-center justify-center gap-s8 sm:gap-s16">
            <Link
              href="/game"
              className={`chamfer group relative inline-flex h-11 sm:h-12 items-center justify-center gap-s8 overflow-hidden bg-action px-s24 font-sans text-meta sm:text-body font-semibold text-white transition-colors hover:bg-action-hover active:translate-y-px ${MOTION} ${FOCUS}`}
            >
              {/* Ambient light sweep, repeats on its own (no hover) */}
              <span aria-hidden className="shine-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/25 motion-reduce:hidden" />
              <span className="relative">{t("landing.cta_play")}</span>
              <ArrowRight className={`relative size-4 sm:size-5 transition-transform group-hover:translate-x-1 ${MOTION}`} strokeWidth={1.75} />
            </Link>
            <Link
              href="/battle"
              className={`group chamfer inline-flex h-11 sm:h-12 items-center justify-center gap-s8 px-s24 font-sans text-meta sm:text-body font-semibold text-ink-soft sm:bg-surface-2 sm:text-ink transition-colors hover:text-ink sm:hover:bg-line active:translate-y-px ${MOTION} ${FOCUS}`}
            >
              {t("landing.cta_battle")}
              <ArrowRight className={`size-4 sm:hidden transition-transform group-hover:translate-x-1 ${MOTION}`} strokeWidth={1.75} />
            </Link>
          </div>

          {/* Key facts */}
          <dl className="mx-auto mt-s48 grid max-w-[760px] grid-cols-2 gap-x-s24 gap-y-s24 sm:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <dt className="font-sans text-[clamp(18px,2vw,24px)] leading-none font-semibold tabular-nums text-ink">{value}</dt>
                <dd className="mt-s8 text-meta text-ink-soft">{label}</dd>
              </div>
            ))}
          </dl>
        </div>


        <div className="relative z-10 mx-auto mt-s48 md:mt-s64 max-w-[1040px] px-s16 md:px-s32">
          <GameMockup />
        </div>
      </section>
      </div>

      {/* Features */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-s16 md:px-s32 py-s64">
          <FeatureBento />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
