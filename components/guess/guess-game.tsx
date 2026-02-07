"use client"

import { useState, useEffect } from "react"
import { NBAPlayer, getRandomNotablePlayer, getPlayerSuggestions } from "@/lib/nba-data"
import { TeamLogo } from "@/components/common/team-logo"
import { PlayerPhoto } from "@/components/common/player-photo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, ArrowRight, RotateCcw, Target, Sparkles, HelpCircle, Search, Flame } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function GuessGame() {
  const { t } = useLanguage()
  const [targetPlayer, setTargetPlayer] = useState<NBAPlayer | null>(null)
  const [guess, setGuess] = useState("")
  const [suggestions, setSuggestions] = useState<NBAPlayer[]>([])
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing")
  const [streak, setStreak] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Initialization - GUESS mode is casual, streak is session-only
  useEffect(() => {
    setMounted(true)
    startNewGame()
    // Note: Streak starts at 0 for each session (casual mode, not affecting OVR rating)
  }, [])

  // Note: GUESS mode does NOT record to database - it doesn't affect OVR rating/stats
  // Only saves to localStorage for history display

  const saveToLocalStorage = (score: number, correct: number, total: number) => {
      try {
          const historyItem = {
              score,
              correct,
              total,
              date: new Date().toISOString(),
              mode: 'GUESS', // Identify as Guess the Player game
              targetPlayer: targetPlayer?.name // For legacy detection
          }
          const saved = localStorage.getItem("nba-ttt-history")
          const history = saved ? JSON.parse(saved) : []
          const newHistory = [historyItem, ...history].slice(0, 50) // Keep last 50
          localStorage.setItem("nba-ttt-history", JSON.stringify(newHistory))
      } catch (e) {
          console.error("Failed to save to local storage", e)
      }
  }

  const startNewGame = () => {
    const newPlayer = getRandomNotablePlayer()
    setTargetPlayer(newPlayer)
    setGuess("")
    setSuggestions([])
    setStatus("playing")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGuess(value)
    if (value.length > 1) {
      setSuggestions(getPlayerSuggestions(value))
    } else {
      setSuggestions([])
    }
  }

  const handleGuess = (player: NBAPlayer) => {
    if (!targetPlayer) return

    if (player.id === targetPlayer.id) {
      setStatus("won")
      setStreak(s => s + 1)
      setErrorMessage(null)
      saveToLocalStorage(100, 1, 1) // 100 pts for win, 1/1 correct
    } else {
      setErrorMessage(t('gest.error_incorrect').replace('{name}', player.name))
      setGuess("")
      setSuggestions([])
      setTimeout(() => setErrorMessage(null), 2000)
    }
  }

  const handleGiveUp = () => {
    setStatus("lost")
    setStreak(0)
    saveToLocalStorage(0, 0, 1) // 0 pts, 0/1 correct
  }

  if (!mounted || !targetPlayer) return <div className="p-10 text-center text-slate-500 font-mono animate-pulse">{t('gest.loading')}</div>

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto font-sans relative z-10">
      
      {/* HEADER STATS STRIP */}
      <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-md border border-white/10 p-4 relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Flame className="w-20 h-20 text-orange-500" />
             </div>
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">{t('gest.streak')}</div>
                    <div className="text-3xl font-heading font-bold text-white leading-none">
                       {streak} <span className="text-sm text-slate-600 font-sans font-medium normal-case">victoires d&apos;affilée</span>
                    </div>
                </div>
             </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-md border border-white/10 p-4 flex items-center justify-between"
          >
             <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5 max-w-[150px] truncate">{t('gest.game_mode')}</div>
                <div className="text-xl font-heading font-bold text-white uppercase italic tracking-wide flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-purple-400" />
                   {t('gest.guess_the_player')}
                </div>
             </div>
             <Button 
                variant="outline" 
                size="sm"
                onClick={() => startNewGame()}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white uppercase text-[10px] font-bold tracking-widest h-8"
             >
                <RotateCcw className="w-3 h-3 mr-2" />
                {t('gest.skip')}
             </Button>
          </motion.div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CLUES (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          
          {/* TEAMS CARD */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden relative"
          >
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2 bg-gradient-to-r from-white/5 to-transparent">
               <Users className="w-4 h-4 text-nba-blue" />
               <h3 className="text-xs font-bold text-white uppercase tracking-widest">{t('gest.career_path')}</h3>
            </div>
            <div className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  {targetPlayer.teams.map((team, idx) => (
                    <motion.div 
                        key={`${team}-${idx}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + (idx * 0.1) }}
                        className="flex items-center gap-3"
                    >
                      {idx > 0 && <ArrowRight className="w-3 h-3 text-slate-700" />}
                      <div className="flex flex-col items-center gap-2 group cursor-default">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-center transition-all group-hover:border-nba-blue/50 group-hover:bg-nba-blue/10 group-hover:shadow-[0_0_15px_rgba(29,66,138,0.2)]">
                           <TeamLogo teamId={team} size={64} className="drop-shadow-md w-full h-full" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-white transition-colors">{team}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
             {/* AWARDS CARD */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden"
            >
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-gradient-to-r from-white/5 to-transparent">
                   <Trophy className="w-4 h-4 text-yellow-500" />
                   <h3 className="text-xs font-bold text-white uppercase tracking-widest">{t('gest.awards')}</h3>
                </div>
                <div className="p-4 min-h-[140px]">
                    <div className="flex flex-wrap gap-2">
                      {targetPlayer.awards.length > 0 ? (
                        targetPlayer.awards.map((award, i) => (
                          <Badge key={i} className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 text-yellow-500 border border-yellow-500/20 rounded-md uppercase text-[9px] font-bold tracking-wider px-2 py-1 shadow-sm">
                            {award}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-600 italic px-2">{t('gest.no_awards')}</span>
                      )}
                      
                      {targetPlayer.championYears && targetPlayer.championYears.length > 0 && (
                        <Badge className="bg-yellow-500 text-black font-bold border-none hover:bg-yellow-400 rounded-md uppercase text-[9px] tracking-wider px-2 py-1 shadow-lg shadow-yellow-500/20">
                          {targetPlayer.championYears.length}x {t('gest.champ')}
                        </Badge>
                      )}
                    </div>
                </div>
             </motion.div>

             {/* DETAILS CARD */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden"
             >
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 bg-gradient-to-r from-white/5 to-transparent">
                   <Target className="w-4 h-4 text-emerald-500" />
                   <h3 className="text-xs font-bold text-white uppercase tracking-widest">{t('gest.profile')}</h3>
                </div>
                <div className="p-4 space-y-4">
                   <div className="flex justify-between items-center text-sm border-b border-dashed border-white/10 pb-2">
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">{t('gest.position')}</span>
                      <span className="text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{targetPlayer.position}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm border-b border-dashed border-white/10 pb-2">
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">{t('gest.era')}</span>
                      <span className="text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded">{targetPlayer.decades[0]}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">{t('gest.origin')}</span>
                      <span className="text-white font-mono font-bold text-right text-xs bg-white/5 px-2 py-0.5 rounded truncate max-w-[100px]">
                         {targetPlayer.college && targetPlayer.college !== "None" ? targetPlayer.college : targetPlayer.country}
                      </span>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTION (5 cols) */}
        <div className="md:col-span-5 relative">
           <motion.div 
             layout
             className={cn(
                "h-full bg-black/40 backdrop-blur-xl border p-8 flex flex-col items-center justify-center relative transition-colors duration-500 overflow-hidden",
                status === 'won' ? 'border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.1)]' : 
                status === 'lost' ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.1)]' : 
                'border-white/10'
             )}
           >
              {/* Background Glow */}
              <div className={cn(
                  "absolute inset-0 opacity-20 bg-gradient-to-b pointer-events-none transition-all duration-700",
                  status === 'won' ? 'from-green-500/20 to-transparent' : 
                  status === 'lost' ? 'from-red-500/20 to-transparent' : 
                  'from-blue-500/10 to-transparent'
              )} />
              
              {/* STATUS BADGE */}
              <div className="absolute top-4 right-4 z-20">
                 {status === 'playing' && (
                     <span className="flex items-center gap-1.5 bg-nba-blue/10 text-nba-blue border border-nba-blue/30 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(29,66,138,0.4)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-nba-blue"></span>
                        {t('gest.guessing')}
                     </span>
                 )}
                 {status === 'won' && <span className="bg-green-500 text-black font-bold uppercase tracking-widest text-[9px] px-3 py-1 rounded-full shadow-lg shadow-green-500/30">{t('gest.correct')}</span>}
                 {status === 'lost' && <span className="bg-red-500 text-white font-bold uppercase tracking-widest text-[9px] px-3 py-1 rounded-full shadow-lg shadow-red-500/30">{t('gest.revealed')}</span>}
              </div>

              {status === 'playing' ? (
                <div className="w-full flex-1 flex flex-col justify-center items-center gap-8 relative z-10">
                  <div className="relative group cursor-help">
                      <div className="w-48 h-48 bg-gradient-to-br from-slate-900 to-black border-2 border-dashed border-white/20 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:border-white/40 transition-colors">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <HelpCircle className="w-16 h-16 text-slate-700 group-hover:text-slate-500 transition-colors duration-300" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                         {t('gest mystery player')}
                      </div>
                  </div>
                  
                  <div className="space-y-6 w-full max-w-xs">
                     <div className="text-center">
                        <h2 className="text-3xl font-heading font-bold text-white uppercase italic tracking-wide drop-shadow-lg">{t('gest.who_is')}</h2>
                        <p className="text-slate-400 text-xs font-medium mt-1">{t('gest.type_name')}</p>
                     </div>

                     <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            <Search className="w-4 h-4" />
                        </div>
                        <Input
                          placeholder={t('gest.placeholder') || "Rechercher un joueur..."}
                          value={guess}
                          onChange={handleSearchChange}
                          className="w-full pl-10 bg-black/50 border-white/10 text-white placeholder:text-slate-600 h-12 focus:border-nba-blue focus:ring-1 focus:ring-nba-blue/50 transition-all font-medium rounded-none"
                          autoFocus
                          autoComplete="off"
                        />
                        
                        <AnimatePresence>
                            {errorMessage && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -bottom-10 left-0 right-0 text-center"
                                >
                                    <span className="text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 border border-red-500/20 inline-block">
                                        {errorMessage}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {suggestions.length > 0 && (
                          <div className="absolute top-14 left-0 right-0 bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                            {suggestions.map(p => (
                              <div
                                key={p.id}
                                className="p-3 hover:bg-white/10 cursor-pointer text-sm flex items-center justify-between border-b border-white/5 last:border-0 group transition-colors"
                                onClick={() => handleGuess(p)}
                              >
                                <span className="font-bold text-slate-300 group-hover:text-white uppercase transition-colors">{p.name}</span>
                                <span className="text-[9px] font-mono text-slate-500 group-hover:text-nba-blue bg-white/5 px-1.5 py-0.5 border border-white/5 group-hover:border-nba-blue/30 transition-colors uppercase">{p.teams[p.teams.length - 1]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                     </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={handleGiveUp}
                    className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 text-[10px] h-8 uppercase tracking-widest w-full max-w-xs transition-colors"
                  >
                    {t('gest.give_up')}
                  </Button>
                </div>
              ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full flex-1 flex flex-col justify-center items-center gap-6 relative z-10"
                >
                  <div className={cn(
                      "w-56 h-56 overflow-hidden shadow-2xl relative group ring-4 ring-offset-4 ring-offset-black",
                      status === 'won' ? 'ring-green-500' : 'ring-red-500'
                  )}>
                    <PlayerPhoto
                      player={targetPlayer}
                      fill
                      className="object-cover bg-slate-200 transform group-hover:scale-105 transition-transform duration-700"
                    />
                     <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  </div>

                  <div className="text-center space-y-1">
                     <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">{t('gest.was')}</div>
                     <h2 className="text-4xl font-heading font-bold text-white uppercase italic leading-none drop-shadow-xl">
                        {targetPlayer.name}
                     </h2>
                  </div>

                  <div className="w-full max-w-xs pt-4 border-t border-white/10">
                      <Button
                        size="lg"
                        onClick={startNewGame}
                        className={cn(
                            "w-full font-heading font-bold uppercase tracking-widest text-sm h-12 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200",
                            status === 'won' 
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/40' 
                            : 'bg-nba-red hover:bg-red-600 text-white shadow-red-900/40'
                        )}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {t('gest.next')}
                      </Button>
                  </div>
                </motion.div>
              )}
           </motion.div>
        </div>
      </div>
    </div>
  )
}
