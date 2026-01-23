#!/usr/bin/env python3
"""
Check which players in MANUAL_PLAYERS are missing the 'active' field
"""

import re

# Parse MANUAL_PLAYERS from nba-data.ts
with open('lib/nba-data.ts', 'r') as f:
    content = f.read()

# Extract MANUAL_PLAYERS array
match = re.search(r'const MANUAL_PLAYERS: NBAPlayer\[\] = \[(.*?)\]', content, re.DOTALL)
if not match:
    print("Could not find MANUAL_PLAYERS")
    exit(1)

manual_section = match.group(1)

# Parse each player object
player_objects = re.findall(r'\{([^}]+)\}', manual_section)

missing_active = []
has_active = []

for obj_str in player_objects:
    # Extract id and name
    id_match = re.search(r'id:\s*["\']([^"\']+)["\']', obj_str)
    name_match = re.search(r'name:\s*["\']([^"\']+)["\']', obj_str)
    active_match = re.search(r'active:\s*(true|false)', obj_str)
    
    if not id_match or not name_match:
        continue
        
    player_id = id_match.group(1)
    player_name = name_match.group(1)
    
    if active_match:
        has_active.append({
            'id': player_id,
            'name': player_name,
            'active': active_match.group(1) == 'true'
        })
    else:
        missing_active.append({
            'id': player_id,
            'name': player_name
        })

print(f"\n🔍 Checking MANUAL_PLAYERS for 'active' field\n")
print(f"Total manual players: {len(missing_active) + len(has_active)}")
print(f"With 'active' field: {len(has_active)}")
print(f"Missing 'active' field: {len(missing_active)}\n")

if missing_active:
    print(f"❌ Players missing 'active' field (will show as 'Retired'):\n")
    for p in missing_active:
        print(f"   - {p['name']} ({p['id']})")
    print()
else:
    print("✅ All manual players have 'active' field!")

if has_active:
    print(f"\n📊 Players with 'active' field:")
    active_count = sum(1 for p in has_active if p['active'])
    retired_count = len(has_active) - active_count
    print(f"   Active: {active_count}")
    print(f"   Retired: {retired_count}")
