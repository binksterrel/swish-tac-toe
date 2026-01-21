
const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, '../lib/players.json');
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

const idCounts = {};
let fixedCount = 0;

players.forEach(player => {
    if (idCounts[player.id]) {
        // Collision detected
        const originalId = player.id;
        idCounts[originalId]++;
        const newId = `${originalId}-${idCounts[originalId]}`; // e.g., glen-rice-2
        
        console.log(`Fixing duplicate: ${player.name} (${originalId}) -> ${newId}`);
        player.id = newId;
        fixedCount++;
    } else {
        idCounts[player.id] = 1;
    }
});

fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
console.log(`\n✅ Fixed ${fixedCount} duplicate IDs.`);
