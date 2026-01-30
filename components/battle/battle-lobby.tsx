"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Loader2, ChevronRight, ChevronLeft, Users, RefreshCw } from "lucide-react"
import { NBA_TEAMS, getTeamLogoUrl } from "@/lib/nba-data"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

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
        console.error("Failed to fetch battles", e)
    } finally {
        setLoadingBattles(false)
    }
  }

  // Fetch when entering Join mode
  useEffect(() => {
    if (mode === 'join') {
        fetchOpenBattles()
    }
  }, [mode])

  const handleCreateSubmit = () => {
    if (!name) return
    const fullName = `${selectedTeam}|${name}`
    onCreate(fullName, difficulty)
  }

  const handleJoin = () => {
    if (!name || !code) return
    const fullName = `${selectedTeam}|${name}`
    onJoin(code, fullName)
  }

  const handleJoinOpenBattle = (battleCode: string) => {
    if (!name) {
        // Flash input or alert
        alert(t('battle.enter_nickname'))
        return
    }
    const fullName = `${selectedTeam}|${name}`
    onJoin(battleCode, fullName)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto w-full bg-black/60 border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-nba-blue via-white to-nba-red opacity-50" />

      <div className="text-center mb-8 relative z-10">
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            <h1 className="text-4xl font-heading font-bold italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{t('battle.title')}</h1>
            <p className="text-slate-400 font-medium">{t('battle.subtitle')}</p>
        </motion.div>
      </div>

      {!isLoading ? (
        <AnimatePresence mode="wait">
          {mode === 'menu' && (
            <motion.div 
                key="menu"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-6"
            >
               {/* Team Selector */}
               <div className="space-y-2">
                   <label className="text-xs uppercase font-bold text-slate-500 block text-center">Choisis ton équipe</label>
                   <div className="flex items-center justify-center gap-4 bg-black/40 p-2 rounded-xl border border-white/5">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-white"
                            onClick={() => {
                                const idx = teamKeys.indexOf(selectedTeam)
                                const prev = teamKeys[idx - 1] || teamKeys[teamKeys.length - 1]
                                setSelectedTeam(prev)
                            }}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        
                        <div className="w-20 h-20 rounded-full flex items-center justify-center relative group bg-black/30 border border-white/10">
                             <img 
                                src={getTeamLogoUrl(selectedTeam)}
                                alt={NBA_TEAMS[selectedTeam].name}
                                className="w-16 h-16 object-contain"
                             />
                        </div>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-white"
                            onClick={() => {
                                const idx = teamKeys.indexOf(selectedTeam)
                                const next = teamKeys[idx + 1] || teamKeys[0]
                                setSelectedTeam(next)
                            }}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                   </div>
                   <p className="text-center text-xs text-slate-600 font-bold uppercase tracking-widest">{NBA_TEAMS[selectedTeam].city} {NBA_TEAMS[selectedTeam].name}</p>
               </div>

               <div>
                 <Input 
                    placeholder={t('battle.enter_nickname')} 
                    className="bg-black/50 border-white/20 text-white text-center text-xl h-14 font-heading tracking-wider uppercase focus:ring-2 focus:ring-white/20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={12}
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                    <Button 
                        onClick={() => setMode('create')} 
                        className="bg-nba-blue hover:bg-blue-700 h-16 text-lg font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(29,66,138,0.3)] hover:shadow-[0_0_30px_rgba(29,66,138,0.5)] transition-all"
                        disabled={!name}
                    >
                        {t('battle.create')}
                    </Button>
                    <Button 
                        onClick={() => setMode('join')} 
                        variant="outline"
                        className="border-white/20 hover:bg-white/10 h-16 text-lg font-bold uppercase tracking-widest"
                        disabled={!name}
                    >
                        {t('battle.join')}
                    </Button>
               </div>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div 
                key="create"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className="space-y-6"
            >
               <div>
                  <label className="text-xs uppercase font-bold text-slate-500 mb-3 block text-center">{t('battle.select_difficulty')}</label>
                  <div className="grid grid-cols-3 gap-2">
                      {[{key: 'easy', label: t('battle.difficulty_easy')}, {key: 'medium', label: t('battle.difficulty_medium')}, {key: 'hard', label: t('battle.difficulty_hard')}].map(({key, label}) => (
                          <button
                            key={key}
                            onClick={() => setDifficulty(key)}
                            className={cn(
                                "py-4 px-2 rounded-xl border font-heading font-bold uppercase transition-all duration-300 relative overflow-hidden group",
                                difficulty === key 
                                    ? "text-black border-transparent scale-105 shadow-lg"
                                    : "bg-transparent text-slate-500 border-white/10 hover:border-white/30"
                            )}
                          >
                            <div className={cn("absolute inset-0 opacity-100 transition-opacity", difficulty === key ? "bg-white" : "bg-transparent")} />
                            <span className="relative z-10">{label}</span>
                          </button>
                      ))}
                  </div>
               </div>

               <Button 
                  onClick={handleCreateSubmit} 
                  className="w-full bg-gradient-to-r from-nba-red to-red-700 hover:from-red-600 hover:to-red-800 h-16 text-xl font-heading uppercase tracking-widest shadow-[0_0_20px_rgba(206,17,65,0.4)] transition-all transform hover:scale-[1.02]"
               >
                 {t('battle.start')}
               </Button>

               <Button onClick={() => setMode('menu')} variant="ghost" className="w-full text-slate-500 hover:text-white">{t('battle.back')}</Button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div 
                key="join"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className="space-y-6"
            >
               <div>
                 <label className="text-xs uppercase font-bold text-slate-500 mb-2 block text-center">{t('battle.enter_code')}</label>
                 <Input 
                    placeholder="NBA-XXXX" 
                    className="bg-black/50 border-white/20 text-white text-center text-3xl h-20 font-mono uppercase tracking-[0.2em] focus:ring-2 focus:ring-green-500/50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    autoFocus
                 />
               </div>
               <Button 
                 onClick={handleJoin} 
                 className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 h-16 text-xl font-heading uppercase tracking-widest shadow-[0_0_20px_rgba(22,163,74,0.4)]"
               >
                 {t('battle.enter_arena')}
               </Button>
               
               {/* Open Battles List */}
               <div className="pt-4 border-t border-white/10">
                   <div className="flex items-center justify-between mb-3">
                       <h3 className="text-xs uppercase font-bold text-slate-500 flex items-center gap-2">
                           <Users className="w-3 h-3" />
                           {t('battle.open_battles')}
                       </h3>
                       <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchOpenBattles}>
                           <RefreshCw className={cn("w-3 h-3 text-slate-500", loadingBattles && "animate-spin")} />
                       </Button>
                   </div>
                   
                   <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                       {loadingBattles ? (
                           <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin mx-auto text-slate-600" /></div>
                       ) : openBattles.length > 0 ? (
                           openBattles.map(battle => (
                               <div key={battle.code} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                   <div>
                                       <p className="font-bold text-white text-sm">{battle.host_name.split('|')[1]}</p>
                                       <p className="text-xs text-slate-500 uppercase">{battle.difficulty}</p>
                                   </div>
                                   <Button 
                                       size="sm" 
                                       className="bg-white/10 hover:bg-white/20 text-white text-xs uppercase font-bold"
                                       onClick={() => handleJoinOpenBattle(battle.code)}
                                   >
                                       {t('battle.join_action')}
                                   </Button>
                               </div>
                           ))
                       ) : (
                           <div className="text-center py-4 text-xs text-slate-600 italic">
                               {t('battle.no_battles')}
                           </div>
                       )}
                   </div>
               </div>

               <Button onClick={() => setMode('menu')} variant="ghost" className="w-full text-slate-500 hover:text-white">{t('battle.back')}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-nba-blue animate-spin mx-auto mb-6" />
            <p className="uppercase font-heading font-bold tracking-widest text-lg animate-pulse text-nba-blue">
                {mode === 'create' ? t('battle.initializing') : t('battle.connecting')}
            </p>
        </div>
      )}
    </motion.div>
  )
}

function Spinner() {
    return <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
}
