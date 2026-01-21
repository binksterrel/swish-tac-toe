import { NBAGame } from "@/components/game/nba-game"
import { NBATicker } from "@/components/nba-ticker"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative flex flex-col font-sans">
      
      {/* 1. Official NBA Ticker */}
      <NBATicker />

      {/* 2. Broadcast Header */}
      <header className="bg-nba-black border-b-4 border-nba-red relative z-40 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Logo Section - Broadcaster Style */}
            <div className="flex items-center gap-4">
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
                  SWISH <span className="text-nba-red">TAC</span>
                  <br/>
                  <span className="text-4xl md:text-6xl text-white">TOE</span>
                </h1>
              </div>
            </div>

            {/* Navigation / Stats - Digital Look */}
            <div className="hidden md:flex items-center gap-1 bg-gray-900/80 p-1 rounded-sm border border-gray-800">
               {['Games', 'Stats', 'Standings'].map(item => (
                 <button key={item} className="px-4 py-2 text-sm font-bold uppercase text-gray-400 hover:text-white hover:bg-gray-800 transition-colors rounded-sm cursor-not-allowed opacity-50" title="Coming Soon">
                   {item}
                 </button>
               ))}
               <Link href="/players" className="px-4 py-2 text-sm font-bold uppercase text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-blue-500 transition-all rounded-sm shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Players DB
               </Link>
               <div className="w-px h-6 bg-gray-700 mx-2"></div>
               <button className="px-6 py-2 bg-nba-blue text-white text-sm font-bold uppercase rounded-sm hover:bg-blue-700 transition-colors shadow-lg">
                 Sign In
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Content Area - Technical Background */}
      <section className="flex-1 container mx-auto px-4 py-8 relative z-0">
        {/* Background Grid Lines affecting the pro feel */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50"></div>
        <NBAGame />
        
        {/* Data Disclaimer */}
        <div className="mt-8 text-center text-xs text-zinc-600 font-mono">
           <p>Données Joueurs & Stats : Saison 2023-2024</p>
           <p className="opacity-50 mt-1">Les rookies 2026 ne sont pas encore draftés dans cette base de données temporelle.</p>
        </div>
      </section>

      {/* Footer - Official Copyright Look */}
      <footer className="bg-black text-gray-500 py-8 border-t border-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-6 mb-6 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
          </div>
          <p className="text-[10px] md:text-xs font-mono">
            &copy; 2024 NBA MEDIA VENTURES, LLC. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </main>
  )
}
