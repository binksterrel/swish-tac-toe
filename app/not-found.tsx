"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Header, SiteFooter } from "@/components/layout/header"
import { NBATicker } from "@/components/layout/nba-ticker"

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink font-sans text-body">
      <NBATicker />
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-s16 py-s64 text-center">
        <p className="font-heading text-display font-bold italic uppercase tracking-tight text-ink">404</p>
        <h1 className="mt-s16 font-heading text-lead font-bold uppercase tracking-wide text-action">{t("notFound.title")}</h1>
        <p className="mx-auto mt-s8 max-w-[45ch] text-ink-muted">{t("notFound.description")}</p>

        <Link
          href="/"
          className="chamfer group mt-s32 inline-flex h-11 sm:h-12 items-center gap-s8 bg-action px-s24 font-heading text-meta sm:text-body font-bold uppercase tracking-wider text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
        >
          {t("notFound.button")}
          <ArrowRight className="size-4 sm:size-5 transition-transform duration-[120ms] group-hover:translate-x-1 group-hover:duration-[200ms] ease-snappy" strokeWidth={1.75} />
        </Link>
      </main>

      <SiteFooter />
    </div>
  )
}
