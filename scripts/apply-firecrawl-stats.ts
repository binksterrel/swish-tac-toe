
import fs from 'fs';
import path from 'path';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');

const UPDATES = [
      {
        "apg": 6.2,
        "bpg": 0.2,
        "name": "Allen Iverson",
        "ppg": 26.7,
        "rpg": 3.7,
        "spg": 2.2
      },
      {
        "apg": 4.2,
        "bpg": 0.5,
        "name": "Andre Iguodala",
        "ppg": 11.3,
        "rpg": 4.9,
        "spg": 1.4
      },
      {
        "apg": 2.7,
        "bpg": 0.5,
        "name": "Carmelo Anthony",
        "ppg": 22.5,
        "rpg": 6.2,
        "spg": 1
      },
      {
        "apg": 6.7,
        "bpg": 0.3,
        "name": "Damian Lillard",
        "ppg": 25.1,
        "rpg": 4.3,
        "spg": 1
      },
      {
        "apg": 8.1,
        "bpg": 0.2,
        "name": "Deron Williams",
        "ppg": 16.3,
        "rpg": 3.1,
        "spg": 1
      },
      {
        "apg": 2.4,
        "bpg": 0.8,
        "name": "Dirk Nowitzki",
        "ppg": 20.7,
        "rpg": 7.5,
        "spg": 0.8
      },
      {
        "apg": 1.3,
        "bpg": 1.8,
        "name": "Dwight Howard",
        "ppg": 15.7,
        "rpg": 11.8,
        "spg": 0.9
      },
      {
        "apg": 5.4,
        "bpg": 0.8,
        "name": "Dwyane Wade",
        "ppg": 22,
        "rpg": 4.7,
        "spg": 1.5
      },
      {
        "apg": 4.8,
        "bpg": 0.1,
        "name": "Isaiah Thomas",
        "ppg": 17.5,
        "rpg": 2.4,
        "spg": 0.8
      },
      {
        "apg": 3.8,
        "bpg": 0.7,
        "name": "Jayson Tatum",
        "ppg": 23.6,
        "rpg": 7.3,
        "spg": 1.1
      },
      {
        "apg": 3.7,
        "bpg": 1.4,
        "name": "Kevin Garnett",
        "ppg": 17.8,
        "rpg": 10,
        "spg": 1.3
      },
      {
        "apg": 4.7,
        "bpg": 0.5,
        "name": "Kobe Bryant",
        "ppg": 25,
        "rpg": 5.2,
        "spg": 1.4
      },
      {
        "apg": 5.6,
        "bpg": 0.4,
        "name": "Kyrie Irving",
        "ppg": 23.7,
        "rpg": 4.1,
        "spg": 1.3
      },
      {
        "apg": 3.8,
        "bpg": 0.3,
        "name": "Manu Ginobili",
        "ppg": 13.3,
        "rpg": 3.5,
        "spg": 1.3
      },
      {
        "apg": 5.3,
        "bpg": 0.8,
        "name": "Michael Jordan",
        "ppg": 30.1,
        "rpg": 6.2,
        "spg": 2.3
      },
      {
        "apg": 3.5,
        "bpg": 0.6,
        "name": "Paul Pierce",
        "ppg": 19.7,
        "rpg": 5.6,
        "spg": 1.3
      },
      {
        "apg": 3.4,
        "bpg": 0.2,
        "name": "Ray Allen",
        "ppg": 18.9,
        "rpg": 4.1,
        "spg": 1.1
      },
      {
        "apg": 2.5,
        "bpg": 2.3,
        "name": "Shaquille O'Neal",
        "ppg": 23.7,
        "rpg": 10.9,
        "spg": 0.6
      },
      {
        "apg": 8.5,
        "bpg": 0.1,
        "name": "Steve Nash",
        "ppg": 14.3,
        "rpg": 3,
        "spg": 0.7
      },
      {
        "apg": 3,
        "bpg": 2.2,
        "name": "Tim Duncan",
        "ppg": 19,
        "rpg": 10.8,
        "spg": 0.7
      },
      {
        "apg": 5.6,
        "bpg": 0.1,
        "name": "Tony Parker",
        "ppg": 15.5,
        "rpg": 2.7,
        "spg": 0.8
      },
      {
        "apg": 4.4,
        "bpg": 0.9,
        "name": "Tracy McGrady",
        "ppg": 19.6,
        "rpg": 5.6,
        "spg": 1.2
      },
      {
        "apg": 3.1,
        "bpg": 0.6,
        "name": "Vince Carter",
        "ppg": 16.7,
        "rpg": 4.3,
        "spg": 1
      }
];

function apply() {
  const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));
  let count = 0;
  
  for (const update of UPDATES) {
      // Find player
      const p = players.find((pl: any) => pl.name === update.name);
      if (p) {
          p.ppgCareer = update.ppg;
          p.rpgCareer = update.rpg;
          p.apgCareer = update.apg;
          p.spgCareer = update.spg;
          p.bpgCareer = update.bpg;
          count++;
          console.log(`Updated ${p.name}`);
      } else {
          console.log(`Player not found: ${update.name}`);
      }
  }

  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
  console.log(`Applied updates for ${count} players.`);
}

apply();
