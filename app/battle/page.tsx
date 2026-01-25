"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BattleLobby } from "@/components/battle/battle-lobby"
import { Header } from "@/components/layout/header"

export default function BattlePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleCreate = async (name: string) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/battle/create', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hostName: name })
            })
            const data = await res.json()
            if (data.code) {
                // Redirect to room with state
                router.push(`/battle/${data.code}?role=host&name=${encodeURIComponent(name)}`)
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
                alert("Failed to join") // Better UI later
                setIsLoading(false)
            }
        } catch (e) {
            console.error(e)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white bg-[url('/grid-bg.svg')] bg-cover">
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
