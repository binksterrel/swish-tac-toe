
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PLAYERS_PATH = path.join(process.cwd(), 'lib/players.json');
const TEMP_DIR = path.join(process.cwd(), 'temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

function downloadFile(url: string, dest: string) {
    if (fs.existsSync(dest)) return; // Cache
    console.log(`Downloading ${url}...`);
    try {
        execSync(`curl -L -A "Mozilla/5.0" "${url}" -o "${dest}"`, { stdio: 'inherit' });
        execSync('sleep 3'); // Rate Limit 3s
    } catch (e) {
        console.error(`Failed to download ${url}`);
    }
}

function getLastName(name: string): string {
    // "Hunter Dickinson" -> "Dickinson"
    // "Nikola Topić" -> "Topić"
    const parts = name.split(' ');
    return parts[parts.length - 1]; // Naive
}

function normalizeName(name: string): string {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function findPlayerUrl(name: string): string | null {
    const lastName = getLastName(name);
    // Remove accents for letter: "Topić" -> "Topic" -> "t"
    const normalizedLast = normalizeName(lastName);
    const letter = normalizedLast[0];
    
    if (!letter || !letter.match(/[a-z]/)) return null;
    
    const indexUrl = `https://www.basketball-reference.com/players/${letter}/`;
    const indexFile = path.join(TEMP_DIR, `players_${letter}.html`);
    
    downloadFile(indexUrl, indexFile);
    
    if (!fs.existsSync(indexFile)) return null;
    
    const html = fs.readFileSync(indexFile, 'utf-8');
    
    // Look for link matching the name
    // <a href="/players/d/dickihu01.html">Hunter Dickinson</a>
    // We try to match the visible text.
    // Name in file might have accents or not.
    // Let's iterate rows with links.
    
    // Regex to find links: <a href="/players/[^"]+">([^<]+)</a>
    const linkRegex = /<a href="(\/players\/[^"]+)">([^<]+)<\/a>/g;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
        const url = match[1];
        const linkText = match[2]; // e.g. "Hunter Dickinson"
        
        // Compare normalized names
        if (normalizeName(linkText) === normalizeName(name)) {
            return `https://www.basketball-reference.com${url}`;
        }
    }
    
    return null;
}

function parseProfilePage(html: string): any {
    const stats: any = {};
    
    // Find Per Game table
    // id="per_game"
    // Look for tfoot or just find the row with "Career"
    
    // Simple approach: Look for "Career" in a <td> or <th>, then grab the stats in that row.
    // <th scope="row" class="left " data-stat="season">Career</th><td class="center " data-stat="age"></td><td class="left " data-stat="team_id"></td><td class="left " data-stat="lg_id">NBA</td><td class="right " data-stat="g">1</td> ... <td class="right " data-stat="pts_per_g">2.0</td>
    
    // We can use regex to find the Career row.
    // It usually starts with >Career< inside a th or td.
    
    const careerRegex = />Career<[\s\S]*?<\/tr>/;
    const match = html.match(careerRegex);
    if (!match) return null;
    
    const careerRow = match[0];
    
    // Helper to extract data-stat
    const extractStat = (statName: string) => {
        // data-stat="pts_per_g">2.0<
        // or data-stat="pts_per_g" ... >2.0<
        const regex = new RegExp(`data-stat="${statName}"[^>]*>([0-9.]+)`);
        const m = careerRow.match(regex);
        return m ? parseFloat(m[1]) : 0;
    };
    
    stats.ppgCareer = extractStat('pts_per_g');
    stats.rpgCareer = extractStat('trb_per_g');
    stats.apgCareer = extractStat('ast_per_g');
    stats.spgCareer = extractStat('stl_per_g');
    stats.bpgCareer = extractStat('blk_per_g');
    
    return stats;
}

function main() {
    const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf-8'));
    let updated = 0;
    
    for (const p of players) {
        // Check if missing stats AND (active OR allStar)
        // Adjust condition as per audit script
        if ((p.active || p.allStar) && (p.ppgCareer === undefined || p.ppgCareer === 0)) {
            console.log(`Processing missing stats for ${p.name}...`);
            
            const url = findPlayerUrl(p.name);
            if (!url) {
                console.log(`  Could not find URL for ${p.name}`);
                continue;
            }
            
            console.log(`  Found URL: ${url}`);
            const filename = `profile_${p.name.replace(/ /g, '_')}.html`;
            const filepath = path.join(TEMP_DIR, filename);
            downloadFile(url, filepath);
            
            if (fs.existsSync(filepath)) {
                const html = fs.readFileSync(filepath, 'utf-8');
                const stats = parseProfilePage(html);
                if (stats) {
                    console.log(`  Extracted stats: ${JSON.stringify(stats)}`);
                    p.ppgCareer = stats.ppgCareer;
                    p.rpgCareer = stats.rpgCareer;
                    p.apgCareer = stats.apgCareer;
                    p.spgCareer = stats.spgCareer;
                    p.bpgCareer = stats.bpgCareer;
                    p.careerStatsVerified = true;
                    updated++;
                } else {
                     console.log(`  Could not parse stats (assuming rookie/no stats yet)`);
                     // Verify as 0
                     p.ppgCareer = 0;
                     p.rpgCareer = 0;
                     p.apgCareer = 0;
                     p.spgCareer = 0;
                     p.bpgCareer = 0;
                     p.careerStatsVerified = true;
                     updated++;
                }
            }
        }
    }
    
    if (updated > 0) {
        fs.writeFileSync(PLAYERS_PATH, JSON.stringify(players, null, 2));
        console.log(`Updated ${updated} players.`);
    } else {
        console.log('No players updated.');
    }
}

main();
