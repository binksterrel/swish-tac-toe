"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Users, MoveRight, Loader2 } from "lucide-react"

interface BattleLobbyProps {
  onJoin: (code: string, name: string) => Promise<void>
  onCreate: (name: string) => Promise<void>
  isLoading: boolean
}

export function BattleLobby({ onJoin, onCreate, isLoading }: BattleLobbyProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [mode, setMode] = useState<'menu' | 'join' | 'create'>('menu')

  const handleCreate = () => {
    if (!name) return
    onCreate(name)
  }

  const handleJoin = () => {
    if (!name || !code) return
    onJoin(code, name)
  }

  return (
    <div className="max-w-md mx-auto w-full bg-black/50 border border-white/10 p-8 rounded-xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <Trophy className="w-12 h-12 text-nba-red mx-auto mb-4" />
        <h1 className="text-3xl font-heading font-bold italic uppercase">Battle Mode</h1>
        <p className="text-slate-400">Challenge a friend in real-time.</p>
      </div>

      {!isLoading ? (
        <>
          {mode === 'menu' && (
            <div className="space-y-4">
               <div className="mb-6">
                 <label className="text-xs uppercase font-bold text-slate-500 mb-2 block">Your Player Name</label>
                 <Input 
                    placeholder="Enter nickname..." 
                    className="bg-black/50 border-white/20 text-white text-center text-lg h-12"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                 />
               </div>
               
               <Button 
                 onClick={() => setMode('create')} 
                 className="w-full bg-nba-blue hover:bg-blue-700 h-14 text-lg font-bold uppercase tracking-widest disabled:opacity-50"
                 disabled={!name}
               >
                 Create Lobby
               </Button>
               <Button 
                 onClick={() => setMode('join')} 
                 variant="outline"
                 className="w-full border-white/20 hover:bg-white/10 h-14 text-lg font-bold uppercase tracking-widest disabled:opacity-50"
                 disabled={!name}
               >
                 Join Lobby
               </Button>
            </div>
          )}

          {mode === 'create' && (
             <div className="text-center animate-in fade-in">
                <Spinner />
                <p className="mt-4 text-sm text-slate-400">Creating stadium...</p>
                {/* Actually this state is transient, usually we just fire onCreate */}
                {/* But for UI flow, let's just trigger it immediately if button clicked above? 
                    Ah, re-using button. Let's make it explicit. */}
                 <div className="mt-4">
                   <Button onClick={handleCreate} className="w-full bg-nba-blue h-12 font-bold uppercase">Start Hosting</Button>
                   <Button onClick={() => setMode('menu')} variant="ghost" className="mt-2 w-full text-slate-500">Back</Button>
                 </div>
             </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4 animate-in slide-in-from-right-8">
               <div>
                 <label className="text-xs uppercase font-bold text-slate-500 mb-2 block">Lobby Code</label>
                 <Input 
                    placeholder="NBA-XXXX" 
                    className="bg-black/50 border-white/20 text-white text-center text-xl h-14 uppercase tracking-widest"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={8}
                 />
               </div>
               <Button onClick={handleJoin} className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold uppercase">
                 Enter Arena
               </Button>
               <Button onClick={() => setMode('menu')} variant="ghost" className="w-full text-slate-500">Back</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-nba-blue animate-spin mx-auto mb-4" />
            <p className="uppercase font-bold tracking-widest text-sm">Connecting...</p>
        </div>
      )}
    </div>
  )
}

function Spinner() {
    return <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
}
