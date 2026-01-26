"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useBattle } from "@/hooks/use-battle"
import { BattleGrid } from "@/components/battle/battle-grid"
import { PlayerInput } from "@/components/game/player-input" // Reusing
import { NBAPlayer } from "@/lib/nba-data"
import { Header } from "@/components/layout/header" // Adjusted import
import { Loader2, AlertTriangle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BattleRoom() {
    const params = useParams()
    const searchParams = useSearchParams()
    const code = params.code as string
    const roleParam = searchParams.get('role') as 'host' | 'guest'
    const nameParam = searchParams.get('name')
    
    const { state, role, setRole, submitMove, voteSkip } = useBattle(code, nameParam || "")
    const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null)
    const [copySuccess, setCopySuccess] = useState(false)

    useEffect(() => {
        if (roleParam) setRole(roleParam)
    }, [roleParam, setRole])

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    const handlePlayerSelect = (player: NBAPlayer) => {
        if (selectedCell) {
            submitMove(selectedCell.row, selectedCell.col, player)
            setSelectedCell(null)
        }
    }

    if (!role) return <div className="text-white">Invalid Access</div>

    if (!state) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2 uppercase font-bold">Connecting to Stadium...</span>
        </div>
    )

    // Waiting Room UI
    if (!state.players.guest && role === 'host') {
        return (
             <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                 <div className="max-w-md w-full text-center bg-gray-900/50 p-8 rounded-xl border border-white/10 animate-in zoom-in">
                    <h1 className="text-4xl font-heading uppercase italic mb-2">Lobby Ready</h1>
                    <p className="text-slate-400 mb-8">Share this code with your opponent</p>
                    
                    <div 
                        onClick={handleCopyCode}
                        className="bg-black border-2 border-nba-blue rounded-lg p-6 mb-4 cursor-pointer hover:bg-nba-blue/10 transition-colors group relative"
                    >
                        <div className="text-5xl font-mono font-bold tracking-[0.2em]">{code}</div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Share2 className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                    
                    {copySuccess && <p className="text-green-400 text-sm font-bold uppercase mb-4">Code Copied!</p>}
                    
                    <div className="flex items-center justify-center gap-2 text-slate-500 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs uppercase tracking-widest">Waiting for Player 2...</span>
                    </div>
                 </div>
             </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <BattleGrid 
                    state={state} 
                    role={role}
                    onCellClick={(r, c) => setSelectedCell({ row: r, col: c})}
                    selectedCell={selectedCell}
                    onVoteSkip={voteSkip}
                />
                
                {selectedCell && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-2xl">
                             <div className="flex justify-between items-center mb-4">
                                 <h3 className="uppercase font-bold">Select Player</h3>
                                 <Button variant="ghost" size="sm" onClick={() => setSelectedCell(null)}>
                                     Close
                                 </Button>
                             </div>
                             <PlayerInput 
                                onSubmit={handlePlayerSelect}
                                onCancel={() => setSelectedCell(null)}
                                usedPlayers={new Set(state.grid.flat().filter(c => c.player).map(c => c.player!.id))}
                                rowLabel="Battle"
                                colLabel="Mode"
                             />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
