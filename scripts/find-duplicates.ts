const ALL_NBA_PLAYERS = require('../lib/players.json');

function getModernTeam(abbreviation: string): string {
  const mapping: Record<string, string> = {
    "SEA": "OKC",
    "NJN": "BKN",
    "NYN": "BKN",
    "SDC": "LAC",
    "BUF": "LAC",
    "KCK": "SAC",
    "KCO": "SAC",
    "CIN": "SAC",
    "ROC": "SAC",
    "SYR": "PHI",
    "SFW": "GSW",
    "PHL": "GSW",
    "STL": "ATL",
    "MLH": "ATL",
    "TRI": "ATL",
    "FTW": "DET",
    "MNL": "LAL",
    "NOH": "NOP",
    "NOK": "NOP",
    "CHA": "CHA", 
    "CHH": "CHA", 
    "WSB": "WAS",
    "CAP": "WAS",
    "BAL": "WAS",
    "CHZ": "WAS",
    "CHP": "WAS",
    "SDR": "HOU",
    "NOJ": "UTA",
    "VAN": "MEM",
  };
  return mapping[abbreviation] || abbreviation;
}

console.log("Checking for players with duplicate teams after normalization...");

ALL_NBA_PLAYERS.forEach((player: any) => {
    const modernTeams = player.teams.map((t: string) => getModernTeam(t));
    const seen = new Set();
    const duplicates = [];
    
    for (const team of modernTeams) {
        if (seen.has(team)) {
            duplicates.push(team);
        }
        seen.add(team);
    }
    
    if (duplicates.length > 0) {
        console.log(`Player: ${player.name} (${player.id})`);
        console.log(`  Original Teams: ${player.teams.join(", ")}`);
        console.log(`  Modern Teams:   ${modernTeams.join(", ")}`);
        console.log(`  Duplicates:     ${duplicates.join(", ")}`);
    }
});
