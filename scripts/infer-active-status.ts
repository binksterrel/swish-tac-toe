import fs from 'fs';
import path from 'path';
import { NBAPlayer } from '../lib/nba-data';

const playersPath = path.join(process.cwd(), 'lib', 'players.json');
const players: NBAPlayer[] = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));

let updatedCount = 0;
let remainingUndefined = 0;

players.forEach(player => {
  if (player.active === undefined) {
    if (player.decades && player.decades.length > 0) {
      if (!player.decades.includes('2020s')) {
        player.active = false;
        updatedCount++;
      } else {
        remainingUndefined++;
        // Optional: console.log(`Potential active player: ${player.name}`);
      }
    } else {
      // If no decades, unlikely to be active if not manually set?
      // Or maybe new rookies? But new rookies should have "2020s".
      // Let's safe-guard and check specific cases or leave undefined.
      remainingUndefined++;
      console.log(`No decades for: ${player.name}`);
    }
  }
});

fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));

console.log(`Updated ${updatedCount} players to active=false.`);
console.log(`Remaining players with undefined active status: ${remainingUndefined}`);
