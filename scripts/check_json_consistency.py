#!/usr/bin/env python3
"""
Check internal consistency in players.json
Verify that awards array matches boolean fields
"""

import json

# Read players.json
with open('lib/players.json', 'r') as f:
    players = json.load(f)

inconsistencies = []

for player in players:
    issues = []
    name = player.get('name', 'Unknown')
    player_id = player.get('id', 'unknown')
    awards = player.get('awards', [])
    
    # Check Champion
    has_champion_award = 'Champion' in awards
    champion_bool = player.get('champion', False)
    if has_champion_award != champion_bool:
        issues.append(f"'Champion' in awards={has_champion_award} but champion={champion_bool}")
    
    # Check MVP
    has_mvp_award = 'MVP' in awards
    mvp_bool = player.get('mvp', False)
    if has_mvp_award != mvp_bool:
        issues.append(f"'MVP' in awards={has_mvp_award} but mvp={mvp_bool}")
    
    # Check Finals MVP
    has_fmvp_award = 'Finals MVP' in awards
    # Note: There's no separate fmvp boolean, Finals MVP should just be in awards
    
    # Check DPOY
    has_dpoy_award = 'DPOY' in awards
    dpoy_bool = player.get('dpoy', False)
    if has_dpoy_award != dpoy_bool:
        issues.append(f"'DPOY' in awards={has_dpoy_award} but dpoy={dpoy_bool}")
    
    # Check ROY
    has_roy_award = 'ROY' in awards
    roy_bool = player.get('roy', False)
    if has_roy_award != roy_bool:
        issues.append(f"'ROY' in awards={has_roy_award} but roy={roy_bool}")
    
    # Check All-Star
    has_allstar_award = 'All-Star' in awards
    allstar_bool = player.get('allStar', False)
    if has_allstar_award != allstar_bool:
        issues.append(f"'All-Star' in awards={has_allstar_award} but allStar={allstar_bool}")
    
    if issues:
        inconsistencies.append({
            'id': player_id,
            'name': name,
            'issues': issues,
            'awards': awards
        })

print(f"\n🔍 Checked {len(players)} players in players.json\n")
print(f"Found {len(inconsistencies)} player(s) with inconsistent data:\n")

for inc in inconsistencies[:20]:  # Show first 20
    print(f"❌ {inc['name']} ({inc['id']})")
    print(f"   awards: {inc['awards']}")
    for issue in inc['issues']:
        print(f"   - {issue}")
    print()

if len(inconsistencies) > 20:
    print(f"... and {len(inconsistencies) - 20} more players with issues\n")

if not inconsistencies:
    print("✅ All players have consistent award data!")
