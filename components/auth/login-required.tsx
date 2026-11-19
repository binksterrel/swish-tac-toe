"use client"

import Link from "next/link"
import { Lock, LogIn } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function LoginRequired({ title, message }: { title?: string; message?: string }) {
  const { language } = useLanguage()
  const fr = language === "fr"

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-s16 py-s64 text-center">
      <div className="w-full max-w-md rounded-ref border border-line bg-surface p-s32 md:p-s48 shadow-soft">
        <div className="mx-auto flex size-12 items-center justify-center rounded-nested border border-line bg-surface-2">
          <Lock className="size-5 text-ink-muted" strokeWidth={1.75} />
        </div>
        <h2 className="mt-s24 font-heading text-lead font-bold uppercase tracking-tight text-ink">
          {title ?? (fr ? "Connexion requise" : "Sign in required")}
        </h2>
        <p className="mx-auto mt-s8 max-w-[45ch] text-ink-muted">
          {message ?? (fr ? "Connectez-vous pour accéder à cette page." : "You must be signed in to view this page.")}
        </p>
        <Link
          href="/login"
          className="chamfer mt-s32 inline-flex h-11 w-full items-center justify-center gap-s8 bg-action font-heading text-meta sm:text-body font-bold uppercase tracking-wider text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ink)]"
        >
          <LogIn className="size-4" strokeWidth={1.75} />
          {fr ? "Se connecter" : "Sign in"}
        </Link>
      </div>
    </div>
  )
}
