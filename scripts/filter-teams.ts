import fs from 'fs';
import path from 'path';
import { NBAPlayer } from '../lib/nba-data';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8')) as NBAPlayer[];

// The 30 Active NBA Team Codes
const ACTIVE_TEAMS = new Set([
  "ATL", "BOS", "BKN", "CHA", "CHI", 
  "CLE", "DAL", "DEN", "DET", "GSW", 
  "HOU", "IND", "LAC", "LAL", "MEM", 
  "MIA", "MIL", "MIN", "NOP", "NYK", 
  "OKC", "ORL", "PHI", "PHX", "POR", 
  "SAC", "SAS", "TOR", "UTA", "WAS"
]);

let totalTeamsRemoved = 0;
let playersAffected = 0;

console.log(`Initial Players: ${players.length}`);
console.log('Filtering non-active teams...');

players.forEach(player => {
    const originalCount = player.teams.length;
    // Filter teams to only allow ACTIVE_TEAMS
    const newTeams = player.teams.filter(t => ACTIVE_TEAMS.has(t));
    
    if (newTeams.length !== originalCount) {
        const removed = player.teams.filter(t => !ACTIVE_TEAMS.has(t));
        // console.log(`[${player.name}] Removed: ${removed.join(', ')}`);
        totalTeamsRemoved += (originalCount - newTeams.length);
        playersAffected++;
        player.teams = newTeams;
    }
});

console.log(`\n--- Summary ---`);
console.log(`Players Affected: ${playersAffected}`);
console.log(`Total Team Entries Removed: ${totalTeamsRemoved}`);
console.log(`Saving to players.json...`);

fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
console.log('Done.');
