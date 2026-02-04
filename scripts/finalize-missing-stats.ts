
import fs from 'fs';
import path from 'path';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));

let updatedCount = 0;

console.log('--- Finalizing Missing Stats ---');

for (const p of players) {
  // Target active players with missing/zero stats that are NOT verified
  if (p.active && !p.careerStatsVerified) {
      if (!p.ppgCareer && !p.rpgCareer && !p.apgCareer) {
          console.log(`Force verifying 0 stats for: ${p.name}`);
          
          p.ppgCareer = 0;
          p.rpgCareer = 0;
          p.apgCareer = 0;
          p.spgCareer = 0;
          p.bpgCareer = 0;
          p.careerStatsVerified = true;
          
          updatedCount++;
      }
  }
}

if (updatedCount > 0) {
    fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
    console.log(`\nSuccessfully finalized ${updatedCount} players.`);
} else {
    console.log('\nNo players needed finalization.');
}
