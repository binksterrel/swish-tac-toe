
const fs = require('fs');
const path = require('path');

const PLAYERS_PATH = path.join(__dirname, '../lib/players.json');
const players = require(PLAYERS_PATH);

function getModernTeam(abbreviation: string): string {
  const mapping: Record<string, string> = {
    "SEA": "OKC",
    "NJN": "BKN", "NYN": "BKN",
    "SDC": "LAC", "BUF": "LAC",
    "KCK": "SAC", "KCO": "SAC", "CIN": "SAC", "ROC": "SAC",
    "SYR": "PHI",
    "SFW": "GSW", "PHL": "GSW",
    "STL": "ATL", "MLH": "ATL", "TRI": "ATL",
    "FTW": "DET",
    "MNL": "LAL",
    "NOH": "NOP", "NOK": "NOP",
    "CHA": "CHA", "CHH": "CHA", 
    "WSB": "WAS", "CAP": "WAS", "BAL": "WAS", "CHZ": "WAS", "CHP": "WAS",
    "SDR": "HOU",
    "NOJ": "UTA",
    "VAN": "MEM",
  };
  return mapping[abbreviation] || abbreviation;
}

let changedCount = 0;

const cleanedPlayers = players.map((player: any) => {
    const originalTeams = [...player.teams];
    
    // Deduplicate while preferring modern codes if both modern and legacy are present
    const modernToOriginal: Record<string, string> = {};
    
    player.teams.forEach((t: string) => {
        const modern = getModernTeam(t);
        // If we haven't seen this franchise yet, or if the current code is already modern and we previously had a legacy one
        if (!modernToOriginal[modern] || t === modern) {
            modernToOriginal[modern] = t;
        }
    });
    
    const uniqueTeams = Object.values(modernToOriginal);
    
    if (uniqueTeams.length !== originalTeams.length) {
        changedCount++;
        return {
            ...player,
            teams: uniqueTeams
        };
    }
    
    return player;
});

console.log(`Cleaned ${changedCount} players.`);

fs.writeFileSync(PLAYERS_PATH, JSON.stringify(cleanedPlayers, null, 2));
console.log("Updated players.json successfully.");
