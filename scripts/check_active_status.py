#!/usr/bin/env python3
"""
Check which players are marked as retired (active: false) in players.json
Focus on well-known active players who might be incorrectly marked
"""

import json

# Read players.json
with open('lib/players.json', 'r') as f:
    players = json.load(f)

# Known active players (as of 2025-26 season)
KNOWN_ACTIVE_PLAYERS = [
    "LeBron James", "Stephen Curry", "Kevin Durant", "Russell Westbrook",
    "James Harden", "Chris Paul", "Damian Lillard", "Anthony Davis",
    "Kawhi Leonard", "Paul George", "Jimmy Butler", "Kyrie Irving",
    "Giannis Antetokounmpo", "Nikola Jokic", "Joel Embiid", "Luka Doncic",
    "Jayson Tatum", "Devin Booker", "Donovan Mitchell", "Trae Young",
    "Anthony Edwards", "Ja Morant", "Shai Gilgeous-Alexander", "Tyrese Haliburton",
    "LaMelo Ball", "Zion Williamson", "Victor Wembanyama", "Paolo Banchero",
    "Chet Holmgren", "Scoot Henderson", "Brandon Miller", "Amen Thompson",
    "Draymond Green", "Klay Thompson", "DeMar DeRozan", "Bradley Beal",
    "Bam Adebayo", "Jaylen Brown", "De'Aaron Fox", "Domantas Sabonis",
    "Karl-Anthony Towns", "Rudy Gobert", "Pascal Siakam", "Fred VanVleet",
    "Jalen Brunson", "Julius Randle", "Kristaps Porzingis", "Nikola Vucevic",
    "Zach LaVine", "DeMar DeRozan", "CJ McCollum", "Dejounte Murray",
    "Jrue Holiday", "Khris Middleton", "Brook Lopez", "Al Horford",
    "Kyle Lowry", "Mike Conley", "Jeff Green", "P.J. Tucker",
    "Derrick Rose", "Carmelo Anthony", "Blake Griffin", "Andre Drummond"
]

# Find players marked as retired who might still be active
incorrectly_retired = []
missing_active_field = []

for player in players:
    name = player.get('name', '')
    active = player.get('active')
    
    # Check if active field is missing
    if active is None:
        if name in KNOWN_ACTIVE_PLAYERS:
            missing_active_field.append(name)
    # Check if marked as retired but should be active
    elif active == False:
        if name in KNOWN_ACTIVE_PLAYERS:
            incorrectly_retired.append({
                'name': name,
                'id': player.get('id'),
                'teams': player.get('teams', [])
            })

print(f"\n🔍 Checking active/retired status in players.json\n")

if incorrectly_retired:
    print(f"❌ Found {len(incorrectly_retired)} known active players marked as retired:\n")
    for p in incorrectly_retired:
        print(f"   - {p['name']} (id: {p['id']}, teams: {', '.join(p['teams'][-3:])})")
    print()

if missing_active_field:
    print(f"⚠️  Found {len(missing_active_field)} known active players missing 'active' field:\n")
    for name in missing_active_field[:10]:
        print(f"   - {name}")
    if len(missing_active_field) > 10:
        print(f"   ... and {len(missing_active_field) - 10} more")
    print()

if not incorrectly_retired and not missing_active_field:
    print("✅ All known active players are correctly marked!")

# Also check: how many players total have active field
players_with_active = sum(1 for p in players if 'active' in p)
players_without_active = len(players) - players_with_active

print(f"\n📊 Statistics:")
print(f"   Total players: {len(players)}")
print(f"   With 'active' field: {players_with_active}")
print(f"   Without 'active' field: {players_without_active}")
print(f"   Marked as active: {sum(1 for p in players if p.get('active') == True)}")
print(f"   Marked as retired: {sum(1 for p in players if p.get('active') == False)}")
