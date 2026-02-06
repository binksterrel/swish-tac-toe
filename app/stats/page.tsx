"use client"

import { NBATicker } from "@/components/layout/nba-ticker"
import { Header } from "@/components/layout/header"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Trophy, TrendingUp, Users, Activity, Medal, Star, Flame, Target, Calendar, PieChart as PieIcon, ArrowUpRight } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts'
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LoginRequired } from "@/components/auth/login-required"
import { calculateXPByMode, getRank, XP_MULTIPLIERS } from "@/lib/ranking"
import { RankBadge } from "@/components/ranking/rank-badge"

import { OvrBadge } from "@/components/ranking/ovr-badge"

import { useUserStats } from "@/hooks/use-user-stats"

export default function StatsPage() {
  const { t } = useLanguage()
  const { user, isLoading: authLoading } = useAuth()
  
  const { stats, isLoading } = useUserStats()
  const rawHistory = stats?.rawHistory || []

  // --- Custom Tooltip for Charts ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/10 p-3 rounded shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          <p className="text-white font-bold font-mono text-sm">
            {payload[0].value} <span className="text-nba-blue">PTS</span>
          </p>
        </div>
      )
    }
    return null
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Rookie'
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-nba-red selection:text-white pb-20">
      <NBATicker />
      <Header />
      
      {/* BACKGROUND AMBIANCE */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-nba-blue/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-nba-red/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {!authLoading && !user ? (
            <LoginRequired title="Career Stats Locked" message="Sign in to track your performance, view your OVR rating, and analyze your game history." />
        ) : (
            <>
        {/* HERO SECTION: PLAYER CARD */}
        <div className="mb-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />
                
                {/* Avatar Ring */}
                <div className="relative group shrink-0">
                    <div className={cn(
                        "absolute -inset-1 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-1000 animate-pulse",
                        stats ? `bg-gradient-to-tr ${stats.rankData.current.gradient}` : "bg-gradient-to-tr from-nba-blue to-nba-red"
                    )} />
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-black shadow-2xl relative z-10">
                        <AvatarImage src={avatarUrl} className="object-cover" />
                        <AvatarFallback className="bg-gray-900 text-3xl font-bold font-heading">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    {/* Rank Badge Overlay */}
                    {stats && (
                        <div className="absolute -bottom-4 -right-2 z-20 scale-90 md:scale-100">
                             <RankBadge rank={stats.rankData.current} size="md" showLabel={false} />
                        </div>
                    )}
                </div>

                {/* Player Info */}
                <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase italic tracking-tighter text-white">
                            {displayName}
                        </h1>
                        {user ? (
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                        ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-500" />
                        )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 text-sm">
                        <p className="text-gray-400 font-mono uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Since {new Date().getFullYear()}
                        </p>

                        {/* Rank Progress Bar */}
                        {stats && (
                            <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                     <span className={cn("font-bold text-xs uppercase tracking-widest", `text-${stats.rankData.current.color.split('-')[1]}-400`)}>
                                        {stats.rankData.current.label}
                                     </span>
                                     <span className="text-[10px] text-gray-500 font-mono">
                                        {stats.xp} XP
                                     </span>
                                </div>
                                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.rankData.progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={cn("h-full", `bg-gradient-to-r ${stats.rankData.current.gradient}`)}
                                     />
                                </div>
                                <div className="text-[9px] text-gray-600 uppercase tracking-wider w-full text-right">
                                    Next: {stats.rankData.next.label}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* OVR Rating Box (FIFA Style) */}
                {/* OVR Rating Badge (Dashboard Style) */}
                <OvrBadge rating={stats ? Math.min(99, Math.floor(stats.winRate * 0.4 + stats.accuracy * 0.4 + (Math.min(stats.gamesPlayed, 100)) * 0.2)) : 60} />
            </motion.div>
        </div>

        {/* STATS GRID */}
        {!isLoading && stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<Trophy className="text-[#d4af37]" />} label="Win Rate" value={`${stats.winRate}%`} sub="Global Performance" delay={0.1} />
                <StatCard icon={<Flame className="text-orange-500" />} label="Current Streak" value={stats.currentStreak} sub="Consecutive Wins" delay={0.2} />
                <StatCard icon={<Activity className="text-nba-blue" />} label="Matches" value={stats.gamesPlayed} sub="Total Played" delay={0.3} />
                <StatCard icon={<TrendingUp className="text-green-400" />} label="Avg Score" value={stats.avgScore} sub="Points per Game" delay={0.4} />
            </div>
        ) : (
            <div className="h-32 flex items-center justify-center">
                <div className="size-8 border-2 border-nba-blue border-t-transparent rounded-full animate-spin" />
            </div>
        )}

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Line Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 min-h-[350px] relative group"
            >
                <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-nba-red" />
                        Score Trajectory (Last 50)
                     </h3>
                     <div className="px-3 py-1 bg-white/5 rounded text-xs text-gray-400 font-mono">AVG: {stats?.avgScore}</div>
                </div>
                
                <div className="h-[250px] w-full">
                    {rawHistory.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={rawHistory}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1d428a" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#1d428a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="score" stroke="#1d428a" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState message="Play more games to see trends" />
                    )}
                </div>
            </motion.div>

            {/* Pie Chart / Distribution */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 min-h-[350px] flex flex-col"
            >
                <div className="flex items-center gap-2 mb-6">
                    <PieIcon className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-bold uppercase tracking-wide">Mode Split</h3>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                    {stats?.modeData && rawHistory.length > 0 ? (
                        <div className="w-full h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.modeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.modeData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} itemStyle={{ color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Stat */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-heading font-bold italic">{stats.gamesPlayed}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                    ) : (
                        <EmptyState message="No data" />
                    )}
                </div>

                <div className="space-y-3 mt-4">
                    {stats?.modeData.map((item: any) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-gray-300">{item.name}</span>
                            </div>
                            <span className="font-mono font-bold">{item.value} ({stats.gamesPlayed > 0 ? Math.round((item.value/stats.gamesPlayed)*100) : 0}%)</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
            </>
        )}

      </div>
    </div>
  )
}

// --- Sub-components for cleaner code ---

function StatCard({ icon, label, value, sub, delay }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="bg-black/40 backdrop-blur-md border border-white/5 hover:border-white/20 p-5 rounded-xl group transition-all duration-300 hover:bg-white/5"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-heading font-bold italic text-white mb-1 group-hover:scale-105 transition-transform origin-left">
                {value}
            </div>
            <p className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">{sub}</p>
        </motion.div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
            <Target className="w-8 h-8 opacity-20" />
            <span className="text-xs uppercase tracking-widest font-bold">{message}</span>
        </div>
    )
}




