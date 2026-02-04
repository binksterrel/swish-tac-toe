"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { NBATicker } from "@/components/layout/nba-ticker"
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
              if (username.length < 3) throw new Error("Username must be at least 3 characters")
              if (password !== confirmPassword) throw new Error("Passwords do not match")
              
              await signUpWithEmail(email, password, username, previewAvatarUrl)
              
              // Auto sign in or show success message? Supabase usually requires email confirmation or auto-signs in.
              // Assuming auto-sign in or we can prompt. 
          } else {
              await signInWithEmail(email, password)
          }
      } catch (err: any) {
          setError(err.message || "Authentication failed")
      } finally {
          setLoading(false)
      }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative overflow-hidden selection:bg-nba-red selection:text-white">
        <NBATicker />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-nba-blue/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-nba-red/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
            
            {/* Logo / Brand */}
            <Link href="/" className="mb-8 flex flex-col items-center hover:opacity-90 transition-opacity">
              <h1 className="text-4xl md:text-5xl font-heading font-bold italic tracking-tighter text-white uppercase leading-[0.85] drop-shadow-lg text-center">
                SWISH
                <br/>
                <span className="text-nba-blue">TAC</span><span className="text-nba-red">TOE</span>
              </h1>
            </Link>

            {/* Login Card */}
            <div className={cn(
                "w-full bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all duration-500",
                isSignUp ? "max-w-2xl" : "max-w-sm"
            )}>
                
                {/* Header Toggle */}
                <div className="flex border-b border-white/10">
                    <button 
                        onClick={() => setIsSignUp(false)}
                        className={cn(
                            "flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors",
                            !isSignUp ? "bg-white/5 text-white border-b-2 border-nba-blue" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => setIsSignUp(true)}
                        className={cn(
                            "flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors",
                            isSignUp ? "bg-white/5 text-white border-b-2 border-nba-red" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold uppercase tracking-wide text-center mb-2">
                            {isSignUp ? "🏀 Join the League" : "Welcome Back, MVP"}
                        </h2>
                        <p className="text-xs text-gray-400 text-center">
                            {isSignUp 
                                ? "Prove your NBA knowledge. Compete globally. Claim your crown."
                                : "Ready to defend your title?"
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-2 text-xs text-red-200">
                             <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                             <span>{error}</span>
                        </div>
                    )}
                    
                    <div className={cn("flex gap-8", !isSignUp && "flex-col")}>
                        
                        <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", isSignUp ? "flex-1" : "w-full")}>
                        
                        {isSignUp && (
                            <div className="space-y-1 animate-in fade-in duration-300">
                                <label className="text-xs uppercase font-bold text-gray-500 ml-1">Your Court Name</label>
                                <div className="flex gap-4">
                                     <div className="relative flex-1">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="e.g., GOAT_Spotter"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-md py-3 pl-10 pr-4 text-sm placeholder:text-gray-600 focus:outline-none focus:border-nba-red transition-colors"
                                        />
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden bg-gray-800 shrink-0 flex-shrink-0">
                                        <img 
                                            src={previewAvatarUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Your avatar updates instantly</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-gray-500 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="email" 
                                    required 
                                    placeholder="lebron@lakers.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-md py-3 pl-10 pr-4 text-sm placeholder:text-gray-700 focus:outline-none focus:border-nba-blue transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs uppercase font-bold text-gray-500 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="password" 
                                    required 
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-md py-3 pl-10 pr-4 text-sm placeholder:text-gray-700 focus:outline-none focus:border-nba-blue transition-colors"
                                />
                            </div>
                        </div>

                        {isSignUp && (
                            <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-300">
                                <label className="text-xs uppercase font-bold text-gray-500 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="password" 
                                        required 
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-md py-3 pl-10 pr-4 text-sm placeholder:text-gray-700 focus:outline-none focus:border-nba-red transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <Button 
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-6 font-bold uppercase tracking-wider text-base mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                isSignUp ? "bg-nba-red hover:bg-red-700" : "bg-nba-blue hover:bg-blue-700"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                isSignUp ? "🏆 Claim Your Crown" : "Get Back in the Game"
                            )}
                        </Button>
                    </form>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-center">
                        <Link href="/game">
                            <button className="text-xs text-gray-500 hover:text-gray-200 uppercase tracking-wider flex items-center gap-2 transition-colors">
                                <span>🎮 Jump In as Guest</span> <ArrowRight className="w-3 h-3" />
                            </button>
                        </Link>
                    </div>
                    
                    {isSignUp && (
                        <div className="mt-6 text-center text-xs text-gray-500 space-y-2">
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    </div>
  )
}
