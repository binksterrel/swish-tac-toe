"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { NBATicker } from "@/components/layout/nba-ticker"
import { Header, SiteFooter } from "@/components/layout/header"

const FIELD =
  "h-12 w-full rounded-nested border border-line bg-canvas pl-s48 pr-s16 text-body text-ink placeholder:text-ink-muted transition-colors duration-[120ms] ease-snappy focus:outline-none focus:border-brand-blue-soft"

export default function LoginPage() {
  const { signInWithEmail } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      router.push("/game")
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("auth.auth_error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink selection:bg-action selection:text-white">
      <NBATicker />
      <Header />

      <main className="flex flex-1 items-center justify-center px-s16 py-s32 md:py-s64">
        <section className="w-full max-w-sm rounded-ref border border-line bg-surface p-s24 shadow-window md:p-s32">
          <h1 className="font-sans text-lead font-semibold text-ink">{t("auth.welcome_back")}</h1>
          <p className="mt-s8 text-meta text-ink-muted">
            {t("auth.no_account")}{" "}
            <Link href="/signup" className="text-ink underline decoration-action/60 underline-offset-4 hover:decoration-action">
              {t("auth.create_link")}
            </Link>
          </p>

          {error && (
            <div role="alert" className="mt-s24 flex items-start gap-s8 rounded-nested border border-action/30 bg-action/10 p-s16 text-meta text-ink">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-s24 flex flex-col gap-s16">
            <div className="flex flex-col gap-s8">
              <label htmlFor="email" className="text-meta text-ink-muted">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={t("auth.email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={FIELD}
                />
              </div>
            </div>

            <div className="flex flex-col gap-s8">
              <label htmlFor="password" className="text-meta text-ink-muted">{t("auth.password")}</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={FIELD}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="chamfer mt-s8 inline-flex h-12 w-full items-center justify-center bg-action px-s24 font-sans text-body font-semibold text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : t("auth.sign_in")}
            </button>
          </form>

          <div className="mt-s24 flex justify-center">
            <Link
              href="/game"
              className="group inline-flex items-center gap-s8 text-meta text-ink-soft underline decoration-action/60 underline-offset-4 transition-colors duration-[120ms] ease-snappy hover:text-ink hover:decoration-action"
            >
              {t("auth.play_guest")}
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
