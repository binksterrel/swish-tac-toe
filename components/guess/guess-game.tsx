"use client"

import { useState, useEffect } from "react"
import { NBAPlayer, getRandomNotablePlayer, getPlayerSuggestions, getTeamLogoUrl, getPlayerPhotoUrl } from "@/lib/nba-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, ArrowRight, RotateCcw, HelpCircle } from "lucide-react"

export function GuessGame() {
  const [targetPlayer, setTargetPlayer] = useState<NBAPlayer | null>(null)
  const [guess, setGuess] = useState("")
  const [suggestions, setSuggestions] = useState<NBAPlayer[]>([])
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing")
  const [streak, setStreak] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Initialization - only run client-side to avoid hydration mismatch
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
      setErrorMessage(`❌ Non, ce n'est pas ${player.name}. Réessaie !`)
      setGuess("") 
      setSuggestions([])
      setTimeout(() => setErrorMessage(null), 2000)
    }
  }

  const handleGiveUp = () => {
    setStatus("lost")
    setStreak(0)
  }

  if (!mounted || !targetPlayer) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      {/* Header / Stats */}
      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg">
        <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          Gest Mode
        </h2>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Streak: {streak}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* LEFT COLUMN: CLUES */}
        <div className="space-y-6">
          {/* Active Teams Path */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Career Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                {targetPlayer.teams.map((team, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {idx > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                    <div className="flex flex-col items-center">
                        <img 
                            src={getTeamLogoUrl(team)} 
                            alt={team} 
                            className="w-10 h-10 object-contain drop-shadow-sm" 
                            title={team}
                        />
                        <span className="text-[10px] font-mono text-muted-foreground mt-1">{team}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Awards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {targetPlayer.awards.length > 0 ? (
                    targetPlayer.awards.map((award, i) => (
                        <Badge key={i} variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20">
                            {award}
                        </Badge>
                    ))
                ) : (
                    <span className="text-sm text-muted-foreground italic">No major awards</span>
                )}
                {targetPlayer.championYears && targetPlayer.championYears.length > 0 && (
                     <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                        {targetPlayer.championYears.length}x Champ
                     </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Extra Clues (Position / Decades) */}
           <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
               <div className="flex justify-between">
                   <span className="text-muted-foreground">Position:</span>
                   <span className="font-medium">{targetPlayer.position}</span>
               </div>
               <div className="flex justify-between">
                   <span className="text-muted-foreground">Draft/Start:</span>
                   <span className="font-medium">{targetPlayer.decades[0]} Era</span>
               </div>
               <div className="flex justify-between">
                   <span className="text-muted-foreground">College/Country:</span>
                   <span className="font-medium">{targetPlayer.college && targetPlayer.college !== "None" ? targetPlayer.college : targetPlayer.country}</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: GUESS AREA OR REVEAL */}
        <div className="space-y-6">
            <Card className={`h-full flex flex-col justify-center items-center p-6 text-center transition-all duration-500 ${status !== 'playing' ? 'bg-primary/5 ring-2 ring-primary' : ''}`}>
                {status === 'playing' ? (
                   <>
                        <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <span className="text-4xl">?</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Who is this player?</h3>
                        <p className="text-muted-foreground mb-6">Analyze the clues and guess!</p>
                        
                        {/* Error Message */}
                        {errorMessage && (
                          <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-md text-sm animate-in fade-in slide-in-from-top-2">
                            {errorMessage}
                          </div>
                        )}
                        
                        <div className="w-full relative max-w-xs mx-auto">
                            <Input 
                                placeholder="Type player name..." 
                                value={guess}
                                onChange={handleSearchChange}
                                className="text-center"
                                autoFocus
                            />
                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
                                    {suggestions.map(p => (
                                        <div 
                                            key={p.id}
                                            className="p-2 hover:bg-accent cursor-pointer text-sm flex items-center justify-between"
                                            onClick={() => handleGuess(p)}
                                        >
                                            <span>{p.name}</span>
                                            <span className="text-xs text-muted-foreground">{p.teams[p.teams.length-1]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button variant="ghost" className="mt-4 text-muted-foreground hover:text-destructive" onClick={handleGiveUp}>
                            Give Up
                        </Button>
                   </>
                ) : (
                    <>
                        {/* REVEAL STATE */}
                         <div className="w-40 h-40 mb-4 rounded-full overflow-hidden border-4 border-background shadow-xl">
                            <img 
                                src={getPlayerPhotoUrl(targetPlayer)} 
                                alt={targetPlayer.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <h3 className="text-3xl font-bold mb-2">{targetPlayer.name}</h3>
                        
                        {status === 'won' ? (
                            <Badge className="bg-green-500 hover:bg-green-600 text-lg px-4 py-1 mb-6">Correct! 🎉</Badge>
                        ) : (
                            <Badge variant="destructive" className="text-lg px-4 py-1 mb-6">Revealed</Badge>
                        )}

                        <Button size="lg" onClick={startNewGame} className="w-full max-w-xs gap-2">
                             <RotateCcw className="w-4 h-4" />
                             Play Next
                        </Button>
                    </>
                )}
            </Card>
        </div>
      </div>
    </div>
  )
}
