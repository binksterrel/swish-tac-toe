
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const TEMP_DIR = path.join(process.cwd(), 'temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

const STAT_TYPES = [
  { file: 'all_time_ppg.html', url: 'https://www.basketball-reference.com/leaders/pts_per_g_career.html', key: 'ppgCareer' },
  { file: 'all_time_rpg.html', url: 'https://www.basketball-reference.com/leaders/trb_per_g_career.html', key: 'rpgCareer' },
  { file: 'all_time_apg.html', url: 'https://www.basketball-reference.com/leaders/ast_per_g_career.html', key: 'apgCareer' },
  { file: 'all_time_spg.html', url: 'https://www.basketball-reference.com/leaders/stl_per_g_career.html', key: 'spgCareer' },
  { file: 'all_time_bpg.html', url: 'https://www.basketball-reference.com/leaders/blk_per_g_career.html', key: 'bpgCareer' },
];

function downloadFile(url: string, dest: string) {
    if (fs.existsSync(dest)) return; // Cache
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

function normalizeName(name: string): string {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function parseTableAndGetStats(html: string): Map<string, number> {
  const stats = new Map<string, number>();
  
  // Try to find id="tot" (NBA/ABA) or "nba" (NBA)
  // For all-time lists, usually "nba" is the main one or "tot"
  let tableIdx = html.indexOf('id="nba"');
  if (tableIdx === -1) {
    tableIdx = html.indexOf('id="tot"');
  }
  if (tableIdx === -1) return stats;

  const tableEnd = html.indexOf('</table>', tableIdx);
  if (tableEnd === -1) return stats;

  const tableContent = html.slice(tableIdx, tableEnd);
  
  // Split into rows
  const rows = tableContent.split('<tr');
  
  for (const row of rows) {
      // Must contain a link to a player
      if (!row.includes('<a href="/players/')) continue;

      // Extract Name
      // <td><strong><a href="...">Luka Dončić</a></strong></td> OR <td><a href="...">Michael Jordan</a>*</td>
      const nameMatch = row.match(/<a href="[^"]+">([^<]+)<\/a>/);
      if (!nameMatch) continue;
      let name = nameMatch[1];
      
      // Value is in the last td
      // <tr><td>1.</td><td>...</td><td>30.12</td></tr>
      const tds = row.split('<td');
      if (tds.length < 3) continue;
      
      const lastTd = tds[tds.length - 1];

      // Remove tags an clean
      let cleanVal = lastTd.replace(/<[^>]*>/g, '');
      cleanVal = cleanVal.replace(/^>/, ''); // Remove leading > if present from split
      cleanVal = cleanVal.replace(/\*/g, '').trim();
      
      const val = parseFloat(cleanVal);
      if (!isNaN(val)) {
          stats.set(normalizeName(name), val);
      }
  }
  
  return stats;
}

function main() {
  const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));
  
  // 1. Download
  for (const item of STAT_TYPES) {
      const dest = path.join(TEMP_DIR, item.file);
      downloadFile(item.url, dest);
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
          const normName = normalizeName(p.name);
          const val = statsMap.get(normName);
          
          if (val !== undefined) {
              // Only update if value is different or missing, to track actual changes
              if (p[item.key] !== val) {
                  p[item.key] = val;
                  updatedCount++;
              }
              // We could mark as verified, but maybe "allTimeVerified"?
              // For now just update the value.
              if (!p.careerStatsVerified) p.careerStatsVerified = true;
          }
      }
      console.log(`Updated/Verified ${updatedCount} players for ${item.key}`);
      totalUpdated += updatedCount;
  }
  
  console.log(`Total updates applied: ${totalUpdated}`);
  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
  console.log('Done.');
}

main();
