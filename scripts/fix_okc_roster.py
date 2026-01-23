import json
import os

PLAYERS_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'lib', 'players.json')

def fix_okc_champions():
    print(f"Loading database from {PLAYERS_DB_PATH}...")
    
    with open(PLAYERS_DB_PATH, 'r', encoding='utf-8') as f:
        players = json.load(f)

    reverted_count = 0
    confirmed_champions = []

    for player in players:
        # Logic: 
        # 1. Must be Active
        # 2. Must have 'OKC' in teams (to be relevant for this check)
        
        if player.get('active') and 'OKC' in player.get('teams', []):
            teams = player.get('teams', [])
            current_team = teams[-1] if teams else None
            
            # CASE A: Player is NOT currently on OKC (Revert)
            if current_team != 'OKC':
                champion_years = player.get('championYears', [])
                
                if "2025" in champion_years:
                    print(f"  [REVERT] {player['name']} (Current: {current_team})")
                    champion_years.remove("2025")
                    player['championYears'] = champion_years
                    reverted_count += 1
                    
                    # If no other championships, set champion to False
                    if not champion_years:
                        player['champion'] = False
                        print(f"     -> Removed Champion status")
            
            # CASE B: Player IS currently on OKC (Confirm)
            elif current_team == 'OKC':
                # Ensure they definitely have it (in case script missed them or strict check needed)
                if not player.get('champion'):
                    player['champion'] = True
                
                champion_years = player.get('championYears', [])
                if "2025" not in champion_years:
                    champion_years.append("2025")
                    champion_years.sort()
                    player['championYears'] = champion_years
                
                confirmed_champions.append(player['name'])

    # Save changes
    with open(PLAYERS_DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(players, f, indent=2, ensure_ascii=False)

    print(f"\nReverted {reverted_count} incorrect updates.")
    print(f"\n🏆 OFFICIAL OKC 2025 CHAMPIONS ({len(confirmed_champions)} players):")
    print(", ".join(sorted(confirmed_champions)))

if __name__ == "__main__":
    fix_okc_champions()
