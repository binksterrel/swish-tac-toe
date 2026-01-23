#!/usr/bin/env python3
"""
Find all players who should be active but are showing as retired
Check both players.json and the final merged data
"""

import json

# Read players.json
with open('lib/players.json', 'r') as f:
    all_players = json.load(f)

# Extended list of known active players (2025-26 season)
KNOWN_ACTIVE_2025 = {
    # Superstars
    "LeBron James", "Stephen Curry", "Kevin Durant", "Giannis Antetokounmpo",
    "Nikola Jokic", "Joel Embiid", "Luka Doncic", "Jayson Tatum",
    
    # All-Stars
    "Damian Lillard", "Anthony Davis", "Kawhi Leonard", "Paul George",
    "Jimmy Butler", "Kyrie Irving", "Devin Booker", "Donovan Mitchell",
    "Trae Young", "Anthony Edwards", "Ja Morant", "Shai Gilgeous-Alexander",
    "Tyrese Haliburton", "LaMelo Ball", "Zion Williamson", "Victor Wembanyama",
    "Draymond Green", "Klay Thompson", "Bam Adebayo", "Jaylen Brown",
    "De'Aaron Fox", "Karl-Anthony Towns", "Rudy Gobert", "Pascal Siakam",
    
    # Veterans still playing
    "Chris Paul", "Russell Westbrook", "Kyle Lowry", "Mike Conley",
    "Al Horford", "Brook Lopez", "Khris Middleton", "Jrue Holiday",
    "CJ McCollum", "Dejounte Murray", "Fred VanVleet", "Nikola Vucevic",
    "Zach LaVine", "DeMar DeRozan", "Bradley Beal", "Kristaps Porzingis",
    "Julius Randle", "Jalen Brunson", "Domantas Sabonis", "Jarrett Allen",
    
    # Rising stars
    "Paolo Banchero", "Chet Holmgren", "Scoot Henderson", "Brandon Miller",
    "Amen Thompson", "Ausar Thompson", "Jaime Jaquez Jr.", "Cason Wallace",
    "Gradey Dick", "Keyonte George", "Bilal Coulibaly", "Dereck Lively II",
    
    # Other active players
    "Darius Garland", "Evan Mobley", "Scottie Barnes", "Franz Wagner",
    "Jalen Williams", "Alperen Sengun", "Jalen Green", "Cade Cunningham",
    "Jaden Ivey", "Bennedict Mathurin", "Keegan Murray", "Jeremy Sochan",
    "Jabari Smith Jr.", "Shaedon Sharpe", "Dyson Daniels", "Jalen Duren",
    "Walker Kessler", "Tari Eason", "Jaden Hardy", "Mark Williams",
    "Andrew Nembhard", "Ochai Agbaji", "Trey Murphy III", "Herb Jones",
    "Ayo Dosunmu", "Bones Hyland", "Jalen Suggs", "Cole Anthony",
    "RJ Barrett", "Immanuel Quickley", "Tyrese Maxey", "Desmond Bane",
    "Jordan Poole", "Jonathan Kuminga", "Moses Moody", "Corey Kispert",
    "Josh Giddey", "Jalen Johnson", "AJ Griffin", "Ousmane Dieng",
}

# Find players who should be active but aren't marked as such
issues = []

for player in all_players:
    name = player.get('name', '')
    active = player.get('active')
    
    if name in KNOWN_ACTIVE_2025:
        if active is None:
            issues.append({
                'name': name,
                'id': player.get('id'),
                'issue': 'Missing active field',
                'current_value': 'undefined'
            })
        elif active == False:
            issues.append({
                'name': name,
                'id': player.get('id'),
                'issue': 'Marked as retired',
                'current_value': 'false'
            })

print(f"\n🔍 Checking {len(all_players)} players in players.json\n")
print(f"Known active players to check: {len(KNOWN_ACTIVE_2025)}\n")

if issues:
    print(f"❌ Found {len(issues)} active players with incorrect status:\n")
    
    missing_field = [p for p in issues if p['issue'] == 'Missing active field']
    marked_retired = [p for p in issues if p['issue'] == 'Marked as retired']
    
    if missing_field:
        print(f"Missing 'active' field ({len(missing_field)}):")
        for p in missing_field[:20]:
            print(f"   - {p['name']} (id: {p['id']})")
        if len(missing_field) > 20:
            print(f"   ... and {len(missing_field) - 20} more")
        print()
    
    if marked_retired:
        print(f"Incorrectly marked as retired ({len(marked_retired)}):")
        for p in marked_retired:
            print(f"   - {p['name']} (id: {p['id']})")
        print()
else:
    print("✅ All known active players have correct status!")

# Also check: how many total players are missing the active field
missing_active_total = sum(1 for p in all_players if 'active' not in p)
print(f"\n📊 Overall Statistics:")
print(f"   Total players: {len(all_players)}")
print(f"   Missing 'active' field: {missing_active_total}")
print(f"   With 'active' field: {len(all_players) - missing_active_total}")
