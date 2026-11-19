"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { LanguageToggle } from "@/components/layout/language-toggle"

const MOTION = "transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy"
const FOCUS = "rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"

export function Wordmark() {
  return (
    <span className="font-heading text-lead font-bold italic uppercase tracking-tight text-ink">
      Swish <span className="text-brand-blue-soft">Tac</span> <span className="text-action">Toe</span>
    </span>
  )
}

export function Header() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Player"
  const avatarUrl = user?.user_metadata?.avatar_url

  const primary = [
    { href: "/game", label: t("landing.nav_play") },
    { href: "/battle", label: t("battle.title") },
    { href: "/guess", label: t("gest.guess_the_player") },
    { href: "/players", label: t("game.players_db") },
  ]
  const secondary = [
    { href: "/games", label: t("game.games") },
    { href: "/stats", label: t("game.stats") },
  ]
  // A link is active on its own page and on any sub-page (/battle/ABC, /players/...).
  // "/game" must not match "/games": compare on a path-segment boundary.
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const linkClass = (href: string) =>
    cn(
      "relative font-heading text-meta font-semibold uppercase tracking-wider",
      MOTION,
      FOCUS,
      isActive(href) ? "text-ink" : "text-ink-muted hover:text-ink",
    )

  return (
    <header className="relative z-40 px-s8 pt-s8 md:px-s16 md:pt-s16">
      {/* Same cut corner as the buttons (.chamfer) */}
      <div className="chamfer mx-auto flex h-16 md:h-20 w-full max-w-6xl items-center justify-between gap-s24 bg-surface px-s16 md:px-s32">
        <Link href="/" className={FOCUS} aria-label="Swish Tac Toe">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo */}
          <img src="/brand/logo-swish-dark.svg" alt="" width={380} height={196} className="block h-11 md:h-14 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-s24 self-stretch">
          {[...primary, ...secondary].map((l, i) => (
            <span key={l.href} className="flex items-center gap-s24 self-stretch">
              {i === primary.length && <span aria-hidden="true" className="h-4 w-px bg-line" />}
              <Link href={l.href} className={cn(linkClass(l.href), "flex h-full items-center")} aria-current={isActive(l.href) ? "page" : undefined}>
                <span className="relative py-s8">
                  {l.label}
                  {isActive(l.href) && <span aria-hidden className="absolute inset-x-0 -bottom-[2px] h-[2px] bg-action" />}
                </span>
              </Link>
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-s16">
          {/* Auth */}
          {/* Fixed-size slot: the button/avatar fades in without moving its neighbours */}
          <div className="hidden lg:flex h-9 min-w-[104px] items-center justify-end">
            {isLoading ? (
              <span aria-hidden className="block h-9 w-[104px]" />
            ) : user ? (
              <Link href="/profile" className="block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action">
                <Avatar className="size-8 border border-line">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-surface-2 text-meta font-bold text-ink">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "chamfer-flip inline-flex animate-in fade-in duration-200 bg-surface-2 px-s16 py-s8 font-heading text-meta font-semibold hover:bg-line focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-action)]",
                  MOTION,
                  isActive("/login") ? "text-ink" : "text-ink-soft hover:text-ink",
                )}
                aria-current={isActive("/login") ? "page" : undefined}
              >
                {t("game.sign_in")}
              </Link>
            )}
          </div>

          <Link
            href="/game"
            className="chamfer hidden sm:inline-flex bg-ink px-s16 py-s8 font-heading text-meta font-bold uppercase tracking-wider text-canvas transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-ink-soft focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-action)]"
          >
            {t("landing.nav_play")}
          </Link>

          {/* Mobile menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Menu"
                className={cn("lg:hidden inline-flex size-10 items-center justify-center rounded-nested border border-line text-ink hover:bg-surface-2", MOTION, "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action")}
              >
                <Menu className="size-5" strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-line bg-surface p-s24 text-ink">
              <SheetHeader className="p-0">
                <SheetTitle className="text-left"><Wordmark /></SheetTitle>
              </SheetHeader>

              <nav className="mt-s24 flex flex-col">
                {[...primary, ...secondary].map((l, i) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between border-b border-line py-s16 font-heading text-lead font-bold uppercase tracking-tight",
                        i === primary.length && "mt-s16 border-t",
                        MOTION,
                        isActive(l.href) ? "text-ink" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {l.label}
                      {isActive(l.href) && <span className="size-2 rounded-full bg-action" />}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-s24">
                {isLoading ? (
                  <span className="block h-12 rounded-nested bg-surface-2" />
                ) : user ? (
                  <SheetClose asChild>
                    <Link href="/profile" className={cn("flex items-center gap-s16 rounded-nested border border-line p-s8 hover:bg-surface-2", MOTION)}>
                      <Avatar className="size-8 border border-line">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-surface-2 text-meta font-bold text-ink">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink">{displayName}</span>
                        <span className="block text-meta text-ink-muted">{t("gest.profile")}</span>
                      </span>
                    </Link>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Link href="/login" className={cn("chamfer flex h-12 items-center justify-center bg-ink font-heading text-body font-bold uppercase tracking-wider text-canvas hover:bg-ink-soft", MOTION)}>
                      {t("game.sign_in")}
                    </Link>
                  </SheetClose>
                )}
              </div>

              {/* Language (the floating toggle is desktop-only) */}
              <div className="mt-s24 flex items-center justify-between">
                <span className="text-meta text-ink-muted">{t("landing.language")}</span>
                <LanguageToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const { t } = useLanguage()
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex w-full max-w-6xl flex-col sm:flex-row sm:items-center justify-between gap-s8 px-s16 md:px-s32 py-s24">
        <Link href="/" aria-label="Swish Tac Toe" className={FOCUS}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo */}
          <img src="/brand/logo-swish-dark.svg" alt="" width={380} height={196} className="block h-12 w-auto" />
        </Link>
        <p className="text-meta text-ink-muted">© 2026 · {t("landing.footer")}</p>
      </div>
    </footer>
  )
}
