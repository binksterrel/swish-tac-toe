
import fs from 'fs';
import path from 'path';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const UPDATE_FILE = path.join(process.cwd(), 'temp/batch_update.json');

function apply() {
  if (!fs.existsSync(UPDATE_FILE)) {
      console.log('Update file not found');
      return;
  }
  
  const updates = JSON.parse(fs.readFileSync(UPDATE_FILE, 'utf-8'));
  const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));
  let count = 0;
  
  for (const update of updates) {
      // Find player
      const p = players.find((pl: any) => pl.name === update.name);
      if (p) {
          p.ppgCareer = update.ppg;
          p.rpgCareer = update.rpg;
          p.apgCareer = update.apg;
          p.spgCareer = update.spg;
          p.bpgCareer = update.bpg;
          p.careerStatsVerified = true;
          count++;
      } else {
          console.log(`Player not found: ${update.name}`);
      }
  }

  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
  console.log(`Applied updates for ${count} players.`);
}

apply();
