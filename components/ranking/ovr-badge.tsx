import { cn } from "@/lib/utils"

export function OvrBadge({ rating, className }: { rating: number, className?: string }) {
    const getTier = (ovr: number) => {
        if (ovr >= 95) return { label: 'G.O.A.T', color: 'text-purple-400', glow: 'shadow-purple-500/40', ring: 'stroke-purple-500' }
        if (ovr >= 90) return { label: 'LEGEND', color: 'text-amber-400', glow: 'shadow-amber-500/40', ring: 'stroke-amber-500' }
        if (ovr >= 85) return { label: 'ALL-STAR', color: 'text-cyan-400', glow: 'shadow-cyan-500/40', ring: 'stroke-cyan-400' }
        if (ovr >= 80) return { label: 'STAR', color: 'text-emerald-400', glow: 'shadow-emerald-500/40', ring: 'stroke-emerald-400' }
        if (ovr >= 75) return { label: 'PRO', color: 'text-blue-400', glow: 'shadow-blue-500/40', ring: 'stroke-blue-400' }
        return { label: 'ROOKIE', color: 'text-gray-400', glow: 'shadow-gray-500/20', ring: 'stroke-gray-500' }
    }

    const tier = getTier(rating)
    const radius = 46
    const circumference = 2 * Math.PI * radius
    const progress = Math.min(100, Math.max(0, rating))
    const dashOffset = circumference - (progress / 100) * circumference

    return (
        <div className={cn(
            "relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-lg border border-white/5 shadow-2xl transition-all duration-500 hover:scale-105 group",
            tier.glow,
            className
        )}>
             {/* Progress Ring SVG */}
             <div className="absolute inset-0 p-1">
                <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                     {/* Background Ring */}
                    <circle 
                        cx="50" cy="50" r={radius} 
                        className="stroke-white/5 fill-none" 
                        strokeWidth="4" 
                    />
                    {/* Active Ring */}
                     <circle 
                        cx="50" cy="50" r={radius} 
                        className={cn("fill-none transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]", tier.ring)}
                        strokeWidth="4" 
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                    />
                </svg>
             </div>

             {/* Inner Content */}
             <div className="flex flex-col items-center justify-center z-10 relative pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-[-5px] group-hover:text-white transition-colors">OVR</span>
                  <span className={cn(
                      "text-5xl md:text-6xl font-heading font-bold italic tracking-tighter tabular-nums drop-shadow-lg leading-none pr-1", 
                      tier.color
                  )}>
                      {rating}
                  </span>
                  <span className={cn("text-[9px] font-bold uppercase tracking-widest mt-[-2px] opacity-80 group-hover:opacity-100 transition-opacity", tier.color)}>
                      {tier.label}
                  </span>
             </div>
             
             {/* Gloss Reflection Top */}
             <div className="absolute inset-x-4 top-2 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-full opacity-50 pointer-events-none" />
        </div>
    )
}
