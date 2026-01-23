import json
import os

# Path to the players database
PLAYERS_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'lib', 'players.json')

def update_okc_champions():
    print(f"Loading database from {PLAYERS_DB_PATH}...")
    
    try:
        with open(PLAYERS_DB_PATH, 'r', encoding='utf-8') as f:
            players = json.load(f)
    except FileNotFoundError:
        print("Error: players.json not found!")
        return

    updated_count = 0
    modified_players = []

    for player in players:
        # Check if player is ACTIVE and plays for OKC
        # Note: 'teams' is an array of team codes. OKC code is 'OKC'.
        if player.get('active') and 'OKC' in player.get('teams', []):
            
            is_modified = False
            
            # 1. Set Champion Status
            if not player.get('champion'):
                player['champion'] = True
                is_modified = True
                print(f"  -> {player['name']}: Marked as Champion")

            # 2. Add 2025 to Champion Years
            champion_years = player.get('championYears', [])
            if "2025" not in champion_years:
                champion_years.append("2025")
                champion_years.sort() # Keep it tidy
                player['championYears'] = champion_years
                is_modified = True
                print(f"  -> {player['name']}: Added 2025 to years")
            
            if is_modified:
                updated_count += 1
                modified_players.append(player['name'])

    if updated_count > 0:
        print(f"\nUpdating {updated_count} players...")
        print(f"Players impacted: {', '.join(modified_players)}")
        
        with open(PLAYERS_DB_PATH, 'w', encoding='utf-8') as f:
            json.dump(players, f, indent=2, ensure_ascii=False)
        print("Database saved successfully! 🏆⚡")
    else:
        print("\nNo players needed updates (maybe already applied?).")

if __name__ == "__main__":
    update_okc_champions()
