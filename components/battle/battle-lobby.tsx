"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Loader2, ChevronRight, ChevronLeft, Users, RefreshCw, Zap, Globe, Swords, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { NBA_TEAMS, getTeamLogoUrl } from "@/lib/nba-data"
import { cn } from "@/lib/utils"
import { pusherClient } from "@/lib/pusher"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"

interface BattleLobbyProps {
  onJoin: (code: string, name: string) => Promise<void>
  onCreate: (name: string, difficulty: string) => Promise<void>
  isLoading: boolean
}

interface OpenBattle {
  code: string
  host_name: string
  difficulty: string
  created_at: string
}

export function BattleLobby({ onJoin, onCreate, isLoading }: BattleLobbyProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [view, setView] = useState<'selection' | 'online'>('selection')
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [mode, setMode] = useState<'menu' | 'join' | 'create'>('menu')
  const [difficulty, setDifficulty] = useState("medium")
  const [selectedTeam, setSelectedTeam] = useState("LAL")
  
  // Public Battles
  const [openBattles, setOpenBattles] = useState<OpenBattle[]>([])
  const [loadingBattles, setLoadingBattles] = useState(false)

  // Only include the 30 current NBA teams
  const CURRENT_NBA_TEAMS = [
    "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
    "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOH", "NYK",
    "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"
  ]
  const teamKeys = CURRENT_NBA_TEAMS.filter(t => NBA_TEAMS[t])

  const fetchOpenBattles = async () => {
    setLoadingBattles(true)
    try {
        const res = await fetch('/api/battle/list')
        const data = await res.json()
        if (data.battles) {
            setOpenBattles(data.battles)
        }
    } catch (e) {
        // Silent fail
    } finally {
        setLoadingBattles(false)
    }
  }

  // Fetch & Subscribe only when in Online mode + Join sub-mode
  useEffect(() => {
    if (view !== 'online' || mode !== 'join') return

    fetchOpenBattles()

    const channel = pusherClient.subscribe('lobby-updates')
    
    channel.bind('battle-created', (newBattle: OpenBattle) => {
        setOpenBattles(prev => {
            if (prev.find(b => b.code === newBattle.code)) return prev
            return [newBattle, ...prev]
        })
        toast.info("Nouvelle partie détectée !", { duration: 2000 })
    })

    channel.bind('battle-removed', (data: { code: string }) => {
        setOpenBattles(prev => prev.filter(b => b.code !== data.code))
    })

    return () => {
        pusherClient.unsubscribe('lobby-updates')
    }
  }, [view, mode])

  const handleCreateSubmit = () => {
    if (!name) {
        toast.error(t('battle.enter_nickname'))
        return
    }
    const fullName = `${selectedTeam}|${name}`
    onCreate(fullName, difficulty)
  }

  const handleJoin = () => {
    if (!name) {
        toast.error(t('battle.enter_nickname'))
        return
    }
    if (!code) {
        toast.error(t('battle.enter_code_error') || "Code requis")
        return
    }
    const fullName = `${selectedTeam}|${name}`
    onJoin(code, fullName)
  }

  const handleJoinOpenBattle = (battleCode: string) => {
    if (!name) {
        toast.error(t('battle.enter_nickname'))
        return
    }
    const fullName = `${selectedTeam}|${name}`
    onJoin(battleCode, fullName)
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  }

  // SCREEN 1: MODE SELECTION (Online vs Local)
  if (view === 'selection') {
      return (
        <div className="w-full max-w-3xl mx-auto relative z-10 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h1 className="text-3xl md:text-4xl font-heading font-bold uppercase italic tracking-tighter text-white mb-2">
                    {t('battle select mode') || "CHOISIS TON TERRAIN"}
                </h1>
                <p className="text-slate-400 text-xs md:text-sm uppercase tracking-widest font-medium">
                   Are you ready for the big stage?
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* ONLINE MODE CARD */}
                <motion.div
                    whileHover={{ scale: 1.02, borderColor: "rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('online')}
                    className="group relative h-64 bg-black/40 border border-white/10 rounded-2xl p-6 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-nba-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-nba-blue/20 transition-colors">
                        <Globe className="w-8 h-8 text-nba-blue" />
                    </div>
                    <div className="text-center relative z-10">
                        <h3 className="text-xl font-heading font-bold uppercase italic text-white mb-2 group-hover:text-nba-blue transition-colors">Online Battle</h3>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed px-4">
                            Affronte des joueurs du monde entier en temps réel. Grimpe dans le classement.
                        </p>
                    </div>
                </motion.div>

                {/* LOCAL MODE CARD */}
                <motion.div
                    whileHover={{ scale: 1.02, borderColor: "rgba(255, 255, 255, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/battle/local')}
                    className="group relative h-64 bg-black/40 border border-white/10 rounded-2xl p-6 cursor-pointer flex flex-col items-center justify-center gap-4 transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-nba-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-nba-red/20 transition-colors">
                         <Swords className="w-8 h-8 text-nba-red" />
                    </div>
                    <div className="text-center relative z-10">
                        <h3 className="text-xl font-heading font-bold uppercase italic text-white mb-2 group-hover:text-nba-red transition-colors">Local 1v1</h3>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed px-4">
                            Duel sur le même écran. Le mode classique canapé pour humilier tes potes.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
      )
  }

  // SCREEN 2: ONLINE LOBBY (Existing UI)
  return (
    <div className="w-full max-w-md mx-auto relative z-10">
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 border border-white/10 p-6 rounded-xl backdrop-blur-md shadow-xl relative"
        >
            {/* Back Button */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-2 top-2 h-8 w-8 text-slate-500 hover:text-white"
                onClick={() => setView('selection')}
            >
                <ArrowLeft className="w-4 h-4" />
            </Button>

            {/* Header Premium */}
            <div className="text-center mb-8 relative z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-nba-blue/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
                <h1 className="text-3xl font-heading font-bold uppercase italic tracking-tighter text-white mb-2 drop-shadow-xl inline-flex flex-col">
                    <span className="text-sm tracking-[0.3em] text-nba-blue not-italic mb-1">Online Arena</span>
                    <span>Défie un ami</span>
                </h1>
                <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                    En temps réel • 1v1 • Classement
                </p>
            </div>

            {!isLoading ? (
                <AnimatePresence mode="wait">
                    {mode === 'menu' && (
                        <motion.div 
                            key="menu"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            {/* Team Selector Large Card */}
                            <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-xl p-6 relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Swords className="w-24 h-24 text-white" />
                                </div>
                                
                                <div className="flex items-center justify-between mb-4">
                                     <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                                        onClick={() => {
                                            const idx = teamKeys.indexOf(selectedTeam)
                                            const prev = teamKeys[idx - 1] || teamKeys[teamKeys.length - 1]
                                            setSelectedTeam(prev)
                                        }}
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </Button>

                                    <div className="relative w-32 h-32 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                                        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full" />
                                        <img 
                                            src={getTeamLogoUrl(selectedTeam)}
                                            alt={NBA_TEAMS[selectedTeam].name}
                                            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                                        />
                                    </div>

                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                                        onClick={() => {
                                            const idx = teamKeys.indexOf(selectedTeam)
                                            const next = teamKeys[idx + 1] || teamKeys[0]
                                            setSelectedTeam(next)
                                        }}
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </Button>
                                </div>

                                <div className="text-center space-y-1">
                                    <h3 className="text-4xl font-heading font-bold uppercase italic text-white tracking-wide leading-none">
                                        {NBA_TEAMS[selectedTeam].name}
                                    </h3>
                                    <p className="text-xs font-bold text-nba-blue uppercase tracking-[0.2em]">
                                        {NBA_TEAMS[selectedTeam].city}
                                    </p>
                                </div>
                            </div>

                            <Input 
                                placeholder="TON BLAZE (PSEUDO)" 
                                className="bg-black/50 border-white/10 text-white text-center text-lg h-14 font-bold uppercase tracking-widest focus:border-nba-blue/50 focus:ring-1 focus:ring-nba-blue/50 transition-all rounded-lg placeholder:text-slate-600"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={12}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Button 
                                    onClick={() => setMode('create')} 
                                    className="bg-white text-black hover:bg-slate-200 h-14 text-sm font-black uppercase tracking-widest border border-transparent transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]"
                                    disabled={!name}
                                >
                                    Créer
                                </Button>
                                <Button 
                                    onClick={() => setMode('join')} 
                                    variant="outline"
                                    className="bg-transparent border-white/20 hover:bg-white/5 hover:border-white/40 text-white h-14 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                                    disabled={!name}
                                >
                                    Rejoindre
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'create' && (
                        <motion.div 
                            key="create"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 block text-center tracking-widest">{t('battle.select_difficulty')}</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[{key: 'easy', label: t('battle.difficulty_easy')}, {key: 'medium', label: t('battle.difficulty_medium')}, {key: 'hard', label: t('battle.difficulty_hard')}].map(({key, label}) => (
                                        <button
                                            key={key}
                                            onClick={() => setDifficulty(key)}
                                            className={cn(
                                                "py-3 px-1 rounded-md border font-heading font-bold uppercase transition-all duration-200 text-xs",
                                                difficulty === key 
                                                    ? "bg-white text-black border-white shadow-sm"
                                                    : "bg-transparent text-slate-500 border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button 
                                onClick={handleCreateSubmit} 
                                className="w-full bg-nba-red hover:bg-red-700 h-12 text-sm font-heading uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all border border-transparent"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                {t('battle.start')}
                            </Button>

                            <Button 
                                onClick={() => setMode('menu')} 
                                variant="ghost" 
                                className="w-full text-slate-500 hover:text-white uppercase tracking-widest text-[10px] h-8"
                            >
                                {t('battle.back')}
                            </Button>
                        </motion.div>
                    )}

                    {mode === 'join' && (
                        <motion.div 
                            key="join"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 block text-center tracking-widest">{t('battle.enter_code')}</label>
                                <Input 
                                    placeholder="NBA-XXXX" 
                                    className="bg-black/30 border-white/10 text-white text-center text-xl h-14 font-mono uppercase tracking-[0.15em] focus:border-green-500/50 transition-colors rounded-lg"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    maxLength={8}
                                    autoFocus
                                />
                            </div>
                            
                            <Button 
                                onClick={handleJoin} 
                                className="w-full bg-green-600 hover:bg-green-700 h-12 text-sm font-heading uppercase tracking-widest shadow-lg shadow-green-900/20 transition-all border border-transparent"
                            >
                                {t('battle.enter_arena')}
                            </Button>
                            
                            {/* Open Battles List Compact */}
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2 tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        {t('battle.open_battles')}
                                    </h3>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white" onClick={fetchOpenBattles}>
                                        <RefreshCw className={cn("w-3 h-3", loadingBattles && "animate-spin")} />
                                    </Button>
                                </div>
                                
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {loadingBattles ? (
                                        <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin mx-auto text-slate-600" /></div>
                                    ) : openBattles.length > 0 ? (
                                        openBattles.map(battle => (
                                            <div 
                                                key={battle.code} 
                                                className="flex items-center justify-between bg-white/5 p-2.5 rounded-md border border-white/5 hover:border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                                                onClick={() => handleJoinOpenBattle(battle.code)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                                                        {battle.host_name?.includes('|') ? battle.host_name.split('|')[1] : battle.host_name}
                                                    </span>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-black/30 rounded text-slate-500 border border-white/5 uppercase">
                                                        {battle.difficulty || 'med'}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Rejoindre
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 border border-dashed border-white/5 rounded-md">
                                            <p className="text-[10px] text-slate-600 italic">Aucune partie publique</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button 
                                onClick={() => setMode('menu')} 
                                variant="ghost" 
                                className="w-full text-slate-500 hover:text-white uppercase tracking-widest text-[10px] h-8"
                            >
                                {t('battle.back')}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            ) : (
                <div className="flex flex-col items-center justify-center py-8">
                     <Loader2 className="w-8 h-8 text-white animate-spin mb-4 opacity-50" />
                     <p className="uppercase font-bold tracking-widest text-xs text-slate-500 animate-pulse">
                        {mode === 'create' ? t('battle.initializing') : t('battle.connecting')}
                    </p>
                </div>
            )}
        </motion.div>
    </div>
  )
}
