import { ALL_NBA_PLAYERS, PLAYER_MAP, PLAYER_NAME_MAP } from '../lib/nba-data';

console.log('--- Verification Start ---');
console.log(`ALL_NBA_PLAYERS count: ${ALL_NBA_PLAYERS.length}`);
console.log(`PLAYER_MAP size: ${PLAYER_MAP.size}`);
console.log(`PLAYER_NAME_MAP size: ${PLAYER_NAME_MAP.size}`);

if (PLAYER_MAP.size !== ALL_NBA_PLAYERS.length) {
    console.error('ERROR: PLAYER_MAP size mismatch! Duplicates might exist.');
} else {
    console.log('SUCCESS: PLAYER_MAP size matches array length.');
}

// Test specific tricky case
const nene = PLAYER_NAME_MAP.get('Nene');
if (nene) {
    console.log('SUCCESS: Found "Nene" (trimmed).');
} else {
    console.error('ERROR: Could not find "Nene" in map.');
}

const neneId = PLAYER_MAP.get('-nene');
if (neneId) {
    console.log('SUCCESS: Found "-nene" by ID.');
} else {
    console.error("ERROR: Could not find '-nene' by ID.");
}

console.log('--- Verification End ---');
