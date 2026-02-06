"use client"

import { NBATicker } from "@/components/layout/nba-ticker"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User, Lock, LogOut, Save, CheckCircle2, AlertCircle, Shield, CreditCard, Sparkles, Fingerprint, CalendarDays, Trophy, Medal, Star, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { OvrBadge } from "@/components/ranking/ovr-badge"
import { NBA_TEAMS } from "@/lib/nba-data"
import { TeamSelector } from "@/components/profile/team-selector"

import { useUserStats } from "@/hooks/use-user-stats"

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

            // Sync public profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ username, updated_at: new Date().toISOString() })
                .eq('id', user?.id)
            
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
    
    if (authLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-white w-8 h-8" /></div>
    
    if (!user) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                 <h1 className="text-xl font-bold mb-4 font-heading uppercase tracking-widest">Access Denied</h1>
                 <Button onClick={() => window.location.href = '/login'} variant="outline" className="border-white/20 hover:bg-white hover:text-black uppercase font-bold tracking-widest">Sign In</Button>
            </div>
        )
    }

    const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'
    const favoriteTeam = favoriteTeamId ? NBA_TEAMS[favoriteTeamId] : null
    const primaryColor = favoriteTeam ? favoriteTeam.colors[0] : '#1a1a1a'
    const secondaryColor = favoriteTeam ? favoriteTeam.colors[1] : '#333'

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-nba-red selection:text-white pb-20 overflow-x-hidden">
            <NBATicker />
            <Header />

            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                 {favoriteTeam ? (
                     <>
                        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 animate-pulse transition-colors duration-1000" style={{ backgroundColor: primaryColor, animationDuration: '10s' }} />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 animate-pulse transition-colors duration-1000" style={{ backgroundColor: secondaryColor, animationDuration: '12s' }} />
                     </>
                 ) : (
                    <>
                        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-nba-blue/5 rounded-full blur-[150px] opacity-40 animate-pulse" style={{ animationDuration: '10s' }} />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-nba-red/5 rounded-full blur-[150px] opacity-40 animate-pulse" style={{ animationDuration: '12s' }} />
                    </>
                 )}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12 relative z-10 max-w-6xl">
                
                {/* PAGE HEADER */}
                <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-heading font-bold italic tracking-tighter text-white uppercase drop-shadow-2xl">
                            Manager <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Office</span>
                        </h1>
                        <div className="h-1.5 w-32 bg-gradient-to-r from-white/20 to-transparent mt-2 rounded-full" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: THE "GM CARD" */}
                    <div className="lg:col-span-4 self-start sticky top-8">
                        <div className={cn(
                            "bg-white/5 backdrop-blur-xl border rounded-[2rem] overflow-hidden shadow-2xl relative group transition-all duration-500",
                            favoriteTeam ? "hover:shadow-[0_0_50px_rgba(0,0,0,0.3)]" : "hover:border-white/20"
                        )} style={{ borderColor: favoriteTeam ? `${primaryColor}40` : 'rgba(255,255,255,0.1)' }}>
                            
                            {/* Card Background Branding */}
                            {favoriteTeam && (
                                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/noise.png')] mix-blend-overlay" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} />
                            )}
                            
                            {/* Content */}
                            <div className="p-8 flex flex-col items-center text-center relative z-10">
                                
                                {/* OVR Badge Centered */}
                                <div className="mb-6 relative group/avatar">
                                    <div className="absolute inset-0 bg-black/50 rounded-full blur-2xl transform scale-90" />
                                    <OvrBadge rating={rankData?.ovr || 50} className="w-40 h-40 md:w-48 md:h-48" />
                                    
                                    {/* Avatar Overlay (Small) */}
                                    <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full border-4 border-[#121212] bg-[#1a1a1a] overflow-hidden shadow-xl z-20">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={user.user_metadata?.avatar_url} className="object-cover" />
                                            <AvatarFallback className="bg-[#1a1a1a] text-xs font-bold font-heading italic text-gray-400">{user.email?.slice(0,2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>

                                {/* Identity */}
                                <h2 className="text-3xl font-heading font-bold italic text-white uppercase tracking-tighter mb-1 relative inline-block">
                                    {fullName || "Anonymous GM"}
                                    {favoriteTeam && (
                                        <div className="absolute -top-4 -right-8 w-8 h-8 opacity-80" title={favoriteTeam.name}>
                                              <img src={`https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${favoriteTeamId?.toLowerCase() === 'uta' ? 'utah' : favoriteTeamId?.toLowerCase() === 'nop' ? 'no' : favoriteTeamId?.toLowerCase() === 'nyk' ? 'ny' : favoriteTeamId?.toLowerCase() === 'sas' ? 'sa' : favoriteTeamId?.toLowerCase() === 'gsw' ? 'gs' : favoriteTeamId?.toLowerCase() === 'phx' ? 'phx' : favoriteTeamId?.toLowerCase() === 'bkn' ? 'bkn' : favoriteTeamId?.toLowerCase() === 'was' ? 'wsh' : favoriteTeamId?.toLowerCase()}.png`} alt={favoriteTeam.name} className="w-full h-full object-contain drop-shadow-md" />
                                        </div>
                                    )}
                                </h2>
                                <p className="font-mono text-sm text-white/50 mb-8 bg-black/20 px-3 py-1 rounded-full">@{username || "rookie_manager"}</p>

                                {/* Mini Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">XP Points</div>
                                        <div className="text-2xl font-bold font-heading italic">{xp.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Rank</div>
                                        <div className={cn("text-xs font-bold font-heading italic uppercase mt-1.5", `text-${(rankData?.current.color || 'text-gray-400').split('-')[1]}-400`)}>
                                            {rankData?.current.label || 'Rookie'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 bg-black/20 rounded-xl p-4 border border-white/5 backdrop-blur-sm flex items-center justify-between">
                                          <div className="flex flex-col text-left">
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Member Since</span>
                                                <span className="text-xs font-mono text-white/80">{joinDate}</span>
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
                                            ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105" 
                                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Panel */}
                        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 relative overflow-hidden min-h-[400px]">
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
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Identity Settings</h3>
                                                <p className="text-sm text-gray-400">Manage your visuals and basic info.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-xl">
                                            {/* Name & Handle */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</Label>
                                                    <Input 
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="bg-black/40 border-white/10 focus:border-white/30 text-white h-12 rounded-xl"
                                                        placeholder="Enter name" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Handle</Label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</div>
                                                        <Input 
                                                            value={username} 
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            className="bg-black/40 border-white/10 focus:border-white/30 text-white h-12 pl-8 rounded-xl font-mono"
                                                            placeholder="username" 
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Favorite Team Selector */}
                                            <div className="space-y-3">
                                                 <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center justify-between">
                                                     Favorite Franchise
                                                     <span className="text-[10px] text-nba-blue">Customize Analysis Theme</span>
                                                 </Label>
                                                 <TeamSelector value={favoriteTeamId} onChange={setFavoriteTeamId} />
                                            </div>

                                            <div className="pt-4 border-t border-white/5">
                                                <Button disabled={isSaving} className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg w-full md:w-auto">
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
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-white/10 flex items-center justify-center">
                                                <Trophy className="w-6 h-6 text-amber-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Trophy Room</h3>
                                                <p className="text-sm text-gray-400">Achievements and milestones.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* Mock Badges for Visuals */}
                                            {[
                                                { icon: Trophy, label: "First Win", desc: "Won your first game", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
                                                { icon: Target, label: "Sharpshooter", desc: ">50% Accuracy", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
                                                { icon: Crown, label: "King of Court", desc: "Won 5 in a row", opacity: "opacity-40 grayscale", locked: true },
                                                { icon: Medal, label: "Veteran", desc: "Played 50 games", opacity: "opacity-40 grayscale", locked: true },
                                            ].map((badge, i) => (
                                                <div key={i} className={cn(
                                                    "aspect-square rounded-2xl border flex flex-col items-center justify-center p-4 text-center group transition-all hover:scale-105",
                                                    badge.locked ? "border-white/5 bg-white/5" : `${badge.bg} ${badge.border}`,
                                                    badge.opacity
                                                )}>
                                                    <badge.icon className={cn("w-8 h-8 mb-3", badge.color || "text-gray-500")} />
                                                    <div className="text-xs font-bold uppercase tracking-wider text-white mb-1">{badge.label}</div>
                                                    <div className="text-[10px] text-gray-400 leading-tight">{badge.desc}</div>
                                                    {badge.locked && <Lock className="w-3 h-3 text-gray-600 mt-2" />}
                                                </div>
                                            ))}
                                        </div>
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
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                                                <Lock className="w-6 h-6 text-red-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Security</h3>
                                                <p className="text-sm text-gray-400">Password and session management.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
                                             <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">New Password</Label>
                                                    <Input 
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="bg-black/40 border-white/10 focus:border-red-500/50 text-white h-12 rounded-xl"
                                                        placeholder="••••••••" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Confirm Password</Label>
                                                    <Input 
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="bg-black/40 border-white/10 focus:border-red-500/50 text-white h-12 rounded-xl"
                                                        placeholder="••••••••" 
                                                    />
                                                </div>
                                             </div>
                                            
                                            <div className="pt-6 relative">
                                                <Button disabled={isSaving || !password} className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20 w-full md:w-auto">
                                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                    Update Credentials
                                                </Button>
                                            </div>

                                            <div className="mt-12 pt-8 border-t border-white/5">
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                                                    <AlertCircle className="w-3 h-3" /> Danger Zone
                                                </h4>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={() => signOut()} 
                                                    className="w-full border-red-900/30 text-red-500 hover:bg-red-950/30 hover:text-red-400 hover:border-red-500/50 uppercase font-bold tracking-widest h-12 rounded-xl transition-all"
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
                                "fixed bottom-8 right-4 md:right-8 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border bg-[#0a0a0a]/90 backdrop-blur-xl",
                                message.type === 'success' ? "border-green-500/50 text-green-400 shadow-green-900/20" : "border-red-500/50 text-red-400 shadow-red-900/20"
                            )}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="font-bold text-sm tracking-wide">{message.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
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
