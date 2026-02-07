"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BattleGrid } from "@/components/battle/battle-grid"
import { Header } from "@/components/layout/header"
import { NBATicker } from "@/components/layout/nba-ticker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocalBattle } from "@/hooks/use-local-battle"
import { PlayerInput } from "@/components/game/player-input"
import { NBAPlayer, NBA_TEAMS } from "@/lib/nba-data"
import { TeamLogo } from "@/components/common/team-logo"
import { Trophy, Users, ChevronLeft, ChevronRight, Swords, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export default function LocalBattlePage() {
    const router = useRouter()
    const { user, supabase } = useAuth()
    const { state, initLocalGame, submitMove, handleNextRound } = useLocalBattle()
    const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)

    // Setup State — P1 defaults from user profile
    const [p1Name, setP1Name] = useState(() =>
        user?.user_metadata?.username || user?.user_metadata?.full_name || ""
    )
    const [p2Name, setP2Name] = useState("")
    const [p1Team, setP1Team] = useState(() =>
        user?.user_metadata?.favorite_team || "LAL"
    )
    const [p2Team, setP2Team] = useState("BOS")

    // Hydrate P1 prefs from Supabase profile (fallback if metadata not yet loaded)
    useEffect(() => {
        if (!user) return
        let mounted = true
        supabase
            .from('profiles')
            .select('favorite_team, username')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                if (!mounted || !data) return
                setP1Name((prev: string) => prev || data.username || "")
                setP1Team((prev: string) => (prev === "LAL" && data.favorite_team) ? data.favorite_team : prev)
            })
        return () => { mounted = false }
    }, [user, supabase])
    const [difficulty, setDifficulty] = useState("medium")

    const teamKeys = Object.keys(NBA_TEAMS)

    const handleStart = () => {
        if (!p1Name || !p2Name) return
        initLocalGame(p1Name, p1Team, p2Name, p2Team, difficulty)
    }

    const handlePlayerSelect = (player: NBAPlayer) => {
        if (selectedCell) {
            submitMove(selectedCell.row, selectedCell.col, player)
            setSelectedCell(null)
        }
    }

    // Setup Screen
    if (!state) {
        return (
            <div className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
                <NBATicker />
                <Header />
                <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[70vh]">
                    <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden">
                        
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute left-4 top-4 text-slate-400 hover:text-white z-20"
                            onClick={() => router.push('/battle')}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>

                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 border border-white/10 mb-3">
                                <Swords className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-heading font-bold uppercase italic tracking-tighter text-white mb-1">
                                Local Arena
                            </h1>
                            <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">1 Écran • 2 Joueurs • Gloire Éternelle</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 items-center relative">
                            {/* VS Divider */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-xs font-black font-heading z-10 border-2 border-black hidden md:flex">
                                VS
                            </div>

                            {/* Player 1 */}
                            <div className="space-y-4 p-4 rounded-lg bg-nba-blue/10 border border-nba-blue/30 relative group">
                                <div className="absolute inset-0 bg-nba-blue/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                                <h3 className="text-nba-blue font-heading font-bold text-xl uppercase text-center">Joueur 1</h3>
                                
                                <div className="flex items-center justify-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                        const i = teamKeys.indexOf(p1Team); setP1Team(teamKeys[i-1] || teamKeys[teamKeys.length-1])
                                    }}><ChevronLeft className="w-4 h-4" /></Button>
                                    <TeamLogo teamId={p1Team} size={64} className="drop-shadow-md" />
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                        const i = teamKeys.indexOf(p1Team); setP1Team(teamKeys[i+1] || teamKeys[0])
                                    }}><ChevronRight className="w-4 h-4" /></Button>
                                </div>
                                <Input 
                                    placeholder="Nom du Joueur 1" 
                                    className="text-center bg-black/50 border-nba-blue/30 text-white font-bold h-10 text-sm"
                                    value={p1Name}
                                    onChange={e => setP1Name(e.target.value)}
                                />
                            </div>

                            {/* Player 2 */}
                            <div className="space-y-4 p-4 rounded-lg bg-nba-red/10 border border-nba-red/30 relative group">
                                <div className="absolute inset-0 bg-nba-red/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                                <h3 className="text-nba-red font-heading font-bold text-xl uppercase text-center">Joueur 2</h3>
                                
                                <div className="flex items-center justify-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                        const i = teamKeys.indexOf(p2Team); setP2Team(teamKeys[i-1] || teamKeys[teamKeys.length-1])
                                    }}><ChevronLeft className="w-4 h-4" /></Button>
                                    <TeamLogo teamId={p2Team} size={64} className="drop-shadow-md" />
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                        const i = teamKeys.indexOf(p2Team); setP2Team(teamKeys[i+1] || teamKeys[0])
                                    }}><ChevronRight className="w-4 h-4" /></Button>
                                </div>
                                <Input 
                                    placeholder="Nom du Joueur 2" 
                                    className="text-center bg-black/50 border-nba-red/30 text-white font-bold h-10 text-sm"
                                    value={p2Name}
                                    onChange={e => setP2Name(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Difficulty & Start */}
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="flex gap-1 bg-black/30 p-1 rounded border border-white/10">
                                {['easy', 'medium', 'hard'].map(d => (
                                    <button 
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className={cn(
                                            "px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all",
                                            difficulty === d ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-white"
                                        )}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>

                            <Button 
                                onClick={handleStart}
                                disabled={!p1Name || !p2Name}
                                className="w-full max-w-xs h-12 text-lg font-heading uppercase tracking-widest bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all transform hover:scale-105"
                            >
                                Commencer le Duel
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        )
    }

    // Game Interface
    return (
        <div className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
            <NBATicker />
            <Header />
            <div className="container mx-auto px-4 py-8">
                {/* 
                    L'astuce ici est de passer role={state.currentTurn} à BattleGrid. 
                    Comme ça, BattleGrid pense toujours que c'est le tour du "client local" courant, 
                    ce qui débloque les interactions. 
                */}
                <BattleGrid 
                    state={state} 
                    role={state.currentTurn as 'host' | 'guest'}
                    onCellClick={(r, c) => setSelectedCell({ row: r, col: c})}
                    selectedCell={selectedCell}
                    onVoteSkip={() => {}} // No skip vote in local (maybe pass turn?)
                    onNextRound={handleNextRound}
                />
                
                {selectedCell && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="uppercase font-bold">
                                        {state.currentTurn === 'host' ? state.players.host?.name : state.players.guest?.name}, Choisis!
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedCell(null)}>
                                        Fermer
                                    </Button>
                                </div>
                                <PlayerInput 
                                onSubmit={handlePlayerSelect}
                                onCancel={() => setSelectedCell(null)}
                                usedPlayers={new Set(state.grid.flat().filter(c => c.player).map(c => c.player!.id))}
                                rowLabel={state.criteria.rows[selectedCell.row]?.label || "Row"}
                                colLabel={state.criteria.cols[selectedCell.col]?.label || "Column"}
                                rowType={state.criteria.rows[selectedCell.row]?.type}
                                colType={state.criteria.cols[selectedCell.col]?.type}
                                />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
