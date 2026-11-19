"use client"

import { NBATicker } from "@/components/layout/nba-ticker"
import { LoginRequired } from "@/components/auth/login-required"
import { Header, SiteFooter } from "@/components/layout/header"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User, Lock, LogOut, Save, CheckCircle2, AlertCircle, Shield, Sparkles, CalendarDays, Trophy, Medal, Star, Crown, Flame, Zap, Swords, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { OvrBadge } from "@/components/ranking/ovr-badge"
import { NBA_TEAMS } from "@/lib/nba-data"
import { TeamSelector } from "@/components/profile/team-selector"
import { TeamLogo } from "@/components/common/team-logo"

import { useUserStats } from "@/hooks/use-user-stats"
import { evaluateTrophies, buildTrophyContext, TROPHY_CATEGORIES } from "@/lib/trophies"

export default function ProfilePage() {
    const { user, isLoading: authLoading, signOut, supabase } = useAuth()
    const { stats } = useUserStats()
    
    // Core Form State
    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [favoriteTeamId, setFavoriteTeamId] = useState<string | null>(null)
    
    // UI State
    const [activeTab, setActiveTab] = useState<'identity' | 'security' | 'cabinet'>('identity')
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Direct stats access
    const xp = stats?.xp || 0
    const rankData = stats?.rankData

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || "")
            setUsername(user.user_metadata?.username || "")
            setFavoriteTeamId(user.user_metadata?.favorite_team || null)
        }
    }, [user])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        try {
            const { error: authError } = await supabase.auth.updateUser({
                data: { 
                    full_name: fullName, 
                    username: username,
                    favorite_team: favoriteTeamId
                }
            })
            if (authError) throw authError

            // Sync public profile (best-effort — auth metadata is the primary source)
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    username,
                    favorite_team: favoriteTeamId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id)

            if (profileError) {
                console.warn("Profile sync failed:", profileError.message || profileError)
            }

            setMessage({ type: 'success', text: "Manager details updated successfully." })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to update profile." })
        } finally {
            setIsSaving(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match." })
            return
        }
        setIsSaving(true)
        setMessage(null)
        try {
            const { error } = await supabase.auth.updateUser({ password: password })
            if (error) throw error
            setMessage({ type: 'success', text: "Security credentials updated." })
            setPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to update password." })
        } finally {
            setIsSaving(false)
        }
    }
    
    if (authLoading) return <div className="min-h-screen bg-canvas flex items-center justify-center"><Loader2 className="animate-spin text-white w-8 h-8" /></div>
    
    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-canvas text-ink">
                <NBATicker />
                <Header />
                <LoginRequired />
                <SiteFooter />
            </div>
        )
    }

    const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'
    const favoriteTeam = favoriteTeamId ? NBA_TEAMS[favoriteTeamId] : null
    const primaryColor = favoriteTeam ? favoriteTeam.colors[0] : '#1a1a1a'
    const secondaryColor = favoriteTeam ? favoriteTeam.colors[1] : '#333'

    return (
        <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans selection:bg-action selection:text-white overflow-x-hidden">
            <NBATicker />
            <Header />

            <div className="container mx-auto px-4 py-8 md:py-12 relative z-10 max-w-6xl">
                
                {/* PAGE HEADER */}
                <div className="mb-12 relative">
                    <div className="absolute -inset-1 opacity-20 blur-xl rounded-full w-2/3 h-2/3 -z-10" />
                    <div className="border-b border-line pb-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="p-2 bg-surface-2 rounded-lg border border-line backdrop-blur-sm">
                                <User className="w-5 h-5 text-ink-soft" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Manager Office</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-heading font-bold uppercase italic tracking-tighter text-white pr-4 pb-2"
                        >
                            Profil
                        </motion.h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: THE "GM CARD" */}
                    <div className="lg:col-span-4 self-start sticky top-8">
                        <div className={cn(
                            "bg-surface-2 backdrop-blur-xl border rounded-[2rem] overflow-hidden shadow-raised relative group transition-all duration-500",
                            favoriteTeam ? "hover:shadow-soft" : "hover:border-line"
                        )} style={{ borderColor: favoriteTeam ? `${primaryColor}40` : 'rgba(255,255,255,0.1)' }}>
                            
                            {/* Card Background Branding */}
                            {favoriteTeam && (
                                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/noise.png')] mix-blend-overlay" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} />
                            )}
                            
                            {/* Content */}
                            <div className="p-8 flex flex-col items-center text-center relative z-10">
                                
                                {/* OVR Badge Centered */}
                                <div className="mb-6 relative group/avatar">
                                    <OvrBadge rating={rankData?.ovr || 50} className="w-40 h-40 md:w-48 md:h-48" />
                                    
                                    {/* Avatar Overlay (Small) */}
                                    <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full border-4 border-[#121212] bg-[#1a1a1a] overflow-hidden shadow-raised z-20">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={user.user_metadata?.avatar_url} className="object-cover" />
                                            <AvatarFallback className="bg-[#1a1a1a] text-xs font-bold font-heading italic text-ink-muted">{user.email?.slice(0,2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>

                                {/* Identity */}
                                <h2 className="text-3xl font-heading font-bold italic text-white uppercase tracking-tighter mb-1 relative inline-block">
                                    {fullName || "Anonymous GM"}
                                    {favoriteTeam && (
                                        <div className="absolute -top-4 -right-8 w-8 h-8 opacity-80" title={favoriteTeam.name}>
                                              <TeamLogo teamId={favoriteTeamId} size={32} className="w-full h-full" />
                                        </div>
                                    )}
                                </h2>
                                <p className="tabular-nums text-sm text-white/50 mb-8 bg-black/20 px-3 py-1 rounded-full">@{username || "rookie_manager"}</p>

                                {/* Mini Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <div className="bg-black/20 rounded-xl p-4 border border-line backdrop-blur-sm">
                                        <div className="text-[10px] text-ink-muted uppercase tracking-widest font-bold mb-1">XP Points</div>
                                        <div className="text-2xl font-bold font-heading italic">{xp.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-black/20 rounded-xl p-4 border border-line backdrop-blur-sm">
                                        <div className="text-[10px] text-ink-muted uppercase tracking-widest font-bold mb-1">Rank</div>
                                        <div className={cn("text-xs font-bold font-heading italic uppercase mt-1.5", `text-${(rankData?.current.color || 'text-ink-muted').split('-')[1]}-400`)}>
                                            {rankData?.current.label || 'Rookie'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 bg-black/20 rounded-xl p-4 border border-line backdrop-blur-sm flex items-center justify-between">
                                          <div className="flex flex-col text-left">
                                                <span className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">Member Since</span>
                                                <span className="text-xs tabular-nums text-white/80">{joinDate}</span>
                                          </div>
                                          <CalendarDays className="w-5 h-5 text-white/20" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: TABS & CONTENT */}
                    <div className="lg:col-span-8">
                        
                        {/* Tab Bar */}
                        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 scrollbar-none">
                            {[
                                { id: 'identity', label: 'Identity', icon: User },
                                { id: 'cabinet', label: 'Trophy Room', icon: Trophy },
                                { id: 'security', label: 'Security', icon: Shield },
                            ].map((tab) => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 border flex-shrink-0",
                                        activeTab === tab.id
                                            ? "bg-white text-black border-white shadow-soft scale-105" 
                                            : "bg-surface-2 text-ink-muted border-line hover:bg-surface-2 hover:text-white"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Panel */}
                        <div className="bg-black/20 backdrop-blur-md border border-line rounded-3xl p-6 md:p-10 relative overflow-hidden min-h-[400px]">
                             <AnimatePresence mode="wait">
                                {activeTab === 'identity' && (
                                    <motion.div 
                                        key="identity"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl border border-line flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-brand-blue-soft" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Identity Settings</h3>
                                                <p className="text-sm text-ink-muted">Manage your visuals and basic info.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-xl">
                                            {/* Name & Handle */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Full Name</Label>
                                                    <Input 
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="bg-black/40 border-line focus:border-white/30 text-white h-12 rounded-xl"
                                                        placeholder="Enter name" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Handle</Label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">@</div>
                                                        <Input 
                                                            value={username} 
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            className="bg-black/40 border-line focus:border-white/30 text-white h-12 pl-8 rounded-xl tabular-nums"
                                                            placeholder="username" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Favorite Team Selector */}
                                            <div className="space-y-3">
                                                 <Label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1 flex items-center justify-between">
                                                     Favorite Franchise
                                                     <span className="text-[10px] text-brand-blue-soft">Customize Analysis Theme</span>
                                                 </Label>
                                                 <TeamSelector value={favoriteTeamId} onChange={setFavoriteTeamId} />
                                            </div>

                                            <div className="pt-4 border-t border-line">
                                                <Button disabled={isSaving} className="bg-white text-black hover:bg-ink-muted font-bold uppercase tracking-widest px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-raised w-full md:w-auto">
                                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {activeTab === 'cabinet' && (
                                    <motion.div 
                                        key="cabinet"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl border border-line flex items-center justify-center">
                                                <Trophy className="w-6 h-6 text-brand-blue-soft" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Trophy Room</h3>
                                                <p className="text-sm text-ink-muted">Achievements and milestones.</p>
                                            </div>
                                        </div>

                                        {(() => {
                                            const trophyCtx = stats ? buildTrophyContext(stats) : null
                                            const trophies = trophyCtx ? evaluateTrophies(trophyCtx) : []
                                            const unlockedCount = trophies.filter(t => t.unlocked).length

                                            const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
                                                Trophy, Medal, Star, Crown, Flame, Zap, Swords, Shield, Eye, Target
                                            }

                                            return (
                                                <div className="space-y-6">
                                                    {/* Progress Summary */}
                                                    <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3 border border-line">
                                                        <span className="text-xs text-ink-muted uppercase tracking-widest font-bold">Unlocked</span>
                                                        <span className="text-sm font-bold font-heading text-white">{unlockedCount} / {trophies.length}</span>
                                                    </div>

                                                    {TROPHY_CATEGORIES.map(cat => {
                                                        const catTrophies = trophies.filter(t => t.category === cat.id)
                                                        if (catTrophies.length === 0) return null
                                                        return (
                                                            <div key={cat.id}>
                                                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-ink-muted mb-3 ml-1">{cat.label}</h4>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                    {catTrophies.map(trophy => {
                                                                        const IconComp = ICON_MAP[trophy.icon] || Trophy
                                                                        return (
                                                                            <div key={trophy.id} className={cn(
                                                                                "rounded-2xl border flex flex-col items-center justify-center p-4 text-center group transition-all hover:scale-105 relative overflow-hidden",
                                                                                trophy.unlocked
                                                                                    ? `${trophy.bgColor} ${trophy.borderColor}`
                                                                                    : "border-line bg-white/[0.02] opacity-50 grayscale"
                                                                            )}>
                                                                                <IconComp className={cn("w-7 h-7 mb-2", trophy.unlocked ? trophy.color : "text-ink-muted/50")} />
                                                                                <div className={cn("text-[11px] font-bold uppercase tracking-wider mb-0.5", trophy.unlocked ? "text-white" : "text-ink-muted")}>{trophy.label}</div>
                                                                                <div className="text-[9px] text-ink-muted leading-tight">{trophy.description}</div>
                                                                                {!trophy.unlocked && (
                                                                                    <>
                                                                                        <div className="w-full mt-2 h-1 bg-surface-2 rounded-full overflow-hidden">
                                                                                            <div className="h-full bg-white/20 rounded-full transition-all" style={{ width: `${trophy.progress}%` }} />
                                                                                        </div>
                                                                                        <Lock className="w-2.5 h-2.5 text-ink-muted/50 mt-1.5" />
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })()}
                                    </motion.div>
                                )}

                                {activeTab === 'security' && (
                                    <motion.div 
                                        key="security"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl border border-line flex items-center justify-center">
                                                <Lock className="w-6 h-6 text-action" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Security</h3>
                                                <p className="text-sm text-ink-muted">Password and session management.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
                                             <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">New Password</Label>
                                                    <Input 
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="bg-black/40 border-line focus:border-action/50 text-white h-12 rounded-xl"
                                                        placeholder="••••••••" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-ink-muted ml-1">Confirm Password</Label>
                                                    <Input 
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="bg-black/40 border-line focus:border-action/50 text-white h-12 rounded-xl"
                                                        placeholder="••••••••" 
                                                    />
                                                </div>
                                             </div>
                                            
                                            <div className="pt-6 relative">
                                                <Button disabled={isSaving || !password} className="bg-action hover:bg-action text-white font-bold uppercase tracking-widest px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-raised shadow-red-900/20 w-full md:w-auto">
                                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                    Update Credentials
                                                </Button>
                                            </div>

                                            <div className="mt-12 pt-8 border-t border-line">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-action mb-4 flex items-center gap-2">
                                                    <AlertCircle className="w-3 h-3" /> Danger Zone
                                                </h4>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={() => signOut()} 
                                                    className="w-full border-action/30 text-action hover:bg-action/30 hover:text-action hover:border-action/50 uppercase font-bold tracking-widest h-12 rounded-xl transition-all"
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    Sign Out
                                                </Button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Toast Notification */}
                <AnimatePresence>
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={cn(
                                "fixed bottom-8 right-4 md:right-8 z-50 p-4 rounded-xl shadow-raised flex items-center gap-3 border bg-[#0a0a0a]/90 backdrop-blur-xl",
                                message.type === 'success' ? "border-success/50 text-success shadow-green-900/20" : "border-action/50 text-action shadow-red-900/20"
                            )}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-bold text-sm tracking-wide">{message.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="mt-auto"><SiteFooter /></div>
        </div>
    )
}

// Icon wrapper for safety
function Target(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
