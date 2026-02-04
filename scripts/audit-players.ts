
import fs from 'fs';
import path from 'path';

// Define the partial interface for what we expect in players.json
interface Player {
  id: string;
  name: string;
  teams: string[];
  active?: boolean;
  champion: boolean;
  championYears: string[];
  nbaId?: string;
  awards: string[];
}

const playersPath = path.join(process.cwd(), 'lib', 'players.json');

function auditPlayers() {
  console.log('Reading players.json from:', playersPath);
  const rawData = fs.readFileSync(playersPath, 'utf-8');
  const players: Player[] = JSON.parse(rawData);

  console.log(`Auditing ${players.length} players...`);

  const issues: { id: string; name: string; issues: string[] }[] = [];

  players.forEach((player) => {
    const playerIssues: string[] = [];

    // Check 1: Missing active status
    if (player.active === undefined) {
      playerIssues.push('Missing "active" status');
    }

    // Check 2: Empty teams
    if (!player.teams || player.teams.length === 0) {
      playerIssues.push('No teams listed');
    }

    // Check 3: Champion inconsistency (True but no years)
    if (player.champion && (!player.championYears || player.championYears.length === 0)) {
      playerIssues.push('Marked as champion but no championYears');
    }

    // Check 4: Champion inconsistency (Years but not true)
    if (!player.champion && player.championYears && player.championYears.length > 0) {
      playerIssues.push('Has championYears but marked as not champion');
    }

    // Check 5: Missing NBA ID
    if (!player.nbaId) {
      playerIssues.push('Missing nbaId');
    }

    if (playerIssues.length > 0) {
      issues.push({
        id: player.id,
        name: player.name,
        issues: playerIssues,
      });
    }
  });

  console.log(`\nFound ${issues.length} players with data issues.\n`);

  if (issues.length > 0) {
    console.log(JSON.stringify(issues, null, 2));
    
    // Summary of issue types
    const issueCounts: Record<string, number> = {};
    issues.forEach(p => {
      p.issues.forEach(issue => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });

    console.log('\n--- Issue Summary ---');
    Object.entries(issueCounts).forEach(([issue, count]) => {
      console.log(`${issue}: ${count}`);
    });
  } else {
    console.log('✅ No data consistency issues found!');
  }
}

auditPlayers();
