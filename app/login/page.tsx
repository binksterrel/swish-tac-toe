"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, isLoading: isAuthLoading, user } = useAuth()
  const router = useRouter()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  
  const previewAvatarUrl = username.length > 0 
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=000000,b81d24,041e42&textColor=ffffff`
    : `https://api.dicebear.com/7.x/initials/svg?seed=Baller&backgroundColor=333333`;

  useEffect(() => {
    if (user && !isAuthLoading) {
      router.push('/game')
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
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-nba-red selection:text-white">
        
        {/* Background Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Blue Glow - Left */}
            <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-nba-blue/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
            {/* Red Glow - Right */}
            <div className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-nba-red/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />
            {/* Central Mesh */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-nba-blue/5 via-transparent to-transparent opacity-50" />
        </div>

        {/* Main Content */}
        <div className="w-full max-w-md relative z-10 flex flex-col items-center">
            
            {/* Minimalist Logo */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <Link href="/" className="inline-block group">
                    <h1 className="text-4xl font-heading font-black italic tracking-tighter text-white uppercase leading-none transition-opacity group-hover:opacity-90">
                        SWISH<span className="text-nba-blue">TAC</span><span className="text-nba-red">TOE</span>
                    </h1>
                </Link>
                <p className="text-xs text-white/40 uppercase tracking-[0.3em] mt-2 font-medium">The Ultimate NBA Grid Battle</p>
            </motion.div>

            {/* Glass Card */}
            <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
            >
                {/* Decorative Top Border */}
                <div className={cn(
                    "absolute top-0 left-0 w-full h-[1px] transition-colors duration-500",
                    isSignUp ? "bg-gradient-to-r from-transparent via-nba-red to-transparent" : "bg-gradient-to-r from-transparent via-nba-blue to-transparent"
                )} />

                <div className="p-8">
                    {/* Header Tabs */}
                    <div className="flex gap-8 mb-8 justify-center">
                        <button 
                            onClick={() => setIsSignUp(false)}
                            className={cn(
                                "text-sm font-bold uppercase tracking-wider transition-colors relative py-2",
                                !isSignUp ? "text-white" : "text-white/30 hover:text-white/60"
                            )}
                        >
                            Sign In
                            {!isSignUp && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-[2px] bg-nba-blue shadow-[0_0_10px_var(--color-nba-blue)]" />
                            )}
                        </button>
                        <button 
                            onClick={() => setIsSignUp(true)}
                            className={cn(
                                "text-sm font-bold uppercase tracking-wider transition-colors relative py-2",
                                isSignUp ? "text-white" : "text-white/30 hover:text-white/60"
                            )}
                        >
                            Sign Up
                            {isSignUp && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-[2px] bg-nba-red shadow-[0_0_10px_var(--color-nba-red)]" />
                            )}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-xs text-red-200">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <AnimatePresence mode="popLayout">
                            {isSignUp && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="space-y-4">
                                        
                                        {/* Avatar Preview - Centered Above */}
                                        <div className="flex justify-center mb-2">
                                            <div className="w-20 h-20 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 shadow-2xl relative group">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-nba-blue/20 to-nba-red/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <img 
                                                    src={previewAvatarUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider ml-1">USERNAME</label>
                                            <div className="relative group">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                                                <input 
                                                    type="text" 
                                                    required 
                                                    placeholder="Username"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/5 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-nba-red/50 focus:bg-white/10 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5 group">
                            <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                                <input 
                                    type="email" 
                                    required 
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={cn(
                                        "w-full bg-white/5 border border-white/5 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/10 transition-all font-medium",
                                        isSignUp ? "focus:border-nba-red/50" : "focus:border-nba-blue/50"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 group">
                            <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                                <input 
                                    type="password" 
                                    required 
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={cn(
                                        "w-full bg-white/5 border border-white/5 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/10 transition-all font-medium",
                                        isSignUp ? "focus:border-nba-red/50" : "focus:border-nba-blue/50"
                                    )}
                                />
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {isSignUp && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="space-y-1.5 overflow-hidden group"
                                >
                                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                                        <input 
                                            type="password" 
                                            required 
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-nba-red/50 focus:bg-white/10 transition-all font-medium"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button 
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-6 font-bold uppercase tracking-wider text-sm mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg border border-transparent",
                                isSignUp 
                                    ? "bg-nba-red hover:bg-[#A00520] shadow-[0_4px_20px_rgba(201,8,42,0.3)]" 
                                    : "bg-nba-blue hover:bg-[#0E2B6B] shadow-[0_4px_20px_rgba(23,64,139,0.3)]"
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                isSignUp ? "Create Account" : "Enter Arena"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                        <Link href="/game">
                            <button className="text-[11px] font-bold text-white/30 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
                                <span>Continue as Guest</span> <ArrowRight className="w-3 h-3" />
                            </button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Footer */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
            >
                <p className="text-[10px] text-white/20 uppercase tracking-widest">
                    &copy; 2026 Swish Tac Toe
                </p>
            </motion.div>
        </div>
    </div>
  )
}
