"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Criteria } from "@/lib/nba-data"
import { CriteriaHeader } from "@/components/game/criteria-header"
import { useLanguage } from "@/contexts/language-context"

const headshot = (id: number) => `https://cdn.nba.com/headshots/nba/latest/1040x760/${id}.png`

const CARD = "rounded-ref border border-line bg-surface p-s24 flex flex-col"
const TITLE = "font-sans text-lead font-medium text-ink"
const DESC = "mt-s8 max-w-[40ch] text-meta text-ink-muted"

const TEAM: Criteria = { type: "team", value: "LAL", label: "Lakers" }
const AWARD: Criteria = { type: "dpoy", value: "dpoy", label: "DPOY" }

// Real players from the database (NBA ids)
const FACES = [
  { name: "Bill Russell", id: 78049 },
  { name: "Larry Bird", id: 1449 },
  { name: "Michael Jordan", id: 893 },
  { name: "Kobe Bryant", id: 977 },
  { name: "Kevin Garnett", id: 708 },
  { name: "Shaquille O'Neal", id: 406 },
]

// Round winners of an example battle: blue = player 1, red = player 2
const ROUNDS = ["blue", "red", "blue", "red", "blue"] as const

export function FeatureBento() {
  const { t } = useLanguage()

  return (
    <div className="grid grid-cols-1 gap-s16 md:grid-cols-6">
      {/* 1 · Two criteria → one player */}
      <article className={`${CARD} md:col-span-4`}>
        <h3 className={TITLE}>{t("landing.feature_1_title")}</h3>
        <p className={DESC}>{t("landing.bento_1_desc")}</p>
        <div className="mt-s24 flex flex-1 items-center justify-center gap-s8 sm:gap-s16 rounded-nested border border-line bg-canvas p-s16">
          <div className="w-20 sm:w-24"><CriteriaHeader criteria={TEAM} direction="row" /></div>
          <span className="text-lead text-ink-muted" aria-hidden>+</span>
          <div className="w-20 sm:w-24"><CriteriaHeader criteria={AWARD} direction="row" /></div>
          <span className="text-lead text-ink-muted" aria-hidden>=</span>
          <div className="relative size-24 sm:size-28 overflow-hidden rounded-nested bg-surface-2">
            <Image src={headshot(23)} alt="Dennis Rodman" fill unoptimized sizes="112px" className="object-cover object-top scale-110 translate-y-[6%]" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-s8 pb-s8 pt-s16 text-center text-[11px] font-semibold text-white">Dennis Rodman</span>
          </div>
        </div>
      </article>

      {/* 2 · The database */}
      <article className={`${CARD} md:col-span-2`}>
        <h3 className={TITLE}>{t("landing.feature_2_title")}</h3>
        <p className={DESC}>{t("landing.bento_2_desc")}</p>
        <div className="mt-s24 flex flex-1 items-center">
          <div className="flex -space-x-3">
            {FACES.map(({ name, id }) => (
              <span key={id} className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-surface bg-canvas">
                <Image src={headshot(id)} alt={name} fill unoptimized sizes="44px" className="object-cover object-top scale-110 translate-y-[2px]" />
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/players"
          className="group mt-s24 inline-flex items-center gap-s8 text-meta font-medium text-ink-soft transition-colors duration-[120ms] hover:text-ink hover:duration-[200ms] ease-snappy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
        >
          {t("landing.cta_players")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
        </Link>
      </article>

      {/* 3 · Solo modes */}
      <article className={`${CARD} md:col-span-3`}>
        <h3 className={TITLE}>{t("landing.bento_3_title")}</h3>
        <ul className="mt-s16 divide-y divide-line">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="flex items-baseline justify-between gap-s16 py-s8">
              <span className="font-medium text-ink">{t(`landing.mode_${n}_name`)}</span>
              <span className="text-meta text-ink-muted">{t(`landing.mode_${n}_rule`)}</span>
            </li>
          ))}
        </ul>
      </article>

      {/* 4 · 1v1 battle */}
      <article className={`${CARD} md:col-span-3`}>
        <h3 className={TITLE}>{t("landing.bento_4_title")}</h3>
        <p className={DESC}>{t("landing.bento_4_desc")}</p>
        <div className="mt-s24 flex flex-1 items-end justify-between gap-s16">
          <div className="flex gap-s8" aria-hidden>
            {ROUNDS.map((side, i) => (
              <span key={i} className={`h-10 w-8 rounded-nested ${side === "blue" ? "bg-brand-blue-soft" : "bg-action"}`} />
            ))}
          </div>
          <p className="font-sans text-[clamp(24px,3vw,32px)] leading-none font-semibold tabular-nums text-ink">
            3<span className="text-ink-muted"> – </span>2
          </p>
        </div>
      </article>
    </div>
  )
}
