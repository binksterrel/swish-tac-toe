#!/usr/bin/env python3
"""
Compare MANUAL_PLAYERS in nba-data.ts with players.json to find discrepancies
"""

import json
import re

# Read players.json
with open('lib/players.json', 'r') as f:
    json_players = json.load(f)

# Create lookup by id and name
json_by_id = {p['id']: p for p in json_players}
json_by_name = {p['name']: p for p in json_players}

# Parse MANUAL_PLAYERS from nba-data.ts
with open('lib/nba-data.ts', 'r') as f:
    content = f.read()

# Extract MANUAL_PLAYERS array
match = re.search(r'const MANUAL_PLAYERS: NBAPlayer\[\] = \[(.*?)\]', content, re.DOTALL)
if not match:
    print("Could not find MANUAL_PLAYERS")
    exit(1)

manual_section = match.group(1)

# Parse each player object (simplified parsing)
player_objects = re.findall(r'\{([^}]+)\}', manual_section)

discrepancies = []

for obj_str in player_objects:
    # Extract id and name
    id_match = re.search(r'id:\s*["\']([^"\']+)["\']', obj_str)
    name_match = re.search(r'name:\s*["\']([^"\']+)["\']', obj_str)
    awards_match = re.search(r'awards:\s*\[(.*?)\]', obj_str)
    champion_match = re.search(r'champion:\s*(true|false)', obj_str)
    mvp_match = re.search(r'mvp:\s*(true|false)', obj_str)
    allStar_match = re.search(r'allStar:\s*(true|false)', obj_str)
    
    if not id_match or not name_match:
        continue
        
    manual_id = id_match.group(1)
    manual_name = name_match.group(1)
    
    # Find in JSON
    json_player = json_by_id.get(manual_id) or json_by_name.get(manual_name)
    
    if not json_player:
        continue
    
    # Parse awards
    manual_awards = []
    if awards_match:
        awards_str = awards_match.group(1)
        manual_awards = re.findall(r'["\']([^"\']+)["\']', awards_str)
    
    json_awards = json_player.get('awards', [])
    
    # Parse all booleans
    manual_champion = champion_match.group(1) == 'true' if champion_match else False
    manual_mvp = mvp_match.group(1) == 'true' if mvp_match else False
    manual_allStar = allStar_match.group(1) == 'true' if allStar_match else False
    
    dpoy_match = re.search(r'dpoy:\s*(true|false)', obj_str)
    roy_match = re.search(r'roy:\s*(true|false)', obj_str)
    allNBA_match = re.search(r'allNBA:\s*(true|false)', obj_str)
    allDefensive_match = re.search(r'allDefensive:\s*(true|false)', obj_str)
    
    manual_dpoy = dpoy_match.group(1) == 'true' if dpoy_match else False
    manual_roy = roy_match.group(1) == 'true' if roy_match else False
    manual_allNBA = allNBA_match.group(1) == 'true' if allNBA_match else False
    manual_allDefensive = allDefensive_match.group(1) == 'true' if allDefensive_match else False
    
    json_champion = json_player.get('champion', False)
    json_mvp = json_player.get('mvp', False)
    json_allStar = json_player.get('allStar', False)
    json_dpoy = json_player.get('dpoy', False)
    json_roy = json_player.get('roy', False)
    json_allNBA = json_player.get('allNBA', False)
    json_allDefensive = json_player.get('allDefensive', False)
    
    # Check for discrepancies
    issues = []
    
    if set(manual_awards) != set(json_awards):
        issues.append(f"awards: manual={manual_awards} vs json={json_awards}")
    
    if manual_champion != json_champion:
        issues.append(f"champion: manual={manual_champion} vs json={json_champion}")
    
    if manual_mvp != json_mvp:
        issues.append(f"mvp: manual={manual_mvp} vs json={json_mvp}")
    
    if manual_allStar != json_allStar:
        issues.append(f"allStar: manual={manual_allStar} vs json={json_allStar}")
    
    if manual_dpoy != json_dpoy:
        issues.append(f"dpoy: manual={manual_dpoy} vs json={json_dpoy}")
    
    if manual_roy != json_roy:
        issues.append(f"roy: manual={manual_roy} vs json={json_roy}")
    
    if manual_allNBA != json_allNBA:
        issues.append(f"allNBA: manual={manual_allNBA} vs json={json_allNBA}")
    
    if manual_allDefensive != json_allDefensive:
        issues.append(f"allDefensive: manual={manual_allDefensive} vs json={json_allDefensive}")
    
    if issues:
        discrepancies.append({
            'id': manual_id,
            'name': manual_name,
            'issues': issues
        })

print(f"\n🔍 Found {len(discrepancies)} player(s) with data discrepancies:\n")

for disc in discrepancies:
    print(f"❌ {disc['name']} ({disc['id']})")
    for issue in disc['issues']:
        print(f"   - {issue}")
    print()

if not discrepancies:
    print("✅ No discrepancies found! All manual players match players.json")
