"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock, LogIn } from "lucide-react"

export function LoginRequired({ title = "Access Denied", message = "You must be signed in to view this page." }: { title?: string, message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-12 rounded-2xl max-w-md w-full relative overflow-hidden group">
        
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-nba-blue/10 to-nba-red/10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <Lock className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-2">{title}</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
                {message}
            </p>
            
            <Link href="/login" className="w-full">
                <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-wider h-12">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In to Continue
                </Button>
            </Link>
        </div>
      </div>
    </div>
  )
}
