
import fs from 'fs';
import path from 'path';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const HTML_PATH = path.join(process.cwd(), 'temp/nba_2026.html');

interface Player {
  id: string;
  name: string;
  active: boolean;
  team?: string;
  ppgSeason?: number;
  rpgSeason?: number;
  apgSeason?: number;
  spgSeason?: number;
  bpgSeason?: number;
  gpSeason?: number;
  [key: string]: any;
}

interface ScrapedStat {
  name: string;
  team: string;
  g: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
}

function extractVal(row: string, stat: string): string {
  // Regex to find the td with data-stat="STAT".
  // It might look like: <td class="right " data-stat="pts_per_g" csk="25.4888" >25.5</td>
  // or <td ... ><strong>25.5</strong></td>
  const regex = new RegExp(`<td[^>]*data-stat="${stat}"[^>]*>([\\s\\S]*?)<\\/td>`);
  const match = row.match(regex);
  if (!match) return '';
  let content = match[1];
  // Strip tags
  content = content.replace(/<[^>]+>/g, '');
  return content.trim();
}

function parseStats(): Map<string, ScrapedStat> {
  if (!fs.existsSync(HTML_PATH)) {
    console.error(`HTML file not found at ${HTML_PATH}`);
    process.exit(1);
  }

  const html = fs.readFileSync(HTML_PATH, 'utf-8');
  
  // Find the table body
  const tableStart = html.indexOf('<table class="stats_table');
  if (tableStart === -1) {
    console.error('Could not find stats table');
    return new Map();
  }
  const tbodyStart = html.indexOf('<tbody>', tableStart);
  const tbodyEnd = html.indexOf('</tbody>', tbodyStart);
  const tbody = html.slice(tbodyStart, tbodyEnd);

  // Split rows
  const rows = tbody.split('<tr');
  const statsMap = new Map<string, ScrapedStat>();
  const totPlayers = new Set<string>(); // players who have a TOT row

  for (const rowFragment of rows) {
    // Re-add <tr for context if needed, but we essentially just need the content
    const row = '<tr' + rowFragment;
    
    // Check if it's a valid data row usually has data-stat="player" (actually data-stat="name_display")
    if (!row.includes('data-stat="name_display"')) continue;

    const nameRaw = extractVal(row, 'name_display');
    const name = nameRaw.replace(/\s+/g, ' ').trim(); // Clean name
    
    const team = extractVal(row, 'team_name_abbr');
    const g = parseFloat(extractVal(row, 'games')) || 0;
    const ppg = parseFloat(extractVal(row, 'pts_per_g')) || 0;
    const rpg = parseFloat(extractVal(row, 'trb_per_g')) || 0;
    const apg = parseFloat(extractVal(row, 'ast_per_g')) || 0;
    const spg = parseFloat(extractVal(row, 'stl_per_g')) || 0;
    const bpg = parseFloat(extractVal(row, 'blk_per_g')) || 0;

    if (!name) continue;

    // Handle duplicate rows (TOT vs Team)
    // If we already have a TOT row for this player, skip specific teams
    if (totPlayers.has(name)) {
      continue;
    }

    if (team === 'TOT') {
      totPlayers.add(name);
      statsMap.set(name, { name, team, g, ppg, rpg, apg, spg, bpg });
    } else {
      // If we don't have a TOT row yet, process this one.
      if (!statsMap.has(name) || team === 'TOT') {
         statsMap.set(name, { name, team, g, ppg, rpg, apg, spg, bpg });
      }
    }
  }

  return statsMap;
}

function updatePlayers() {
  const statsMap = parseStats();
  console.log(`Parsed stats for ${statsMap.size} players.`);

  const players: Player[] = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));
  let updatedCount = 0;

  for (const player of players) {
    let stat = statsMap.get(player.name);
    
    // Try normalized match
    if (!stat) {
       const normName = player.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
       for (const [key, val] of statsMap.entries()) {
           const normKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
           if (normKey === normName) {
               stat = val;
               break;
           }
       }
    }

    if (stat) {
      player.ppgSeason = stat.ppg;
      player.rpgSeason = stat.rpg;
      player.apgSeason = stat.apg;
      player.spgSeason = stat.spg;
      player.bpgSeason = stat.bpg;
      player.gpSeason = stat.g;
      player.active = true; 
      updatedCount++;
    }
  }

  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
  console.log(`Updated ${updatedCount} players with season stats.`);
}

updatePlayers();
