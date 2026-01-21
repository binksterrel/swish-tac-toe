
const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, '../lib/players.json');
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

// Transfers from Wikipedia 2023-2024
const WIKI_TRANSFERS = [
  {"player": "Damian Lillard", "team": "MIL"},
  {"player": "Jrue Holiday", "team": "BOS"},
  {"player": "Bradley Beal", "team": "PHX"},
  {"player": "Chris Paul", "team": "GSW"}, // Moved to SAS in 2024-25, but this is historical context
  {"player": "James Harden", "team": "LAC"},
  {"player": "Kristaps Porzingis", "team": "BOS"},
  {"player": "Marcus Smart", "team": "MEM"},
  {"player": "Jordan Poole", "team": "WAS"},
  {"player": "Pascal Siakam", "team": "IND"},
  {"player": "OG Anunoby", "team": "NYK"},
  {"player": "RJ Barrett", "team": "TOR"},
  {"player": "Immanuel Quickley", "team": "TOR"},
  {"player": "Fred VanVleet", "team": "HOU"},
  {"player": "Bruce Brown", "team": "IND"}, // Then TOR, but starts with IND
  {"player": "Deandre Ayton", "team": "POR"},
  {"player": "Jusuf Nurkic", "team": "PHX"},
  {"player": "Terry Rozier", "team": "MIA"},
  {"player": "Gordon Hayward", "team": "OKC"},
  {"player": "Buddy Hield", "team": "PHI"},
  {"player": "Max Strus", "team": "CLE"},
  {"player": "Gabe Vincent", "team": "LAL"},
  {"player": "Dennis Schroder", "team": "TOR"}, // Then BKN
  {"player": "John Collins", "team": "UTA"},
  {"player": "Grant Williams", "team": "DAL"}, // Then CHA
  {"player": "PJ Washington", "team": "DAL"},
  {"player": "Daniel Gafford", "team": "DAL"},
  {"player": "Dillon Brooks", "team": "HOU"},
  {"player": "Kelly Oubre Jr.", "team": "PHI"},
  {"player": "Christian Wood", "team": "LAL"},
  {"player": "Derrick Rose", "team": "MEM"}
];

// Helper to normalize names
function normalizeName(name) {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ (iii|ii|jr\.|sr\.)/g, '').trim();
}

let updatedCount = 0;
let notFound = [];

WIKI_TRANSFERS.forEach(transfer => {
    // Find player by normalized name
    let player = players.find(p => normalizeName(p.name) === normalizeName(transfer.player));
    
    // Fallback search
    if (!player && transfer.player === "Kristaps Porzingis") player = players.find(p => p.name.includes("Porzi"));
    
    if (player) {
         if (!player.teams.includes(transfer.team)) {
             console.log(`[UPDATE] ${player.name} -> Adding ${transfer.team}`);
             player.teams.push(transfer.team);
             updatedCount++;
         } else {
             console.log(`[SKIP] ${player.name} -> Already has ${transfer.team}`);
         }
    } else {
        notFound.push(transfer.player);
    }
});

fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));

console.log(`\n✅ Completed! Updated ${updatedCount} players.`);
if (notFound.length > 0) {
    console.log("⚠️ Players not found:");
    console.log(notFound.join(', '));
}
