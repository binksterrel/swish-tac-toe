"use client"

import { useState, useEffect } from "react"
import { NBAPlayer, ALL_NBA_PLAYERS } from "@/lib/nba-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayerCard } from "@/components/players/player-card"
import { useLanguage } from "@/contexts/language-context"
import { NBATicker } from "@/components/nba-ticker"
import { Header } from "@/components/header"

export default function PlayersPage() {
  const { t } = useLanguage()
  const [players, setPlayers] = useState<NBAPlayer[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<NBAPlayer[]>([])
  const [search, setSearch] = useState("")
  const [teamFilter, setTeamFilter] = useState("ALL")
  const [activeFilter, setActiveFilter] = useState("ALL") // ALL, ACTIVE, RETIRED
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const PLAYERS_PER_PAGE = 24

  // Get unique teams for filter
  const allTeams = Array.from(new Set(players.flatMap(p => p.teams))).sort()

  useEffect(() => {
    // Load players client-side to avoid hydration issues with large data
    // In a real app this would be an API call
    setPlayers(ALL_NBA_PLAYERS)
    setFilteredPlayers(ALL_NBA_PLAYERS)
  }, [])

  useEffect(() => {
    let result = players

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q))
    }

    // Team filter
    if (teamFilter !== "ALL") {
      result = result.filter(p => p.teams.includes(teamFilter))
    }

    // Decade filter
    if (activeFilter !== "ALL") {
      result = result.filter(p => p.decades && p.decades.includes(activeFilter))
    }

    setFilteredPlayers(result)
    setPage(1)
    setHasMore(result.length > PLAYERS_PER_PAGE)
  }, [search, teamFilter, activeFilter, players])

  const displayedPlayers = filteredPlayers.slice(0, page * PLAYERS_PER_PAGE)

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    setHasMore(filteredPlayers.length > nextPage * PLAYERS_PER_PAGE)
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <NBATicker />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase italic tracking-tighter mb-2">
              {t('players.title')}
            </h1>
            <p className="text-gray-400 font-mono text-sm">
              {filteredPlayers.length} {t('common.players')}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
             <Input 
               placeholder={t('players.search_placeholder')}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-gray-900 border-gray-700 w-full md:w-64"
             />

             <Select value={teamFilter} onValueChange={setTeamFilter}>
               <SelectTrigger className="w-full md:w-48 bg-gray-900 border-gray-700">
                 <SelectValue placeholder={t('players.filter_all_teams')} />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="ALL">{t('players.filter_all_teams')}</SelectItem>
                 {allTeams.map(team => (
                   <SelectItem key={team} value={team}>{team}</SelectItem>
                 ))}
               </SelectContent>
             </Select>

             <div className="bg-gray-900 p-1 rounded-md border border-gray-700 flex">
                {["ALL", "2020s", "2010s", "2000s", "1990s", "1980s"].map((decade) => (
                  <button 
                    key={decade}
                    onClick={() => setActiveFilter(decade)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors uppercase ${activeFilter === decade ? 'bg-nba-blue text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    {decade === "ALL" ? t('players.filter_all') : decade}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {displayedPlayers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedPlayers.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12 text-center">
                <Button 
                  onClick={loadMore}
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white uppercase font-bold tracking-widest"
                >
                  {t('players.load_more')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-gray-900/30 rounded-lg border border-gray-800 border-dashed">
            <h3 className="text-xl font-bold text-gray-500 mb-2">{t('players.no_results')}</h3>
            <p className="text-gray-600">{t('players.no_results_desc')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
