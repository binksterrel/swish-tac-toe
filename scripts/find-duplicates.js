
const fs = require('fs');
const players = require('../lib/players.json');

const idCounts = {};
const duplicates = [];

players.forEach(p => {
    if (idCounts[p.id]) {
        duplicates.push(p.id);
    }
    idCounts[p.id] = (idCounts[p.id] || 0) + 1;
});

console.log("Duplicate IDs found:", duplicates);
if (duplicates.length > 0) {
    console.log("Total duplicates:", duplicates.length);
}
