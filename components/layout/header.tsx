"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Sparkles, Trophy, Swords, Menu, BarChart3, History, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function Header() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const { user, isLoading, signOut } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player'
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <header className="bg-[#050505] border-b-4 border-nba-red relative z-40 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-row items-center justify-between gap-6 w-full">

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
            <div className="hidden md:flex items-center gap-1 bg-gray-900/40 p-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                {/* MATCHS */}
                <Link href="/games" className={cn(
                    "px-4 py-2 text-xs font-bold uppercase transition-all rounded-md border flex items-center gap-2",
                    pathname === '/games'
                    ? "text-white bg-slate-800 border-white/20 shadow-lg"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                )}>
                    <History className={cn("w-3.5 h-3.5", pathname === '/games' ? "text-white" : "text-slate-500")} />
                    {t('game.games')}
                </Link>

                {/* STATS */}
                <Link href="/stats" className={cn(
                    "px-4 py-2 text-xs font-bold uppercase transition-all rounded-md border flex items-center gap-2",
                    pathname === '/stats'
                    ? "text-white bg-slate-800 border-nba-red shadow-[0_0_15px_rgba(201,8,42,0.2)]"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                )}>
                    <BarChart3 className={cn("w-3.5 h-3.5", pathname === '/stats' ? "text-nba-red" : "text-slate-500")} />
                    {t('game.stats')}
                </Link>

                {/* SWISH Link */}
                <Link href="/game" className={cn(
                    "px-4 py-2 text-xs font-bold uppercase transition-all rounded-md border flex items-center gap-2",
                    pathname === '/game' || pathname === '/'
                    ? "text-white bg-slate-800 border-nba-blue shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                )}>
                    <Trophy className={cn("w-3.5 h-3.5", (pathname === '/game' || pathname === '/') ? "text-nba-blue" : "text-slate-500")} />
                    {t('game.swish')}
                </Link>

                {/* GEST Link */}
                <Link href="/guess" className={cn(
                    "px-4 py-2 text-xs font-bold uppercase transition-all rounded-md border flex items-center gap-2",
                    pathname === '/guess'
                    ? "text-white bg-slate-800 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                )}>
                    <Sparkles className={cn("w-3.5 h-3.5", pathname === '/guess' ? "text-purple-400" : "text-slate-500")} />
                    {t('game.gest')}
                </Link>

                {/* BATTLE Link */}
                <Link href="/battle" className={cn(
                    "px-4 py-2 text-xs font-bold uppercase transition-all rounded-md border flex items-center gap-2",
                    pathname.startsWith('/battle')
                    ? "text-white bg-slate-800 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                )}>
                    <Swords className={cn("w-3.5 h-3.5", pathname.startsWith('/battle') ? "text-amber-500 animate-pulse" : "text-slate-500")} />
                    {t('battle.title')}
                </Link>

                {/* Players Link */}
                <Link href="/players" className={cn(
                    "px-4 py-2 text-xs font-bold uppercase transition-all rounded-md border flex items-center gap-2",
                    pathname === '/players'
                    ? "text-white bg-slate-800 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", pathname === '/players' ? "bg-green-500 animate-pulse" : "bg-slate-600")} />
                    {t('game.players_db')}
                </Link>

                <div className="w-px h-6 bg-white/10 mx-2"></div>

                {/* Desktop Auth Section */}
                {isLoading ? (
                  <div className="size-7 rounded-full bg-gray-700 animate-pulse" />
                ) : user ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar className="size-7">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-gray-800 text-white text-[10px] font-bold">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => signOut()}
                      className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                      title={t('game.sign_out')}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="px-3 py-1.5 text-xs font-bold uppercase text-slate-400 hover:text-white transition-colors">
                    {t('game.sign_in')}
                  </Link>
                )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Menu className="h-8 w-8" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#050505] border-l-4 border-nba-red text-white p-6 w-[300px] sm:w-[350px]">
                    <SheetHeader>
                        <SheetTitle className="text-left text-2xl font-heading font-bold italic tracking-tighter text-white uppercase mb-6 border-b border-white/10 pb-4">Menu</SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col gap-2">
                       <SheetClose asChild>
                         <Link href="/games" className={`px-4 py-3 text-lg font-bold uppercase transition-colors rounded-sm hover:text-white hover:bg-gray-800 flex items-center gap-3 ${pathname === '/games' ? 'text-white bg-gray-800' : 'text-gray-400'}`}>
                             <History className="w-5 h-5" />
                             {t('game.games')}
                         </Link>
                       </SheetClose>

                       <SheetClose asChild>
                         <Link href="/stats" className={`px-4 py-3 text-lg font-bold uppercase transition-colors rounded-sm hover:text-white hover:bg-gray-800 flex items-center gap-3 ${pathname === '/stats' ? 'text-white bg-gray-800' : 'text-gray-400'}`}>
                             <BarChart3 className="w-5 h-5" />
                             {t('game.stats')}
                         </Link>
                       </SheetClose>

                       <SheetClose asChild>
                         <Link href="/game" className={`px-4 py-3 text-lg font-bold uppercase transition-colors rounded-sm hover:text-white hover:bg-gray-800 ${pathname === '/game' || pathname === '/' ? 'text-white bg-gray-800' : 'text-gray-400'}`}>
                             <span className="flex items-center gap-3">
                                 <Trophy className="w-5 h-5" />
                                 {t('game.swish')}
                             </span>
                         </Link>
                       </SheetClose>

                       <SheetClose asChild>
                         <Link href="/guess" className={`px-4 py-3 text-lg font-bold uppercase transition-colors rounded-sm hover:text-white hover:bg-gray-800 ${pathname === '/guess' ? 'text-white bg-gray-800' : 'text-gray-400'}`}>
                             <span className="flex items-center gap-3">
                                 <Sparkles className="w-5 h-5" />
                                 {t('game.gest')}
                             </span>
                         </Link>
                       </SheetClose>

                       <SheetClose asChild>
                         <Link href="/battle" className={`px-4 py-3 text-lg font-bold uppercase transition-colors rounded-sm hover:text-white hover:bg-gray-800 ${pathname.startsWith('/battle') ? 'text-white bg-gray-800' : 'text-gray-400'}`}>
                             <span className="flex items-center gap-3 text-amber-500">
                                 <Swords className={cn("w-5 h-5", pathname.startsWith('/battle') && "animate-pulse")} />
                                 {t('battle.title')}
                             </span>
                         </Link>
                       </SheetClose>

                       <SheetClose asChild>
                         <Link href="/players" className={`px-4 py-3 text-lg font-bold uppercase transition-colors rounded-sm hover:text-white hover:bg-gray-800 ${pathname === '/players' ? 'text-white bg-gray-800' : 'text-gray-400'}`}>
                             {t('game.players_db')}
                         </Link>
                       </SheetClose>

                       <div className="h-px bg-gray-800 my-4"></div>

                       {/* Mobile Auth Section */}
                       {isLoading ? (
                         <div className="size-8 rounded-full bg-gray-700 animate-pulse mx-4" />
                       ) : user ? (
                         <div className="flex items-center justify-between px-4 py-3">
                           <div className="flex items-center gap-3 min-w-0">
                             <Avatar className="size-8 shrink-0">
                               <AvatarImage src={avatarUrl} alt={displayName} />
                               <AvatarFallback className="bg-gray-800 text-white text-xs font-bold">
                                 {displayName.slice(0, 2).toUpperCase()}
                               </AvatarFallback>
                             </Avatar>
                             <span className="text-sm font-bold text-white uppercase truncate">{displayName}</span>
                           </div>
                           <button
                             onClick={() => { signOut(); setSheetOpen(false) }}
                             className="p-2 text-gray-500 hover:text-red-400 rounded transition-colors"
                           >
                             <LogOut className="w-4 h-4" />
                           </button>
                         </div>
                       ) : (
                         <SheetClose asChild>
                           <Link href="/login" className="px-4 py-3 text-lg font-bold uppercase text-gray-400 hover:text-white transition-colors">
                             {t('game.sign_in')}
                           </Link>
                         </SheetClose>
                       )}
                    </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
    </header>
  )
}
