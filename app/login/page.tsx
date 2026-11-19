"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { NBATicker } from "@/components/layout/nba-ticker"
import { Header, SiteFooter } from "@/components/layout/header"
import { ArrowRight, Loader2, Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, isLoading: isAuthLoading, user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  
  // Computed Avatar URL for preview
  const previewAvatarUrl = username.length > 0 
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=000000,b81d24,041e42&textColor=ffffff`
    : `https://api.dicebear.com/7.x/initials/svg?seed=Baller&backgroundColor=333333`;

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isAuthLoading) {
      // router.push('/games')
    }
  }, [user, isAuthLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setLoading(true)
      
      try {
          if (isSignUp) {
              if (username.length < 3) throw new Error(t('auth.username_error'))
              if (password !== confirmPassword) throw new Error(t('auth.password_error'))
              
              await signUpWithEmail(email, password, username, previewAvatarUrl)
              
              // Auto sign in or show success message? Supabase usually requires email confirmation or auto-signs in.
              // Assuming auto-sign in or we can prompt. 
          } else {
              await signInWithEmail(email, password)
          }
      } catch (err: any) {
          setError(err.message || t('auth.auth_error'))
      } finally {
          setLoading(false)
      }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col selection:bg-action selection:text-white">
        <NBATicker />
        <Header />
        

        <div className="flex-1 flex flex-col items-center justify-center px-s16 py-s48 relative z-10">

            {/* Login Card */}
            <div className={cn(
                "w-full bg-surface border border-line rounded-ref overflow-hidden shadow-window",
                isSignUp ? "max-w-2xl" : "max-w-sm"
            )}>
                
                {/* Header Toggle */}
                <div className="flex border-b border-line">
                    <button 
                        onClick={() => setIsSignUp(false)}
                        className={cn(
                            "flex-1 h-12 font-heading text-meta font-bold uppercase tracking-wider border-b-2 transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy",
                            !isSignUp ? "text-ink border-action" : "border-transparent text-ink-muted hover:text-ink"
                        )}
                    >
                        {t('auth.sign_in')}
                    </button>
                    <button 
                        onClick={() => setIsSignUp(true)}
                        className={cn(
                            "flex-1 h-12 font-heading text-meta font-bold uppercase tracking-wider border-b-2 transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy",
                            isSignUp ? "text-ink border-action" : "border-transparent text-ink-muted hover:text-ink"
                        )}
                    >
                        {t('auth.sign_up')}
                    </button>
                </div>

                <div className="p-s24 md:p-s32">
                    <h2 className="mb-s24 text-center font-heading text-lead font-bold uppercase tracking-tight text-ink">
                        {isSignUp ? t('auth.create_account') : t('auth.welcome_back')}
                    </h2>

                    {error && (
                        <div className="mb-s24 flex items-start gap-s8 rounded-nested border border-action/30 bg-action/10 p-s16 text-meta text-ink">
                             <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                             <span>{error}</span>
                        </div>
                    )}
                    
                    <div className={cn("flex gap-s32", !isSignUp && "flex-col")}>
                        
                        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-s16", isSignUp ? "flex-1" : "w-full")}>
                        
                        {isSignUp && (
                            <div className="flex flex-col gap-s8">
                                <label className="text-meta text-ink-muted">{t('auth.username')}</label>
                                <div className="flex items-center gap-s16">
                                     <div className="relative flex-1">
                                        <UserIcon className="pointer-events-none absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder={t('auth.username_placeholder')}
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="h-12 w-full rounded-nested border border-line bg-canvas pl-s48 pr-s16 text-body text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand-blue-soft transition-colors duration-[120ms] ease-snappy"
                                        />
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-line overflow-hidden bg-surface-2 shrink-0">
                                        <img 
                                            src={previewAvatarUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-s8">
                            <label className="text-meta text-ink-muted">{t('auth.email')}</label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                                <input 
                                    type="email" 
                                    required 
                                    placeholder={t('auth.email_placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 w-full rounded-nested border border-line bg-canvas pl-s48 pr-s16 text-body text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand-blue-soft transition-colors duration-[120ms] ease-snappy"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-s8">
                            <label className="text-meta text-ink-muted">{t('auth.password')}</label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                                <input 
                                    type="password" 
                                    required 
                                    placeholder={t('auth.password_placeholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 w-full rounded-nested border border-line bg-canvas pl-s48 pr-s16 text-body text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand-blue-soft transition-colors duration-[120ms] ease-snappy"
                                />
                            </div>
                        </div>

                        {isSignUp && (
                            <div className="flex flex-col gap-s8 animate-in slide-in-from-top-1 fade-in duration-200 ease-out">
                                <label className="text-meta text-ink-muted">{t('auth.confirm_password')}</label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-s16 top-1/2 size-5 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                                    <input 
                                        type="password" 
                                        required 
                                        placeholder={t('auth.password_placeholder')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-12 w-full rounded-nested border border-line bg-canvas pl-s48 pr-s16 text-body text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand-blue-soft transition-colors duration-[120ms] ease-snappy"
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="chamfer mt-s8 h-12 w-full rounded-none bg-action font-heading text-body font-bold uppercase tracking-wider text-white transition-colors duration-[120ms] hover:duration-[200ms] ease-snappy hover:bg-action-hover"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                isSignUp ? t('auth.join_league') : t('auth.sign_in')
                            )}
                        </Button>
                    </form>
                    </div>

                    <div className="mt-s24 flex justify-center">
                        <Link href="/game">
                            <button className="flex items-center gap-s8 text-meta text-ink-soft underline decoration-action/60 underline-offset-4 transition-colors duration-[120ms] ease-snappy hover:text-ink hover:decoration-action">
                                {t('auth.play_guest')} <ArrowRight className="w-3 h-3" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            
        </div>
        <div className="mt-auto"><SiteFooter /></div>
    </div>
  )
}
