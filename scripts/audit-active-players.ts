
import fs from 'fs';
import path from 'path';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));

let activeCount = 0;
let missingStatsCount = 0;
let verifiedZeroCount = 0;
const missingPlayers: string[] = [];

console.log('--- Active Players Audit ---');

for (const p of players) {
  if (p.active) {
    activeCount++;
    
    // Check if stats are missing or 0
    const hasStats = p.ppgCareer > 0 || p.rpgCareer > 0 || p.apgCareer > 0;
    
    if (!hasStats) {
        if (p.careerStatsVerified) {
            verifiedZeroCount++;
        } else {
            missingStatsCount++;
            missingPlayers.push(p.name);
        }
    }
  }
}

console.log(`Total Active Players: ${activeCount}`);
console.log(`Players with Stats: ${activeCount - missingStatsCount - verifiedZeroCount}`);
console.log(`Verified Zero Stats (Rookies/No Play): ${verifiedZeroCount}`);
console.log(`Missing Stats & Unverified: ${missingStatsCount}`);

if (missingPlayers.length > 0) {
    console.log('\nMissing Players:');
    console.log(missingPlayers.slice(0, 50).join(', '));
    if (missingPlayers.length > 50) console.log(`... and ${missingPlayers.length - 50} more.`);
}
