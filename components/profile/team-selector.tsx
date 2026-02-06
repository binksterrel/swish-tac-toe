import { NBA_TEAMS } from "@/lib/nba-data"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TeamSelectorProps {
    value: string | null
    onChange: (teamId: string) => void
}

export function TeamSelector({ value, onChange }: TeamSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const sortedTeams = Object.entries(NBA_TEAMS).sort((a, b) => a[1].city.localeCompare(b[1].city))

    const selectedTeam = value ? NBA_TEAMS[value] : null

    return (
        <div className="relative">
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-14 rounded-xl border flex items-center justify-between px-4 transition-all duration-300",
                    isOpen ? "border-white/40 bg-white/10" : "border-white/10 bg-black/40 hover:border-white/20"
                )}
            >
                {selectedTeam ? (
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center p-1 bg-white">
                             <img src={`https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${value?.toLowerCase() === 'uta' ? 'utah' : value?.toLowerCase() === 'nop' ? 'no' : value?.toLowerCase() === 'nyk' ? 'ny' : value?.toLowerCase() === 'sas' ? 'sa' : value?.toLowerCase() === 'gsw' ? 'gs' : value?.toLowerCase() === 'phx' ? 'phx' : value?.toLowerCase() === 'bkn' ? 'bkn' : value?.toLowerCase() === 'was' ? 'wsh' : value?.toLowerCase()}.png`} alt={selectedTeam.name} className="w-full h-full object-contain" />
                         </div>
                         <div className="text-left">
                             <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{selectedTeam.city}</div>
                             <div className="font-bold text-white leading-none">{selectedTeam.name}</div>
                         </div>
                    </div>
                ) : (
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Select Favorite Team</span>
                )}
                <ChevronDown className={cn("w-5 h-5 text-gray-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-16 left-0 right-0 h-64 overflow-y-auto bg-[#0a0a0a] border border-white/20 rounded-xl z-50 p-2 shadow-2xl scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent grid grid-cols-1 md:grid-cols-2 gap-1"
                    >
                        {sortedTeams.map(([id, team]) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => {
                                    onChange(id)
                                    setIsOpen(false)
                                }}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-white/10 text-left group",
                                    value === id && "bg-nba-blue/20 border border-nba-blue/30"
                                )}
                            >
                                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm">
                                      <img src={`https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${id.toLowerCase() === 'uta' ? 'utah' : id.toLowerCase() === 'nop' ? 'no' : id.toLowerCase() === 'nyk' ? 'ny' : id.toLowerCase() === 'sas' ? 'sa' : id.toLowerCase() === 'gsw' ? 'gs' : id.toLowerCase() === 'phx' ? 'phx' : id.toLowerCase() === 'bkn' ? 'bkn' : id.toLowerCase() === 'was' ? 'wsh' : id.toLowerCase()}.png`} alt={team.name} className="w-full h-full object-contain" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="text-[10px] text-gray-500 font-bold uppercase group-hover:text-gray-300">{team.city}</div>
                                     <div className={cn("text-xs font-bold text-gray-300 group-hover:text-white", value === id && "text-white")}>{team.name}</div>
                                 </div>
                                 {value === id && <Check className="w-4 h-4 text-nba-blue" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
