
import fs from 'fs';
import path from 'path';

const playersPath = path.join(process.cwd(), 'lib', 'players.json');
const rawData = fs.readFileSync(playersPath, 'utf-8');
const players = JSON.parse(rawData);

let missingStats = 0;
let totalPlayers = players.length;

console.log(`Auditing ${totalPlayers} players for missing stats...`);

players.forEach((p: any) => {
  if (
    p.ppgCareer === undefined || p.ppgCareer === null ||
    p.rpgCareer === undefined || p.rpgCareer === null ||
    p.apgCareer === undefined || p.apgCareer === null
  ) {
    missingStats++;
  }
});

console.log(`Found ${missingStats} players with missing stats out of ${totalPlayers}.`);
console.log(`Coverage: ${((totalPlayers - missingStats) / totalPlayers * 100).toFixed(2)}%`);
