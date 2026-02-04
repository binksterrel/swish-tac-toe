import fs from 'fs';
import path from 'path';
import { NBAPlayer } from '../lib/nba-data';

const playersPath = path.join(process.cwd(), 'lib', 'players.json');
const players: NBAPlayer[] = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));

const undefinedActive = players
  .filter(p => p.active === undefined)
  .map(p => p.name);

console.log(JSON.stringify(undefinedActive, null, 2));
