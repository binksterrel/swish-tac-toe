"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { Sparkles, Trophy } from "lucide-react"
import { usePathname } from "next/navigation" 
import { Button } from "@/components/ui/button"

export function Header() {
  const { t } = useLanguage()
  const pathname = usePathname()

  return (
    <header className="bg-[#050505] border-b-4 border-nba-red relative z-40 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Logo Section - Broadcaster Style */}
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <div className="w-10 h-20 md:w-12 md:h-24 bg-white relative overflow-hidden rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {/* CSS-only NBA Logo Silhouette Approximation */}
                <div className="absolute inset-0 bg-nba-blue w-1/2 h-full skew-x-[-10deg] -ml-2"></div>
                <div className="absolute inset-0 bg-nba-red w-1/2 h-full left-1/2 skew-x-[-10deg] ml-2"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   {/* Minimalist Jerry West Silhouette using SVG path */}
                   <svg viewBox="0 0 50 100" className="w-full h-full text-white fill-current relative z-10" style={{ filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.2))' }}>
                     <path d="M25 20 C20 20 15 25 15 35 C15 45 35 45 35 55 L25 85" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" />
                     <circle cx="35" cy="55" r="4" fill="white" />
                   </svg>
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-4xl md:text-6xl font-heading font-bold italic tracking-tighter text-white uppercase leading-[0.85] drop-shadow-lg">
                  {t('landing.title_swish')}
                  <br/>
                  <span className="text-nba-blue">{t('landing.title_tac')}</span><span className="text-nba-red">{t('landing.title_toe')}</span>
                </h1>
              </div>
            </Link>

            {/* Navigation / Stats - Digital Look */}
            {/* MATCHS | STATS | CLASSEMENT | GEST | JOUEURS | CONNEXION */}
            <div className="hidden md:flex items-center gap-1 bg-gray-900/80 p-1 rounded-sm border border-gray-800">
               {[t('game.games'), t('game.stats'), t('game.standings')].map(item => (
                 <button key={item} className="px-4 py-2 text-sm font-bold uppercase text-gray-400 hover:text-white hover:bg-gray-800 transition-colors rounded-sm cursor-not-allowed opacity-50" title="Coming Soon">
                   {item}
                 </button>
               ))}
               
               {/* SWISH Link */}
               <Link href="/game">
                   <Button 
                       variant="ghost" 
                       size="sm"
                       className={`font-bold tracking-widest uppercase ${pathname === '/game' || pathname === '/' ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                   >
                       <Trophy className="w-4 h-4 mr-2 text-nba-blue" />
                       {t('game.swish')}
                   </Button>
               </Link>

               {/* GEST Link */}
               <Link href="/guess" className={`px-4 py-2 text-sm font-bold uppercase transition-colors rounded-sm flex items-center gap-2 border ${
                   pathname === '/guess' 
                   ? 'text-white bg-white/10 border-white/20' 
                   : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
               }`}>
                  <Sparkles className={`w-3 h-3 ${pathname === '/guess' ? 'text-white' : 'text-slate-400'}`} />
                  {t('game.gest')}
               </Link>

               {/* Players Link */}
               <Link href="/players" className={`px-4 py-2 text-sm font-bold uppercase transition-all rounded-sm shadow-sm flex items-center gap-2 border ${
                   pathname === '/players'
                   ? 'text-white bg-slate-800 border-blue-500'
                   : 'text-slate-400 bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white'
               }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pathname === '/players' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
                  {t('game.players_db')}
               </Link>
               
               <div className="w-px h-6 bg-gray-700 mx-2"></div>
               
               <button className="px-6 py-2 bg-nba-blue text-white text-sm font-bold uppercase rounded-sm hover:bg-blue-700 transition-colors shadow-lg">
                 {t('game.sign_in')}
               </button>
            </div>
          </div>
        </div>
    </header>
  )
}
