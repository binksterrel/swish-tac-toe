
import fs from 'fs';
import path from 'path';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const TEMP_DIR = path.join(process.cwd(), 'temp');

interface Player {
  id: string;
  name: string;
  active: boolean;
  ppgCareer?: number;
  rpgCareer?: number;
  apgCareer?: number;
  spgCareer?: number;
  bpgCareer?: number;
  careerStatsVerified?: boolean; // New flag to track valid updates
  [key: string]: any;
}

const FILES = [
  { file: 'active_ppg.html', field: 'ppgCareer', idPart: 'pts_per_g' },
  { file: 'active_rpg.html', field: 'rpgCareer', idPart: 'trb_per_g' },
  { file: 'active_apg.html', field: 'apgCareer', idPart: 'ast_per_g' },
  { file: 'active_spg.html', field: 'spgCareer', idPart: 'stl_per_g' },
  { file: 'active_bpg.html', field: 'bpgCareer', idPart: 'blk_per_g' },
];

function extractTableRows(html: string, idPart: string): string[] {
  // Look for id="stats_active_pts_per_g"
  const idStr = `id="stats_active_${idPart}"`;
  const tableIdx = html.indexOf(idStr);
  
  if (tableIdx === -1) {
    console.log(`Could not find table with id ${idStr}`);
    return [];
  }

  const tableEnd = html.indexOf('</table>', tableIdx);
  if (tableEnd === -1) return [];

  const tableContent = html.slice(tableIdx, tableEnd);
  
  // Split into rows
  const rows = tableContent.split('<tr');
  // Filter only rows that have <td> (exclude thead <th> rows)
  return rows.filter(r => r.includes('<td'));
}

function parseValue(row: string): { name: string, value: number } | null {
  // Format: <td>Rank</td><td><strong><a href="...">Name</a></strong></td><td>Value</td>
  
  const nameMatch = row.match(/<a href="[^"]+">([^<]+)<\/a>/);
  if (!nameMatch) return null;
  let name = nameMatch[1];
  
  // Value is in the last td
  const tds = row.split('<td');
  if (tds.length < 3) return null;
  
  const lastTd = tds[tds.length - 1]; 
  const valStr = lastTd.replace(/^>/, '').replace(/<[^>]+>/g, '').trim();
  const val = parseFloat(valStr);

  return { name, value: val };
}

function update() {
  const players: Player[] = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));
  const playerMap = new Map<string, Player>();
  
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
    const rows = extractTableRows(html, item.idPart);
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
            p[item.field] = value;
            p.careerStatsVerified = true; // Mark as verified from a reliable source
            updateCount++;
        }
    }
    console.log(`Updated ${updateCount} players for ${item.field} (Active Leaders)`);
  }

  // Save
  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
}

update();
