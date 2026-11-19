"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, UserRound } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { NBATicker } from "@/components/layout/nba-ticker"
import { Header, SiteFooter } from "@/components/layout/header"
import { cn } from "@/lib/utils"

const FIELD =
  "h-12 w-full rounded-nested border border-line bg-canvas pl-s48 pr-s16 text-body text-ink placeholder:text-ink-muted transition-colors duration-[120ms] ease-snappy focus:outline-none focus:border-brand-blue-soft"

function Field({ id, label, icon: Icon, children }: { id: string; label: string; icon: typeof Mail; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-s8">
      <label htmlFor={id} className="text-meta text-ink-muted">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
        {children}
      </div>
    </div>
  )
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={cn("flex items-center gap-s8 text-meta transition-colors duration-[120ms]", ok ? "text-ink" : "text-ink-muted")}>
      <span className={cn("flex size-4 items-center justify-center rounded-full border", ok ? "border-transparent bg-success text-canvas" : "border-line")}>
        {ok && <Check className="size-3" strokeWidth={2.5} />}
      </span>
      {children}
    </li>
  )
}

export default function SignupPage() {
  const { signUpWithEmail, supabase } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const longEnough = password.length >= 6
  const matches = confirm.length > 0 && password === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (username.trim().length < 3) throw new Error(t("auth.username_error"))
      if (!longEnough) throw new Error(t("auth.password_placeholder"))
      if (password !== confirm) throw new Error(t("auth.password_error"))

      await signUpWithEmail(email, password, username.trim())

      // With e-mail confirmation on, there is no session yet: ask to check the inbox.
      const { data } = await supabase.auth.getSession()
      if (data.session) router.push("/game")
      else setSentTo(email)
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
        {/* Form */}
        <section className="w-full max-w-sm sm:max-w-lg rounded-ref border border-line bg-surface p-s24 shadow-window md:p-s32">
          {sentTo ? (
            <div className="text-center animate-in fade-in duration-200">
              <span className="mx-auto flex size-12 items-center justify-center rounded-nested border border-line bg-surface-2">
                <Mail className="size-5 text-brand-blue-soft" strokeWidth={1.75} />
              </span>
              <h2 className="mt-s24 font-sans text-lead font-semibold text-ink">{t("auth.confirm_title")}</h2>
              <p className="mt-s8 text-ink-soft">
                {t("auth.confirm_desc")} <span className="font-medium text-ink">{sentTo}</span>.
              </p>
              <p className="mt-s8 text-meta text-ink-muted">{t("auth.confirm_hint")}</p>
              <Link
                href="/login"
                className="chamfer mt-s32 inline-flex h-12 w-full items-center justify-center bg-action px-s24 font-sans text-body font-semibold text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
              >
                {t("auth.go_sign_in")}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-sans text-lead font-semibold text-ink">{t("auth.create_account")}</h1>
              <p className="mt-s8 text-meta text-ink-muted">
                {t("auth.have_account")}{" "}
                <Link href="/login" className="text-ink underline decoration-action/60 underline-offset-4 hover:decoration-action">
                  {t("auth.sign_in")}
                </Link>
              </p>

              {error && (
                <div role="alert" className="mt-s24 flex items-start gap-s8 rounded-nested border border-action/30 bg-action/10 p-s16 text-meta text-ink">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-s24 grid grid-cols-1 gap-s16 sm:grid-cols-2">
                <Field id="username" label={t("auth.username")} icon={UserRound}>
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder={t("auth.username_placeholder")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={FIELD}
                  />
                </Field>

                <Field id="email" label={t("auth.email")} icon={Mail}>
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
                </Field>

                <Field id="password" label={t("auth.password")} icon={Lock}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder={t("auth.password_placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(FIELD, "pr-s48")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("auth.hide_password") : t("auth.show_password")}
                    className="absolute right-s8 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-nested text-ink-muted transition-colors duration-[120ms] hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-action"
                  >
                    {showPassword ? <EyeOff className="size-5" strokeWidth={1.75} /> : <Eye className="size-5" strokeWidth={1.75} />}
                  </button>
                </Field>

                <Field id="confirm" label={t("auth.confirm_password")} icon={Lock}>
                  <input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder={t("auth.password_placeholder")}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={FIELD}
                  />
                </Field>

                <ul className="flex flex-wrap gap-x-s24 gap-y-[6px] sm:col-span-2" aria-live="polite">
                  <Rule ok={longEnough}>{t("auth.rule_length")}</Rule>
                  <Rule ok={matches}>{t("auth.rule_match")}</Rule>
                </ul>

                <button
                  type="submit"
                  disabled={loading}
                  className="chamfer inline-flex h-12 w-full sm:col-span-2 items-center justify-center bg-action px-s24 font-sans text-body font-semibold text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
                >
                  {loading ? <Loader2 className="size-5 animate-spin" /> : t("auth.join_league")}
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
            </>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
