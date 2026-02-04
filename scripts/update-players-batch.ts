
import fs from 'fs';
import path from 'path';

interface PlayerUpdate {
  id: string; // Helper to identify by ID or name
  name: string;
  teams: string[];
  active?: boolean; // Optional update
}

const playersPath = path.join(process.cwd(), 'lib', 'players.json');
const updatesPath = path.join(process.cwd(), 'scripts', 'player-updates.json');

const rawData = fs.readFileSync(playersPath, 'utf-8');
const players = JSON.parse(rawData);

const updatesData = fs.readFileSync(updatesPath, 'utf-8');
const updates: PlayerUpdate[] = JSON.parse(updatesData);

let updatedCount = 0;

updates.forEach(update => {
  const player = players.find((p: any) => p.name === update.name);
  if (player) {
    if (update.teams && update.teams.length > 0) {
      player.teams = update.teams;
    }
    if (update.active !== undefined) {
      player.active = update.active;
    }
    updatedCount++;
    console.log(`Updated ${player.name}`);
  } else {
    console.warn(`Player not found: ${update.name}`);
  }
});

fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
console.log(`Successfully updated ${updatedCount} players.`);
