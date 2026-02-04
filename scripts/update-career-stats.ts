
import fs from 'fs';
import path from 'path';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const TEMP_DIR = path.join(process.cwd(), 'temp');

interface Player {
  id: string;
  name: string;
  ppgCareer?: number;
  rpgCareer?: number;
  apgCareer?: number;
  spgCareer?: number;
  bpgCareer?: number;
  [key: string]: any;
}

const FILES = [
  { file: 'career_ppg.html', field: 'ppgCareer' },
  { file: 'career_rpg.html', field: 'rpgCareer' },
  { file: 'career_apg.html', field: 'apgCareer' },
  { file: 'career_spg.html', field: 'spgCareer' },
  { file: 'career_bpg.html', field: 'bpgCareer' },
];

function extractTableRows(html: string): string[] {
  // Try to find id="tot" (NBA/ABA)
  let tableIdx = html.indexOf('id="tot"');
  if (tableIdx === -1) {
    // Fallback to id="nba"
    tableIdx = html.indexOf('id="nba"');
  }
  if (tableIdx === -1) return [];

  const tableEnd = html.indexOf('</table>', tableIdx);
  if (tableEnd === -1) return [];

  const tableContent = html.slice(tableIdx, tableEnd);
  
  // Split into rows
  const rows = tableContent.split('<tr');
  // Filter only rows that have <td> (exclude thead <th> rows)
  return rows.filter(r => r.includes('<td'));
}

function parseValue(row: string): { name: string, value: number } | null {
  // Format: <td>Rank</td><td><a...>Name</a>*?</td><td>Value</td>
  // Regex is tricky with HTML.
  // Extract Name:
  // Look for >Name< inside the second td?
  // Actually, easiest is to strip tags but keep structure?
  // Let's use simple regex extraction.
  
  const nameMatch = row.match(/<a href="[^"]+">([^<]+)<\/a>/);
  if (!nameMatch) return null;
  let name = nameMatch[1];
  
  if (name.includes('LeBron') || name.includes('Iverson')) {
      console.log(`Debug Row: ${row.slice(0, 100)}...`);
      console.log(`Debug Name: ${name}`);
  }

  // Value is in the last td? 
  // <td>Value</td></tr> or <td>Value</td>
  // Let's find the last numbers like >25.6<
  const valMatch = row.match(/>(\d+\.\d+)</);
  if (name.includes('LeBron') || name.includes('Iverson')) console.log(`Debug Value Match: ${valMatch ? valMatch[0] : 'null'}`);
  
  // This might match rank "1." -> "1." no.
  // The value is usually at the end.
  // Search for the last td content.
  const tds = row.split('<td');
  if (tds.length < 3) return null;
  
  const lastTd = tds[tds.length - 1]; 
  // lastTd starts with '>'. Remove it and tags.
  const valStr = lastTd.replace(/^>/, '').replace(/<[^>]+>/g, '').trim();
  const val = parseFloat(valStr);
  if (name.includes('LeBron') || name.includes('Iverson')) console.log(`Debug Final Value: ${val}`);

  return { name, value: val };
}

function update() {
  const players: Player[] = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));
  const playerMap = new Map<string, Player>();
  
  // Normalize names in map for lookup
  players.forEach(p => {
    playerMap.set(p.name, p);
    // Also add normalized key
    const norm = p.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    playerMap.set(norm, p);
  });

  for (const item of FILES) {
    const pPath = path.join(TEMP_DIR, item.file);
    if (!fs.existsSync(pPath)) {
      console.log(`Skipping ${item.file}, not found.`);
      continue;
    }
    
    const html = fs.readFileSync(pPath, 'utf-8');
    const rows = extractTableRows(html);
    console.log(`Parsing ${item.file}: found ${rows.length} rows.`);
    
    let updateCount = 0;
    for (const rowFragment of rows) {
        const parsed = parseValue('<tr' + rowFragment);
        if (!parsed) continue;
        
        const { name, value } = parsed;
        let p = playerMap.get(name);
        if (!p) {
             const norm = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
             p = playerMap.get(norm);
        }

        if (p) {
            // Update if 0 or missing
            // Or overwrite? Leaderboard is authoritative for Career.
            // But verify it's not smaller than existing? Leaderboard is avg.
            // If existing is 0, definitely update.
            // If existing is present (like derived from some other source), assume leaderboard is better.
            p[item.field] = value;
            updateCount++;
        }
    }
    console.log(`Updated ${updateCount} players for ${item.field}`);
  }

  // Final Cleanup: Check for players who still have 0 stats but have Season stats
  // Copy Season -> Career as fallback for active players not in Leaderboard top 250
  let fallbackCount = 0;
  for (const p of players) {
      if ((!p.ppgCareer || p.ppgCareer === 0) && p.ppgSeason) {
          p.ppgCareer = p.ppgSeason;
          fallbackCount++;
      }
      if ((!p.rpgCareer || p.rpgCareer === 0) && p.rpgSeason) {
          p.rpgCareer = p.rpgSeason;
      }
      if ((!p.apgCareer || p.apgCareer === 0) && p.apgSeason) {
          p.apgCareer = p.apgSeason;
      }
      if ((!p.spgCareer || p.spgCareer === 0) && p.spgSeason) {
          p.spgCareer = p.spgSeason;
      }
      if ((!p.bpgCareer || p.bpgCareer === 0) && p.bpgSeason) {
          p.bpgCareer = p.bpgSeason;
      }
  }
  console.log(`Applied season fallback for ${fallbackCount} players.`);

  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
}

update();
