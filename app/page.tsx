"use client"

import Link from "next/link"
import { NBATicker } from "@/components/nba-ticker"
import { Trophy, Grid3x3, Users, Play, Star, Sparkles, ChevronRight, Activity } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function LandingPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative overflow-hidden selection:bg-nba-red selection:text-white">
      
      {/* Ticker - Fixed Top */}
      <div className="relative z-50 border-b border-white/10">
        <NBATicker />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {/* Hexagon Mesh Pattern */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         
         {/* Glowing Orbs */}
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-nba-blue/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-nba-red/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
         
         {/* Tactical Lines (Court Drawing) */}
         <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-[0.02] stroke-white" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="20" strokeWidth="0.5" />
            <path d="M10,50 L90,50" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="40" strokeWidth="0.5" strokeDasharray="4 4" />
         </svg>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-10 lg:py-20">
        
        {/* Badge - Daily Status */}
        <div className="animate-in fade-in slide-in-from-top-8 duration-700 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
               <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
               </span>
               <span className="text-xs font-bold uppercase tracking-wider text-green-400">{t('landing.active_grid')}</span>
            </div>
        </div>

        {/* Hero Title */}
        <div className="text-center mb-12 relative animate-in zoom-in-95 duration-1000">
             <h1 className="text-6xl md:text-9xl font-heading font-black italic tracking-tighter uppercase leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl">
              {t('landing.title_swish')}<br/>
              <span className="text-nba-blue">{t('landing.title_tac')}</span><span className="text-nba-red">{t('landing.title_toe')}</span>
             </h1>
             
             <p className="mt-8 text-lg md:text-2xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
               {t('landing.subtitle_1')} <span className="text-white font-bold">{t('landing.subtitle_2')}</span> <span className="text-white font-bold">{t('landing.subtitle_3')}</span>
               <br/><span className="text-sm md:text-base opacity-60 uppercase tracking-widest mt-2 block">{t('landing.description')}</span>
             </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-5 w-full max-w-2xl animate-in slide-in-from-bottom-8 duration-700 delay-200">
          
          <Link href="/game" className="flex-1 group relative overflow-hidden rounded-lg bg-nba-red transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(201,8,42,0.6)] border border-nba-red">
             
             {/* Shine Effect */}
             <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                <div className="animate-shine h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
             </div>

             <div className="relative h-full bg-black/10 hover:bg-transparent transition-colors rounded-lg flex items-center justify-between p-1">
               <div className="flex-1 h-full rounded-md p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform backdrop-blur-sm">
                        <Play className="w-8 h-8 text-white fill-current" />
                     </div>
                     <div className="text-left">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/80 mb-1">{t('landing.play_sub')}</div>
                        <div className="text-4xl font-heading font-bold italic text-white drop-shadow-md">{t('common.play')}</div>
                     </div>
                  </div>
                  <ChevronRight className="w-8 h-8 text-white/70 group-hover:text-white group-hover:translate-x-2 transition-all" />
               </div>
             </div>
          </Link>

          <Link href="/players" className="flex-1 group relative">
             <div className="relative h-full bg-slate-900/50 border border-slate-800 hover:border-slate-600 rounded-lg p-1 transition-all hover:bg-slate-800">
               <div className="h-full rounded-md p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="bg-slate-800 p-3 rounded-full border border-slate-700">
                        <Users className="w-8 h-8 text-slate-300" />
                     </div>
                     <div className="text-left">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1">{t('landing.players_sub')}</div>
                        <div className="text-4xl font-heading font-bold italic text-slate-200">{t('common.players')}</div>
                     </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <Activity className="w-5 h-5 text-slate-400" />
                  </div>
               </div>
             </div>
          </Link>

        </div>



        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl animate-in fade-in duration-1000 delay-300">
            
            {/* Card 1 */}
            <div className="group p-6 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-nba-blue/50 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-black border border-white/10 flex items-center justify-center mb-4 group-hover:bg-nba-blue group-hover:border-nba-blue transition-colors">
                   <Grid3x3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading uppercase mb-2">{t('landing.feature_1_title')}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t('landing.feature_1_desc')}</p>
            </div>

            {/* Card 2 */}
            <div className="group p-6 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-purple-500/50 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-black border border-white/10 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:border-purple-600 transition-colors">
                   <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading uppercase mb-2">{t('landing.feature_2_title')}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t('landing.feature_2_desc')}</p>
            </div>

            {/* Card 3 */}
            <div className="group p-6 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-nba-red/50 transition-all hover:-translate-y-1">
                 <div className="w-12 h-12 rounded-lg bg-black border border-white/10 flex items-center justify-center mb-4 group-hover:bg-nba-red group-hover:border-nba-red transition-colors">
                   <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold font-heading uppercase mb-2">{t('landing.feature_3_title')}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t('landing.feature_3_desc')}</p>
            </div>

        </div>

      </div>

      {/* Modern Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 bg-black/80 backdrop-blur-xl text-center">
         <div className="flex items-center justify-center gap-6 mb-4 opacity-50">
             <div className="h-px w-12 bg-white/20"></div>
             <Trophy className="w-4 h-4" />
             <div className="h-px w-12 bg-white/20"></div>
         </div>
         <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
            &copy; 2024 SWISH TAC TOE • {t('landing.footer')}
         </p>
      </footer>

    </main>
  )
}
