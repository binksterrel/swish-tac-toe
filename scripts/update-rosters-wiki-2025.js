
const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, '../lib/players.json');
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

// Transfers from Wikipedia 2024-2025
const WIKI_TRANSFERS = [
  {"player": "Josh Giddey", "team": "CHI"},
  {"player": "Alex Caruso", "team": "OKC"},
  {"player": "Dejounte Murray", "team": "NOP"},
  {"player": "Mikal Bridges", "team": "NYK"},
  {"player": "Paul George", "team": "PHI"},
  {"player": "Klay Thompson", "team": "DAL"},
  {"player": "Chris Paul", "team": "SAS"},
  {"player": "DeMar DeRozan", "team": "SAC"},
  {"player": "Karl-Anthony Towns", "team": "NYK"},
  {"player": "Julius Randle", "team": "MIN"},
  {"player": "Donte DiVincenzo", "team": "MIN"},
  {"player": "Jimmy Butler", "team": "GSW"},
  {"player": "Luka Dončić", "team": "LAL"},
  {"player": "Anthony Davis", "team": "DAL"},
  {"player": "De'Aaron Fox", "team": "SAS"},
  {"player": "Zach LaVine", "team": "SAC"},
  {"player": "Brandon Ingram", "team": "TOR"},
  {"player": "Khris Middleton", "team": "WAS"},
  {"player": "Kyle Kuzma", "team": "MIL"},
  {"player": "Andrew Wiggins", "team": "MIA"},
  {"player": "D'Angelo Russell", "team": "BKN"},
  {"player": "Ben Simmons", "team": "LAC"},
  {"player": "Jonas Valančiūnas", "team": "SAC"},
  {"player": "Buddy Hield", "team": "GSW"},
  {"player": "Kentavious Caldwell-Pope", "team": "ORL"},
  {"player": "Isaiah Hartenstein", "team": "OKC"},
  {"player": "Tobias Harris", "team": "DET"},
  {"player": "Deni Avdija", "team": "POR"},
  {"player": "Malcolm Brogdon", "team": "WAS"},
  {"player": "Harrison Barnes", "team": "SAS"},
  {"player": "Bojan Bogdanović", "team": "BKN"},
  {"player": "Kenyon Martin Jr.", "team": "UTA"},
  {"player": "Mark Williams", "team": "LAL"},
  {"player": "Dorian Finney-Smith", "team": "LAL"},
  {"player": "Zaccharie Risacher", "team": "ATL"},
  {"player": "Alexandre Sarr", "team": "WAS"},
  {"player": "Reed Sheppard", "team": "HOU"},
  {"player": "Stephon Castle", "team": "SAS"}
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
    
    // Fallback for tricky ones
    if (!player && transfer.player === "Jonas Valančiūnas") player = players.find(p => p.name.includes("Valan"));
    if (!player && transfer.player === "Luka Dončić") player = players.find(p => p.name.includes("Doncic") || p.name.includes("Dončić"));

    if (player) {
         // Force update or add
         // Use include check to avoid dupes, but for "Update" we might want to ensure it's the LAST one.
         // But the game logic just checks .includes().
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
