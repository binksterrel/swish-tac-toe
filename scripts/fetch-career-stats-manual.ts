
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const TEMP_DIR = path.join(process.cwd(), 'temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

const STAT_TYPES = [
  { file: 'career_ppg.html', url: 'https://www.basketball-reference.com/leaders/pts_per_g_active.html', key: 'ppgCareer' },
  { file: 'career_rpg.html', url: 'https://www.basketball-reference.com/leaders/trb_per_g_active.html', key: 'rpgCareer' },
  { file: 'career_apg.html', url: 'https://www.basketball-reference.com/leaders/ast_per_g_active.html', key: 'apgCareer' },
  { file: 'career_spg.html', url: 'https://www.basketball-reference.com/leaders/stl_per_g_active.html', key: 'spgCareer' },
  { file: 'career_bpg.html', url: 'https://www.basketball-reference.com/leaders/blk_per_g_active.html', key: 'bpgCareer' },
];

function downloadFile(url: string, dest: string) {
    console.log(`Downloading ${url}...`);
    try {
        // Use curl with user agent to avoid 403
        execSync(`curl -L -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${url}" -o "${dest}"`, { stdio: 'inherit' });
        // Sleep to be nice
        execSync('sleep 2');
    } catch (e) {
        console.error(`Failed to download ${url}`);
    }
}


function parseTableAndGetStats(html: string): Map<string, number> {
  const stats = new Map<string, number>();
  
  // Try to find id="tot" (NBA/ABA)
  let tableIdx = html.indexOf('id="tot"');
  if (tableIdx === -1) {
    // Fallback to id="nba"
    tableIdx = html.indexOf('id="nba"');
  }
  if (tableIdx === -1) return stats;

  const tableEnd = html.indexOf('</table>', tableIdx);
  if (tableEnd === -1) return stats;

  const tableContent = html.slice(tableIdx, tableEnd);
  
  // Split into rows
  const rows = tableContent.split('<tr');
  console.log(`Debug: Total potential rows found: ${rows.length}`);
  
  let debugCount = 0;
  for (const row of rows) {
      if (debugCount < 3) {
          console.log(`Debug Row ${debugCount}: ${row.substring(0, 100)}...`);
      }
      debugCount++;

      // Must contain a link to a player
      if (!row.includes('<a href="/players/')) {
          if (debugCount < 5) console.log(`Skipping: No player link`);
          continue;
      }

      // Extract Name
      // <td><strong><a href="...">Luka Dončić</a></strong></td> OR <td><a href="...">Michael Jordan</a>*</td>
      const nameMatch = row.match(/<a href="[^"]+">([^<]+)<\/a>/);
      if (!nameMatch) continue;
      let name = nameMatch[1];
      
      // Value is in the last td? 
      // <tr><td>1.</td><td>...</td><td>30.12</td></tr>
      // Let's split by <td
      const tds = row.split('<td');
      if (tds.length < 3) continue;
      
      const lastTd = tds[tds.length - 1];

      // Remove tags and leading >
      // lastTd looks like ">30.12</td></tr>"
      // Remove all tags
      let cleanVal = lastTd.replace(/<[^>]*>/g, '');
      // Remove leading > if present
      cleanVal = cleanVal.replace(/^>/, '');
      // Remove * if present
      cleanVal = cleanVal.replace(/\*/g, '').trim();
      
      const val = parseFloat(cleanVal);
      if (!isNaN(val)) {
          stats.set(name, val);
      }
  }
  
  return stats;
}



function main() {
  const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));
  
  // 1. Download
  for (const item of STAT_TYPES) {
      const dest = path.join(TEMP_DIR, item.file);
      if (!fs.existsSync(dest)) {
          downloadFile(item.url, dest);
      }
  }
  
  // 2. Parse and Update
  let totalUpdated = 0;
  
  for (const item of STAT_TYPES) {
      const dest = path.join(TEMP_DIR, item.file);
      if (!fs.existsSync(dest)) continue;
      
      const content = fs.readFileSync(dest, 'utf-8');
      console.log(`Parsing ${item.file}...`);
      
      const statsMap = parseTableAndGetStats(content);
      console.log(`Found ${statsMap.size} entries.`);
      
      let updatedCount = 0;
      for (const p of players) {
          // fuzzy match or exact match? Exact match preferred.
          // Handle accents?
          
          let val = statsMap.get(p.name);
          if (val === undefined) {
             // Try normalizing name? (e.g. "Luka Doncic" vs "Luka Dončić")
             // For now, strict match.
             continue;
          }
          
          if (val !== undefined) {
              p[item.key] = val;
              updatedCount++;
          }
      }
      console.log(`Updated ${updatedCount} players for ${item.key}`);
      totalUpdated += updatedCount;
  }
  
  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
  console.log('Done.');
}

main();
