"use client"

import { useState, useEffect } from "react"
import { NBAPlayer, ALL_NBA_PLAYERS, TEAM_CRITERIA, POSITION_CRITERIA, FAMOUS_PLAYER_IDS } from "@/lib/nba-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayerCard } from "@/components/players/player-card"
import { useLanguage } from "@/contexts/language-context"
import { NBATicker } from "@/components/layout/nba-ticker"
import { Header } from "@/components/layout/header"

export default function PlayersPage() {
  const { t } = useLanguage()
  const [players, setPlayers] = useState<NBAPlayer[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<NBAPlayer[]>([])
  const [search, setSearch] = useState("")
  const [teamFilter, setTeamFilter] = useState("ALL")
  const [positionFilter, setPositionFilter] = useState("ALL")
  const [activeFilter, setActiveFilter] = useState("ALL") // ALL, ACTIVE, RETIRED
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const PLAYERS_PER_PAGE = 24

  const TEAM_NAMES: Record<string, string> = {
    "ATL": "Atlanta Hawks",
    "BOS": "Boston Celtics",
    "BKN": "Brooklyn Nets",
    "CHA": "Charlotte Hornets",
    "CHI": "Chicago Bulls",
    "CLE": "Cleveland Cavaliers",
    "DAL": "Dallas Mavericks",
    "DEN": "Denver Nuggets",
    "DET": "Detroit Pistons",
    "GSW": "Golden State Warriors",
    "HOU": "Houston Rockets",
    "IND": "Indiana Pacers",
    "LAC": "Los Angeles Clippers",
    "LAL": "Los Angeles Lakers",
    "MEM": "Memphis Grizzlies",
    "MIA": "Miami Heat",
    "MIL": "Milwaukee Bucks",
    "MIN": "Minnesota Timberwolves",
    "NOP": "New Orleans Pelicans",
    "NYK": "New York Knicks",
    "OKC": "Oklahoma City Thunder",
    "ORL": "Orlando Magic",
    "PHI": "Philadelphia 76ers",
    "PHX": "Phoenix Suns",
    "POR": "Portland Trail Blazers",
    "SAC": "Sacramento Kings",
    "SAS": "San Antonio Spurs",
    "TOR": "Toronto Raptors",
    "UTA": "Utah Jazz",
    "WAS": "Washington Wizards"
  }

  useEffect(() => {
    // Load players client-side to avoid hydration issues with large data
    // In a real app this would be an API call
    const sorted = [...ALL_NBA_PLAYERS].sort((a, b) => {
      const indexA = FAMOUS_PLAYER_IDS.indexOf(a.id);
      const indexB = FAMOUS_PLAYER_IDS.indexOf(b.id);

      // 1. Famous players first (in specific order)
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // 2. Players with photos (nbaId) first
      const hasPhotoA = !!a.nbaId;
      const hasPhotoB = !!b.nbaId;
      if (hasPhotoA && !hasPhotoB) return -1;
      if (!hasPhotoA && hasPhotoB) return 1;

      // 3. Alphabetical
      return a.name.localeCompare(b.name);
    });

    setPlayers(sorted)
    setFilteredPlayers(sorted)
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

    // Position filter (Loose Match: "PG" matches "PG" and "PG-SG")
    if (positionFilter !== "ALL") {
        result = result.filter(p => p.position && p.position.includes(positionFilter))
    }

    // Decade filter
    if (activeFilter !== "ALL") {
      result = result.filter(p => p.decades && p.decades.includes(activeFilter))
    }

    setFilteredPlayers(result)
    setPage(1)
    setHasMore(result.length > PLAYERS_PER_PAGE)
  }, [search, teamFilter, positionFilter, activeFilter, players])

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
                    {TEAM_CRITERIA.sort((a, b) => (TEAM_NAMES[a.value] || a.value).localeCompare(TEAM_NAMES[b.value] || b.value)).map(team => (
                      <SelectItem key={team.value} value={team.value}>
                       {TEAM_NAMES[team.value] || `${team.value} - ${team.label}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger className="w-full md:w-32 bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Positions</SelectItem>
                    {POSITION_CRITERIA.map(pos => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label} ({pos.value})
                      </SelectItem>
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
