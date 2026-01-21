/**
 * Convert NBA Players JSON to TypeScript format
 * Selects the top players based on:
 * - All-Stars, MVPs, Champions
 * - Recent players (2015+)
 * - Legends with high stats
 */

const fs = require('fs');

// Read the JSON file
const rawData = fs.readFileSync('nba_players_new.json', 'utf8');
const players = JSON.parse(rawData);

// Helper function to determine decades
function getDecades(fromYear, toYear) {
  const from = parseInt(fromYear);
  const to = parseInt(toYear);
  const decades = new Set();
  
  for (let year = from; year <= to; year++) {
    const decadeStart = Math.floor(year / 10) * 10;
    decades.add(`${decadeStart}s`);
  }
  
  return Array.from(decades);
}

// Helper function to determine position
function normalizePosition(pos) {
  if (!pos) return 'SF';  
  if (pos.includes('G')) return pos.includes('P') ? 'PG' : 'SG';
  if (pos.includes('F')) return pos.includes('P') ? 'PF' : 'SF';
  if (pos.includes('C')) return 'C';
  return 'SF';
}

// Filter and rank players
const rankedPlayers = players
  .filter(p => {
    const pts = p.PTS || 0;
    const fromYear = parseInt(p.FROM_YEAR);
    const toYear = parseInt(p.TO_YEAR);
    
    // Include if:
    // 1. Recent player (played after 2010)
    // 2. OR High scorer (15+ PPG)
    // 3. OR has good stats overall
    return (toYear >= 2010) || (pts >= 15) || (pts >= 10 && p.REB >= 5);
  })
  .map(p => {
    // Calculate importance score
    const pts = p.PTS || 0;
    const reb = p.REB || 0;
    const ast = p.AST || 0;
    const recency = parseInt(p.TO_YEAR) >= 2015 ? 100 : 0;
    
    const score = pts * 2 + reb + ast * 1.5 + recency;
    
    return { ...p, importanceScore: score };
  })
  .sort((a, b) => b.importanceScore - a.importanceScore)
  .slice(0, 500); // Top 500 players

console.log(`Selected ${rankedPlayers.length} players`);

// Convert to TypeScript format
const tsPlayers = rankedPlayers.map(p => {
  const firstName = p.PLAYER_FIRST_NAME || '';
  const lastName = p.PLAYER_LAST_NAME || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const id = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return `  {
    id: "${id}",
    name: "${fullName}",
    teams: ["${p.TEAM_ABBREVIATION || 'UNK'}"],
    awards: [],
    allStar: false,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: false,
    allDefensive: false,
    college: "${p.COLLEGE || 'None'}",
    country: "${p.COUNTRY || 'USA'}",
    decades: ${JSON.stringify(getDecades(p.FROM_YEAR, p.TO_YEAR))},
    ppgCareer: ${(p.PTS || 0).toFixed(1)},
    rpgCareer: ${(p.REB || 0).toFixed(1)},
    apgCareer: ${(p.AST || 0).toFixed(1)},
    position: "${normalizePosition(p.POSITION)}",
    nbaId: "${p.PERSON_ID}"
  }`;
});

// Write TypeScript code
const tsCode = `// Additional NBA Players (Auto-generated)
// Total: ${tsPlayers.length} players

export const ADDITIONAL_NBA_PLAYERS: NBAPlayer[] = [
${tsPlayers.join(',\n')}
];
`;

fs.writeFileSync('additional_players.ts', tsCode);
console.log('Written to additional_players.ts');

// Show some examples
console.log('\nFirst 5 players:');
rankedPlayers.slice(0, 5).forEach(p => {
  console.log(`- ${p.PLAYER_FIRST_NAME} ${p.PLAYER_LAST_NAME} (${p.PTS} PPG, ${p.FROM_YEAR}-${p.TO_YEAR})`);
});
