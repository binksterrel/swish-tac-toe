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
import { Loader2, User, Lock, LogOut, Save, CheckCircle2, AlertCircle, Shield, CreditCard, Sparkles, Fingerprint, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { calculateXP, getRank } from "@/lib/ranking"
import { RankBadge } from "@/components/ranking/rank-badge"

export default function ProfilePage() {
    const { user, isLoading: authLoading, signOut, supabase } = useAuth()
    const { t } = useLanguage()
    
    // Core Form State
    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    
    // UI State
    const [activeTab, setActiveTab] = useState<'identity' | 'security'>('identity')
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Rank State
    const [rankData, setRankData] = useState<any>(null)
    const [xp, setXp] = useState(0)

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || "")
            setUsername(user.user_metadata?.username || "")

            // Fetch Stats for Ranking
            fetch('/api/user/matches?limit=100').then(res => res.json()).then(data => {
                if (data.history) {
                    const wins = data.history.filter((h: any) => h.result === 'WIN').length
                    const draws = data.history.filter((h: any) => h.result === 'DRAW').length
                    const matches = data.history.length
                    const calculatedXp = calculateXP({ wins, draws, losses: matches - wins - draws, total_matches: matches })
                    setXp(calculatedXp)
                    setRankData(getRank(calculatedXp))
                }
            }).catch(e => console.error("Stats fetch error", e))
        }
    }, [user])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        try {
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName, username: username }
            })
            if (authError) throw authError

            // Sync public profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ username, updated_at: new Date().toISOString() })
                .eq('id', user?.id)
            
            setMessage({ type: 'success', text: "Profile details updated." })
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

    // --- RENDER HELPERS ---
    
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

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-nba-red selection:text-white pb-20">
            <NBATicker />
            <Header />

            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-nba-blue/5 rounded-full blur-[150px] opacity-40 animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-nba-red/5 rounded-full blur-[150px] opacity-40 animate-pulse" style={{ animationDuration: '12s' }} />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10 max-w-6xl">
                
                {/* PAGE HEADER */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold italic tracking-tighter text-white uppercase drop-shadow-2xl">
                        Member <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Profile</span>
                    </h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-nba-blue to-nba-red mt-2 rounded-full" />
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: THE "PREMIUM CARD" */}
                    <div className="lg:col-span-4 self-start sticky top-8">


                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group transition-all hover:border-white/20">
                            {/* Card Holo Shine */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none transform -skew-x-12" />

                            <div className="p-8 flex flex-col items-center text-center relative z-10">
                                {/* Status Chip -> Rank Badge */}
                                <div className="absolute top-4 right-4">
                                     {rankData && <RankBadge rank={rankData.current} size="sm" />}
                                     {!rankData && (
                                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Verified
                                        </div>
                                     )}
                                </div>

                                {/* Avatar Container */}
                                <div className="mb-6 relative">
                                    <div className={cn(
                                        "absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity",
                                        rankData ? `bg-gradient-to-br ${rankData.current.gradient}` : "bg-gradient-to-br from-nba-blue to-nba-red"
                                    )} />
                                    <Avatar className="w-32 h-32 border-4 border-[#1a1a1a] shadow-2xl relative z-10">
                                        <AvatarImage src={user.user_metadata?.avatar_url} className="object-cover" />
                                        <AvatarFallback className="bg-[#1a1a1a] text-3xl font-bold font-heading italic text-gray-500">{user.email?.slice(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>

                                {/* Names */}
                                <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-1">{fullName || "Anonymous Member"}</h2>
                                <p className="text-nba-blue font-mono text-sm mb-6">@{username || "username"}</p>

                                {/* Metadata Grid */}
                                <div className="w-full grid grid-cols-1 gap-3 text-left">
                                    
                                     {/* Rank Progress */}
                                     {rankData && (
                                        <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className={cn("text-xs font-bold uppercase", `text-${(rankData.current.color || 'text-slate-400').split('-')[1]}-400`)}>
                                                    {rankData.current.label}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">{xp} XP</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className={cn("h-full transition-all duration-1000", `bg-gradient-to-r ${rankData.current.gradient}`)} style={{ width: `${rankData.progress}%` }} />
                                            </div>
                                            <div className="text-[9px] text-gray-600 text-right uppercase tracking-wider">Next: {rankData.next.label}</div>
                                        </div>
                                     )}

                                    <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                                            <Fingerprint className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">User ID</div>
                                            <div className="text-xs font-mono text-gray-300 truncate w-32">{user.id}</div>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg text-gray-400">
                                            <CalendarDays className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Member Since</div>
                                            <div className="text-xs font-mono text-gray-300">{joinDate}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative Bottom Strip */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CONTROL CENTER */}
                    <div className="lg:col-span-8">
                        
                        {/* Tab Navigation */}
                        <div className="flex items-center gap-4 mb-8">
                            <button 
                                onClick={() => setActiveTab('identity')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 border",
                                    activeTab === 'identity' 
                                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                                        : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </button>
                            <button 
                                onClick={() => setActiveTab('security')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 border",
                                    activeTab === 'security' 
                                        ? "bg-nba-red text-white border-nba-red shadow-[0_0_20px_rgba(220,38,38,0.3)]" 
                                        : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <Shield className="w-4 h-4" />
                                Security
                            </button>
                        </div>

                        {/* Content Panel */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden">
                             <AnimatePresence mode="wait">
                                {activeTab === 'identity' && (
                                    <motion.div 
                                        key="identity"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/5">
                                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Identity Settings</h3>
                                                <p className="text-sm text-gray-400">Manage how you appear in the game world.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</Label>
                                                <div className="relative group">
                                                    <Input 
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="bg-black/40 border-white/10 focus:border-nba-blue/50 text-white h-12 pl-4 pr-10 rounded-xl transition-all group-hover:border-white/20"
                                                        placeholder="Enter your name" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Username / Handle</Label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">@</div>
                                                    <Input 
                                                        value={username} 
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="bg-black/40 border-white/10 focus:border-nba-blue/50 text-white h-12 pl-8 pr-4 rounded-xl font-mono transition-all group-hover:border-white/20"
                                                        placeholder="username" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <Button disabled={isSaving} className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg w-full md:w-auto">
                                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </form>
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
                                        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/5">
                                            <div className="p-3 bg-nba-red/10 rounded-xl text-nba-red border border-nba-red/20">
                                                <Lock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Access Control</h3>
                                                <p className="text-sm text-gray-400">Update your password and manage sessions.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">New Password</Label>
                                                <Input 
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="bg-black/40 border-white/10 focus:border-nba-red/50 text-white h-12 px-4 rounded-xl"
                                                    placeholder="••••••••" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Confirm Password</Label>
                                                <Input 
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="bg-black/40 border-white/10 focus:border-nba-red/50 text-white h-12 px-4 rounded-xl"
                                                    placeholder="••••••••" 
                                                />
                                            </div>

                                            <div className="pt-4 border-b border-white/10 pb-8 mb-8">
                                                <Button disabled={isSaving || !password} className="bg-nba-red hover:bg-red-700 text-white font-bold uppercase tracking-widest px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.3)] w-full md:w-auto">
                                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                    Update Password
                                                </Button>
                                            </div>

                                            {/* Danger Zone */}
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                                                    <AlertCircle className="w-3 h-3" /> Danger Zone
                                                </h4>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={() => signOut()} 
                                                    className="w-full border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white uppercase font-bold tracking-widest h-12 rounded-xl"
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

                {/* Toast */}
                {message && (
                     <div className={cn(
                        "fixed bottom-8 right-8 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border bg-[#0a0a0a]/90 backdrop-blur-xl border-white/10",
                        message.type === 'success' ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"
                    )}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-bold text-sm tracking-wide">{message.text}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

// Force Rebuild
