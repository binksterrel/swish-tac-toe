"use client"

import { useState, useEffect } from "react"
import { NBAPlayer, getRandomNotablePlayer, getPlayerSuggestions, getTeamLogoUrl, getPlayerPhotoUrl } from "@/lib/nba-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Trophy, Users, ArrowRight, RotateCcw, Target } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function GuessGame() {
  const { t } = useLanguage()
  const [targetPlayer, setTargetPlayer] = useState<NBAPlayer | null>(null)
  const [guess, setGuess] = useState("")
  const [suggestions, setSuggestions] = useState<NBAPlayer[]>([])
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing")
  const [streak, setStreak] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Initialization
  useEffect(() => {
    setMounted(true)
    startNewGame()
  }, [])

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
  }

  if (!mounted || !targetPlayer) return <div className="p-10 text-center text-slate-500 font-mono">{t('gest.loading')}</div>

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* HEADER STATS STRIP - Matches ScorePanel style */}
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-16 h-16 text-yellow-500" />
             </div>
             <div className="relative z-10">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{t('gest.streak')}</div>
                <div className="text-4xl font-oswald font-bold text-white flex items-center gap-2">
                   <span className="text-yellow-500">{streak}</span>
                </div>
             </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-4 flex items-center justify-between">
             <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{t('gest.game_mode')}</div>
                <div className="text-xl font-oswald font-bold text-white uppercase italic">
                   {t('gest.guess_the_player')}
                </div>
             </div>
             <Button 
                variant="outline" 
                size="sm"
                onClick={() => startNewGame()}
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white uppercase text-xs font-bold tracking-wider"
             >
                <RotateCcw className="w-3 h-3 mr-2" />
                {t('gest.skip')}
             </Button>
          </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CLUES (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          
          {/* TEAMS CARD - The primary clue */}
          <div className="bg-slate-900 border border-slate-800 relative overflow-hidden group">
            <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
               <Users className="w-4 h-4 text-blue-500" />
               <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{t('gest.career_path')}</h3>
            </div>
            <div className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  {targetPlayer.teams.map((team, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {idx > 0 && <ArrowRight className="w-4 h-4 text-slate-600" />}
                      <div className="flex flex-col items-center gap-2 group/team">
                        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-sm p-2 flex items-center justify-center transition-all group-hover/team:border-blue-500/50 group-hover/team:bg-blue-500/5">
                           <img 
                            src={getTeamLogoUrl(team)} 
                            alt={team} 
                            className="w-full h-full object-contain transition-all duration-300" 
                           />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 group-hover/team:text-blue-400 transition-colors">{team}</span>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* AWARDS CARD */}
             <div className="bg-slate-900 border border-slate-800">
                <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                   <Trophy className="w-4 h-4 text-yellow-500" />
                   <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{t('gest.awards')}</h3>
                </div>
                <div className="p-4 min-h-[120px]">
                    <div className="flex flex-wrap gap-2">
                      {targetPlayer.awards.length > 0 ? (
                        targetPlayer.awards.map((award, i) => (
                          <Badge key={i} className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 rounded-sm uppercase text-[10px] px-2 py-1">
                            {award}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-slate-600 italic">{t('gest.no_awards')}</span>
                      )}
                      
                      {targetPlayer.championYears && targetPlayer.championYears.length > 0 && (
                        <Badge className="bg-yellow-500 text-black font-bold border-none hover:bg-yellow-400 rounded-sm uppercase text-[10px] px-2 py-1">
                          {targetPlayer.championYears.length}x {t('gest.champ')}
                        </Badge>
                      )}
                    </div>
                </div>
             </div>

             {/* DETAILS CARD */}
             <div className="bg-slate-900 border border-slate-800">
                <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                   <Target className="w-4 h-4 text-emerald-500" />
                   <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{t('gest.profile')}</h3>
                </div>
                <div className="p-4 space-y-3 min-h-[120px]">
                   <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500">{t('gest.position')}</span>
                      <span className="text-white font-mono">{targetPlayer.position}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                      <span className="text-slate-500">{t('gest.era')}</span>
                      <span className="text-white font-mono">{targetPlayer.decades[0]}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{t('gest.draft_origin')}</span>
                      <span className="text-white font-mono truncate max-w-[100px] text-right">
                         {targetPlayer.college && targetPlayer.college !== "None" ? targetPlayer.college : targetPlayer.country}
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTION (5 cols) */}
        <div className="md:col-span-5">
           <div className={`h-full bg-slate-900 border-2 rounded-sm p-6 flex flex-col items-center justify-center relative ${
             status === 'won' ? 'border-green-500' : status === 'lost' ? 'border-red-500' : 'border-slate-800'
           }`}>
              
              {/* STATUS INDICATOR (like LIVE/FINAL badge) */}
              <div className="absolute top-4 right-4">
                 {status === 'playing' && <span className="bg-blue-500/10 text-blue-500 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-sm animate-pulse">{t('gest.guessing')}</span>}
                 {status === 'won' && <span className="bg-green-500 text-black font-bold px-2 py-0.5 rounded-sm">{t('gest.correct')}</span>}
                 {status === 'lost' && <span className="bg-red-500 text-white font-bold px-2 py-0.5 rounded-sm">{t('gest.revealed')}</span>}
              </div>

              {status === 'playing' ? (
                <div className="w-full flex-1 flex flex-col justify-center items-center gap-8">
                  <div className="w-40 h-40 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden">
                     <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                     <span className="text-6xl font-oswald text-slate-700">?</span>
                  </div>
                  
                  <div className="space-y-4 w-full">
                     <div className="text-center">
                        <h2 className="text-2xl font-oswald font-bold text-white uppercase italic tracking-wide">{t('gest.who_is')}</h2>
                        <p className="text-slate-500 text-xs mt-1">{t('gest.type_name')}</p>
                     </div>

                     {errorMessage && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-3 py-2 text-center rounded-sm font-bold">
                           {errorMessage}
                        </div>
                     )}

                     <div className="relative">
                        <Input
                          placeholder={t('gest.placeholder')}
                          value={guess}
                          onChange={handleSearchChange}
                          className="w-full bg-black border-slate-700 text-white text-center uppercase font-bold tracking-widest h-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm"
                          autoFocus
                          autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-slate-900 border border-slate-700 shadow-xl z-50 mt-1 max-h-60 overflow-y-auto">
                            {suggestions.map(p => (
                              <div
                                key={p.id}
                                className="p-3 hover:bg-slate-800 cursor-pointer text-sm flex items-center justify-between border-b border-slate-800 last:border-0 group"
                                onClick={() => handleGuess(p)}
                              >
                                <span className="font-bold text-slate-300 group-hover:text-white uppercase transition-colors">{p.name}</span>
                                <span className="text-[10px] font-mono text-slate-600 group-hover:text-blue-400 bg-black/30 px-1.5 py-0.5 rounded-sm">{p.teams[p.teams.length - 1]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                     </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={handleGiveUp}
                    className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 text-xs uppercase tracking-widest w-full"
                  >
                    {t('gest.give_up')}
                  </Button>
                </div>
              ) : (
                <div className="w-full flex-1 flex flex-col justify-center items-center gap-6 animate-in zoom-in-95 duration-300">
                  <div className={`w-48 h-48 rounded-sm overflow-hidden border-4 shadow-2xl relative ${status === 'won' ? 'border-green-500' : 'border-red-500'}`}>
                    <img
                      src={getPlayerPhotoUrl(targetPlayer)}
                      alt={targetPlayer.name}
                      className="w-full h-full object-cover bg-slate-200"
                    />
                     {/* Overlay Gradient for Text Readability if needed */}
                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>

                  <div className="text-center">
                     <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">{t('gest.was')}</div>
                     <h2 className="text-3xl font-oswald font-bold text-white uppercase italic leading-none">
                        {targetPlayer.name}
                     </h2>
                  </div>

                  <div className="w-full pt-4 border-t border-slate-800">
                      <Button
                        size="lg"
                        onClick={startNewGame}
                        className={`w-full font-heading uppercase tracking-widest text-sm h-12 shadow-lg ${
                            status === 'won' 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-nba-red hover:bg-red-700 text-white'
                        }`}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {t('gest.next')}
                      </Button>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
