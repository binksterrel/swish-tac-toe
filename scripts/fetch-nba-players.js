/**
 * Script to fetch all NBA players from the official NBA Stats API
 * and merge with existing player database without duplicates
 */

// Existing player IDs to avoid duplicates
const existingPlayerIds = new Set([
  "2544", // LeBron James
  "201939", // Stephen Curry
  "201142", // Kevin Durant
  "203507", // Giannis Antetokounmpo
  "202695", // Kawhi Leonard
  "201935", // James Harden  
  "203999", // Nikola Jokic
  "1629029", // Luka Doncic
  "977", // Kobe Bryant
  "893", // Michael Jordan
  "1495", // Tim Duncan
  "406", // Shaquille O'Neal
  "2548", // Dwyane Wade
  "1717", // Dirk Nowitzki
  "101108", // Chris Paul
  "201566", // Russell Westbrook
  "203076", // Anthony Davis
  "202331", // Paul George
  "202681", // Kyrie Irving
  "202710", // Jimmy Butler
  "1628369", // Jayson Tatum
  "203954", // Joel Embiid
  "203081", // Damian Lillard
  "1628378", // Donovan Mitchell
  "1626164", // Devin Booker
  "1629027", // Trae Young
  "1629627", // Zion Williamson
  "1629630", // Ja Morant
  "947", // Allen Iverson
  "708", // Kevin Garnett
  "1718", // Paul Pierce
  "951", // Ray Allen
  "2225", // Tony Parker
  "1938", // Manu Ginobili
  "959", // Steve Nash
  "1713", // Vince Carter
  "1503", // Tracy McGrady
  "2730", // Dwight Howard
  "2546", // Carmelo Anthony
  "201933", // Blake Griffin
  "101114", // Deron Williams
  "1628983", // Shai Gilgeous-Alexander
  "1641705", // Victor Wembanyama
  "1628389", // Bam Adebayo
  "203110", // Draymond Green
  "202691", // Klay Thompson
  "2738", // Andre Iguodala
  "203497", // Rudy Gobert
  "1626157", // Karl-Anthony Towns
  "1627783", // Pascal Siakam
  "200768"  // Kyle Lowry
]);

async function fetchAllNBAPlayers() {
  const url = new URL('https://stats.nba.com/stats/playerindex');
  url.searchParams.append('College', '');
  url.searchParams.append('Country', '');
  url.searchParams.append('DraftPick', '');
  url.searchParams.append('DraftYear', '');  
  url.searchParams.append('GameScope', '');
  url.searchParams.append('Height', '');
  url.searchParams.append('Historical', '1'); // Include historical players
  url.searchParams.append('LeagueID', '00');
  url.searchParams.append('Season', '2023-24');
  url.searchParams.append('SeasonType', 'Regular Season');
  url.searchParams.append('TeamID', '0');
  url.searchParams.append('Weight', '');

  const reqHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(url.toString(), { headers: reqHeaders });
    const data = await response.json();
    
    // The data structure from NBA Stats API
    const columnHeaders = data.resultSets[0].headers;
    const rows = data.resultSets[0].rowSet;
    
    // Map rows to objects
    const players = rows.map(row => {
      const playerObj = {};
      columnHeaders.forEach((header, index) => {
        playerObj[header] = row[index];
      });
      return playerObj;
    });

    // Filter out existing players
    const newPlayers = players.filter(player => 
      !existingPlayerIds.has(String(player.PERSON_ID))
    );

    console.log(`Total players from API: ${players.length}`);
    console.log(`Existing players in database: ${existingPlayerIds.size}`);
    console.log(`New players to add: ${newPlayers.length}`);

    return newPlayers;
  } catch (error) {
    console.error('Error fetching NBA players:', error);
    return [];
  }
}

// Run the script
fetchAllNBAPlayers().then(players => {
  console.log('\nFirst 10 new players:');
  players.slice(0, 10).forEach(p => {
    console.log(`- ${p.PLAYER_FIRST_NAME} ${p.PLAYER_LAST_NAME} (ID: ${p.PERSON_ID})`);
  });
  
  // Save to JSON file
  const fs = require('fs');
  fs.writeFileSync('nba_players_new.json', JSON.stringify(players, null, 2));
  console.log('\nSaved to nba_players_new.json');
});
