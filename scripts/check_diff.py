import json

main_path = 'lib/players.json'
enriched_path = 'lib/players_enriched.json'

with open(main_path, 'r') as f:
    main_data = json.load(f)

with open(enriched_path, 'r') as f:
    enriched_data = json.load(f)

main_map = {p['id']: p for p in main_data}
updates = []

for p in enriched_data:
    mp = main_map.get(p['id'])
    if not mp:
        continue
    
    # Check teams
    eteams = set(p['teams'])
    mteams = set(mp['teams'])
    new_teams = eteams - mteams
    
    if new_teams:
        updates.append(f"{p['id']} new teams: {new_teams}")
        
    # Check active
    if p.get('active') != mp.get('active'):
         updates.append(f"{p['id']} active change: {mp.get('active')} -> {p.get('active')}")

    # Check nbaId
    if str(p.get('nbaId')) != str(mp.get('nbaId')):
         updates.append(f"{p['id']} nbaId change: {mp.get('nbaId')} -> {p.get('nbaId')}")

print(f"Updates found: {len(updates)}")
for u in updates:
    print(u)
