
import fs from 'fs';
import path from 'path';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));

const missing: string[] = [];

for (const p of players) {
  if (p.ppgCareer === 0 || p.rpgCareer === 0 || p.apgCareer === 0) {
    if (p.active || p.allStar) {
         missing.push(p.name);
    }
  }
}

console.log(missing.join(', '));
