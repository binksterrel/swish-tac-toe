
import fs from 'fs';
import path from 'path';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));

const unverified = players.filter((p: any) => p.active && !p.careerStatsVerified).map((p: any) => p.name);

console.log(`Found ${unverified.length} unverified active players.`);
if (unverified.length > 0) {
    console.log(JSON.stringify(unverified));
}
