
const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(__dirname, '../nba_players_new.json');
const OUTPUT_PATH = path.join(__dirname, '../lib/players.json');

function transform() {
  console.log('Reading source file...');
  const rawData = fs.readFileSync(SOURCE_PATH, 'utf-8');
  const players = JSON.parse(rawData);

  console.log(`Found ${players.length} players. Transforming...`);

  const transformed = players.map(p => {
    // Basic mapping
    return {
      id: p.PLAYER_SLUG || `${p.PLAYER_FIRST_NAME.toLowerCase()}-${p.PLAYER_LAST_NAME.toLowerCase()}`,
      name: `${p.PLAYER_FIRST_NAME} ${p.PLAYER_LAST_NAME}`,
      teams: [p.TEAM_ABBREVIATION], // Start with just the listed team
      awards: [],
      allStar: false,
      champion: false,
      championYears: [],
      mvp: false,
      dpoy: false,
      roy: false,
      allNBA: false,
      allDefensive: false,
      college: p.COLLEGE || '',
      country: p.COUNTRY || 'USA',
      decades: calculateDecades(p.FROM_YEAR, p.TO_YEAR),
      ppgCareer: p.PTS || 0,
      rpgCareer: p.REB || 0,
      apgCareer: p.AST || 0,
      position: p.POSITION || '',
      nbaId: p.PERSON_ID ? p.PERSON_ID.toString() : undefined
    };
  });

  // Filter out invalid entries (e.g. no name/id)
  const validPlayers = transformed.filter(p => p.id && p.name);

  console.log(`Writing ${validPlayers.length} valid players to ${OUTPUT_PATH}...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(validPlayers, null, 2));
  console.log('Done!');
}

function calculateDecades(from, to) {
    if (!from || !to) return [];
    
    const start = parseInt(from);
    const end = parseInt(to);
    const decades = new Set();

    for (let year = start; year <= end; year++) {
        const decade = Math.floor(year / 10) * 10;
        decades.add(`${decade}s`);
    }
    
    return Array.from(decades).sort();
}

transform();
