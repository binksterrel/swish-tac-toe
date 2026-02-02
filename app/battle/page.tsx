"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BattleLobby } from "@/components/battle/battle-lobby"
import { Header } from "@/components/layout/header"
import { NBATicker } from "@/components/layout/nba-ticker"
import { toast } from "sonner"

export default function BattlePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = async (name: string, difficulty: string) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/battle/create', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hostName: name, difficulty })
            })
            const data = await res.json()
            if (data.code) {
                // Save state to localStorage so we can load it in the room (since we don't have a DB)
                // The Host becomes the "Source of Truth" for this session
                localStorage.setItem(`battle_state_${data.code}`, JSON.stringify(data))
                
                // Redirect to room
                router.push(`/battle/${data.code}?role=host&name=${encodeURIComponent(name)}`)
            } else {
                console.error("Creation failed:", data)
                setIsLoading(false)
            }
        } catch (e) {
            console.error(e)
            setIsLoading(false)
        }
    }

    const handleJoin = async (code: string, name: string) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/battle/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, name })
            })
            const data = await res.json()
            if (data.success) {
                 router.push(`/battle/${code}?role=guest&name=${encodeURIComponent(name)}`)
            } else {
                toast.error("Impossible de rejoindre la partie. Code invalide ou partie pleine.") 
                setIsLoading(false)
            }
        } catch (e) {
            console.error(e)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
             <NBATicker />
             <Header />
             <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
                 <BattleLobby 
                    onCreate={handleCreate} 
                    onJoin={handleJoin} 
                    isLoading={isLoading} 
                 />
             </div>
        </div>
    )
}
