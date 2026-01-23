#!/usr/bin/env python3
"""
Add 'active' field to all MANUAL_PLAYERS in nba-data.ts
"""

import re

# Players who are still active as of 2025-26 season
ACTIVE_PLAYERS = {
    "lebron-james", "stephen-curry", "kevin-durant", "russell-westbrook",
    "james-harden", "chris-paul", "damian-lillard", "anthony-davis",
    "kawhi-leonard", "paul-george", "jimmy-butler", "kyrie-irving",
    "giannis-antetokounmpo", "nikola-jokic", "joel-embiid", "luka-doncic",
    "jayson-tatum", "devin-booker", "donovan-mitchell", "trae-young",
    "anthony-edwards", "ja-morant", "shai-gilgeous-alexander", "tyrese-haliburton",
    "lamelo-ball", "zion-williamson", "victor-wembanyama",
    "draymond-green", "klay-thompson", "bam-adebayo", "jaylen-brown",
    "deaaron-fox", "karl-anthony-towns", "rudy-gobert", "pascal-siakam",
    "kyle-lowry",
}

# Read the file
with open('lib/nba-data.ts', 'r') as f:
    content = f.read()

# Find MANUAL_PLAYERS section
match = re.search(r'(const MANUAL_PLAYERS: NBAPlayer\[\] = \[)(.*?)(\]\s*\n\s*// Import)', content, re.DOTALL)
if not match:
    print("Could not find MANUAL_PLAYERS section")
    exit(1)

prefix = match.group(1)
players_section = match.group(2)
suffix = match.group(3)

# Process each player object
def add_active_field(match_obj):
    player_obj = match_obj.group(0)
    
    # Extract player id
    id_match = re.search(r'id:\s*["\']([^"\']+)["\']', player_obj)
    if not id_match:
        return player_obj
    
    player_id = id_match.group(1)
    
    # Check if already has active field
    if re.search(r'active:', player_obj):
        return player_obj
    
    # Determine if active
    is_active = player_id in ACTIVE_PLAYERS
    active_value = "true" if is_active else "false"
    
    # Find the nbaId line (last field before closing brace)
    # Add active field after nbaId
    player_obj = re.sub(
        r'(nbaId:\s*["\'][^"\']*["\'])',
        r'\1,\n    active: ' + active_value,
        player_obj
    )
    
    return player_obj

# Replace all player objects
new_players_section = re.sub(
    r'\{[^}]+\}',
    add_active_field,
    players_section,
    flags=re.DOTALL
)

# Reconstruct the file
new_content = content[:match.start()] + prefix + new_players_section + suffix + content[match.end():]

# Write back
with open('lib/nba-data.ts', 'w') as f:
    f.write(new_content)

print("✅ Successfully added 'active' field to all MANUAL_PLAYERS")
print(f"   Active players: {len(ACTIVE_PLAYERS)}")
print(f"   Retired players: {51 - len(ACTIVE_PLAYERS)}")
