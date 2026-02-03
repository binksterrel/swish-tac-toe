"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { Header } from "@/components/layout/header"
import { NBATicker } from "@/components/layout/nba-ticker"

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans selection:bg-nba-red selection:text-white overflow-hidden">
      <NBATicker />
      <Header />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4">
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-nba-red/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-nba-blue/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 text-center animate-in fade-in zoom-in-95 duration-700">
        
        {/* Giant 404 */}
        <h1 className="text-[150px] md:text-[250px] font-heading font-black italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent select-none">
          404
        </h1>

        {/* Airball Badge */}
        <div className="relative -mt-10 mb-8 inline-block">
            <div className="px-6 py-2 bg-nba-red text-white uppercase font-heading font-bold italic text-2xl md:text-4xl tracking-widest transform -rotate-2 shadow-[0_0_30px_rgba(201,8,42,0.4)] border border-white/20">
                {t('notFound.title')}
            </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md mx-auto mb-10 leading-relaxed">
          {t('notFound.description')}
        </p>

        {/* Action Button */}
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-heading font-bold italic text-xl uppercase tracking-wider rounded transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          {t('notFound.button')}
        </Link>

      </div>
    </div>
  </div>
  )
}
