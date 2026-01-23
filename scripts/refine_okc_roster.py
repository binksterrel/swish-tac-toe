import json
import os

PLAYERS_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'lib', 'players.json')

def refine_okc_roster():
    print(f"Loading database from {PLAYERS_DB_PATH}...")
    
    with open(PLAYERS_DB_PATH, 'r', encoding='utf-8') as f:
        players = json.load(f)

    # 1. REMOVE Championship (Arrived 25-26)
    to_remove = ["Brooks Barnhizer", "Chris Youngblood"]
    
    # 2. CONFIRM Championship (Keep/Ensure)
    to_keep = ["Nikola Topić", "Adam Flagler", "Alex Ducas"]

    updated_count = 0

    for player in players:
        name = player['name']
        
        # REMOVE LOGIC
        if name in to_remove:
            champion_years = player.get('championYears', [])
            if "2025" in champion_years:
                champion_years.remove("2025")
                player['championYears'] = champion_years
                
                # If no other titles, set champion to false
                if not champion_years:
                    player['champion'] = False
                
                print(f"❌ REMOVED 2025 title from: {name}")
                updated_count += 1
        
        # KEEP LOGIC (Just checking, they should already have it)
        elif name in to_keep:
            champion_years = player.get('championYears', [])
            if "2025" not in champion_years:
                champion_years.append("2025")
                player['championYears'] = champion_years
                player['champion'] = True
                print(f"✅ ADDED 2025 title to: {name}")
                updated_count += 1
            else:
                print(f"✅ CONFIRMED 2025 title for: {name}")

    if updated_count > 0:
        with open(PLAYERS_DB_PATH, 'w', encoding='utf-8') as f:
            json.dump(players, f, indent=2, ensure_ascii=False)
        print(f"\nSuccessfully updated {updated_count} player records.")
    else:
        print("\nNo changes needed.")

if __name__ == "__main__":
    refine_okc_roster()
