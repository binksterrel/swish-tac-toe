
"use client"

import { useState, useMemo } from "react"
import { ALL_NBA_PLAYERS, TEAM_CRITERIA, NBAPlayer } from "@/lib/nba-data"
import { PlayerCard } from "@/components/players/player-card"
import Link from "next/link"
import { Search, Filter, Home, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const ITEMS_PER_PAGE = 50;

export default function PlayersPage() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("ALL")
  const [decadeFilter, setDecadeFilter] = useState("ALL")
  const [page, setPage] = useState(1)

  // Filter players efficiently
  const filteredPlayers = useMemo(() => {
    return ALL_NBA_PLAYERS.filter((player) => {
      // 1. Name Match
      const nameMatch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
      if (!nameMatch) return false

      // 2. Team Match
      if (selectedTeam !== "ALL") {
        if (!player.teams.includes(selectedTeam)) return false
      }

      // 3. Decade Match
      if (decadeFilter !== "ALL") {
         if (!player.decades.includes(decadeFilter)) return false
      }

      return true
    })
  }, [searchTerm, selectedTeam, decadeFilter])

  // Pagination logic
  const displayedPlayers = useMemo(() => {
    return filteredPlayers.slice(0, page * ITEMS_PER_PAGE)
  }, [filteredPlayers, page])

  const hasMore = displayedPlayers.length < filteredPlayers.length

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  // Determine alphabetical teams for dropdown
  const sortedTeams = [...TEAM_CRITERIA].sort((a, b) => a.label.localeCompare(b.label))

  return (
    <div className="min-h-screen bg-black text-white font-roboto pb-20">
       
       {/* Top Navigation Bar */}
       <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                      <ArrowLeft className="w-6 h-6 text-slate-300" />
                  </Link>
                  <h1 className="text-xl md:text-2xl font-oswald font-bold uppercase tracking-wide text-white">
                      {t('players.title')} <span className="text-blue-500 font-mono text-sm ml-2 bg-blue-500/10 px-2 py-0.5 rounded-full">{filteredPlayers.length}</span>
                  </h1>
              </div>
          </div>
       </header>

       <main className="max-w-7xl mx-auto px-4 py-6">
           
           {/* Filters Section */}
           <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mb-8 w-full">
               <div className="flex flex-col md:flex-row gap-4">
                   
                   {/* Search Bar */}
                   <div className="flex-1 relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                       <input 
                          type="text" 
                          placeholder={t('players.search_placeholder')}
                          className="w-full bg-black border border-slate-700 text-white rounded-sm pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none placeholder:text-slate-600 uppercase font-bold tracking-tight"
                          value={searchTerm}
                          onChange={(e) => {
                              setSearchTerm(e.target.value)
                              setPage(1) // Reset pagination on search
                          }}
                       />
                   </div>

                   {/* Team Filter */}
                   <div className="w-full md:w-48 relative">
                       <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                       <select 
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-sm pl-10 pr-8 py-2 appearance-none cursor-pointer focus:border-blue-500 font-bold text-sm"
                          value={selectedTeam}
                          onChange={(e) => {
                              setSelectedTeam(e.target.value)
                              setPage(1)
                          }}
                       >
                           <option value="ALL">{t('players.filter_all_teams')}</option>
                           {sortedTeams.map(t => (
                               <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>
                           ))}
                       </select>
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                           <svg className="w-4 h-4 fill-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                       </div>
                   </div>

                   {/* Decade Filter */}
                   <div className="flex rounded-sm overflow-hidden border border-slate-700">
                       <button 
                           onClick={() => setDecadeFilter("ALL")}
                           className={`px-3 py-2 text-sm font-bold uppercase transition-colors ${decadeFilter === "ALL" ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                           ALL
                       </button>
                       {["1980s", "1990s", "2000s", "2010s", "2020s"].map((dec) => (
                           <button 
                               key={dec}
                               onClick={() => setDecadeFilter(dec)}
                               className={`px-3 py-2 text-sm font-bold uppercase transition-colors border-l border-slate-700 ${decadeFilter === dec ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                               {dec.slice(2)}
                           </button>
                       ))}
                   </div>

               </div>
           </div>

           {/* Results Grid */}
           {displayedPlayers.length > 0 ? (
               <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayedPlayers.map((player) => (
                        <PlayerCard key={player.id} player={player} />
                    ))}
                </div>
                
                {/* Load More Button */}
                {hasMore && (
                    <div className="flex justify-center mt-10">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-full border border-slate-600 uppercase tracking-widest transition-all transform hover:scale-105"
                        >
                            {t('players.load_more')}
                        </button>
                    </div>
                )}
               </>
           ) : (
               <div className="text-center py-20 text-slate-500">
                   <p className="text-2xl font-oswald uppercase">{t('players.no_results')}</p>
                   <p className="mt-2">{t('players.no_results_desc')}</p>
               </div>
           )}

       </main>
    </div>
  )
}
