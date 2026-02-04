
import fs from 'fs';
import path from 'path';

interface Player {
  id: string;
  name: string;
  teams: string[];
}

const playersPath = path.join(process.cwd(), 'lib', 'players.json');
const rawData = fs.readFileSync(playersPath, 'utf-8');
const players: Player[] = JSON.parse(rawData);

const missingTeams = players
  .filter(p => !p.teams || p.teams.length === 0)
  .map(p => p.name);

console.log(JSON.stringify(missingTeams));
