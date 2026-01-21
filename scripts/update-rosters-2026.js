
const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, '../lib/players.json');
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

// List of transfers extracted from BasketUSA (2025 Free Agency)
const TRANSFERS_2026 = [
  {"player": "Kristaps Porzingis", "team": "ATL"},
// ... (list continues)
  {"player": "Dillon Jones", "team": "WAS"}
];

// Helper to normalize names (remove accents, etc)
function normalizeName(name) {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ (iii|ii|jr\.|sr\.)/g, '').trim();
}

let updatedCount = 0;
let notFound = [];

TRANSFERS_2026.forEach(transfer => {
    // Find player by normalized name
    let player = players.find(p => normalizeName(p.name) === normalizeName(transfer.player));
    
    // Special manual mapping for tricky cases potentially
    if (!player && transfer.player === "Jusuf Nurkic") player = players.find(p => p.name.includes("Nurk"));
    if (!player && transfer.player === "Jonas Valanciunas") player = players.find(p => p.name.includes("Valan"));


    if (player) {
        // Check if team is already last in list to avoid dups
        const currentTeams = player.teams;
        const lastTeam = currentTeams[currentTeams.length - 1];
        
        if (lastTeam !== transfer.team) {
            // Check if team exists in history but not last? 
            // The request is "update to 2026", usually this means ADDING the new team.
            // Even if they played there before (e.g. D-Lo back to Lakers), it counts as a new stint, 
            // but for this game logic (grid intersection), just HAVING the team in the list is enough.
            // However, to permit "Current Team" logic if we ever add it, we should push it.
            // But strict Sets might filter duplicates. The game uses .includes().
            
            if (!player.teams.includes(transfer.team)) {
                console.log(`[UPDATE] ${player.name} -> Adding ${transfer.team}`);
                player.teams.push(transfer.team);
                updatedCount++;
            } else {
                console.log(`[SKIP] ${player.name} -> Already has ${transfer.team}`);
            }
        }
    } else {
        notFound.push(transfer.player);
    }
});

fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));

console.log(`\n✅ Completed! Updated ${updatedCount} players.`);
if (notFound.length > 0) {
    console.log("⚠️ Players not found in database:");
    console.log(notFound.join(', '));
}
