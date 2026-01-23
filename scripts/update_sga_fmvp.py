import json
import os

PLAYERS_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'lib', 'players.json')

def update_sga_fmvp():
    print(f"Loading database from {PLAYERS_DB_PATH}...")
    
    with open(PLAYERS_DB_PATH, 'r', encoding='utf-8') as f:
        players = json.load(f)

    found = False
    for player in players:
        if player['name'] == "Shai Gilgeous-Alexander":
            found = True
            awards = player.get('awards', [])
            
            if "Finals MVP" not in awards:
                awards.append("Finals MVP")
                player['awards'] = awards
                print(f"🏆 Added 'Finals MVP' to {player['name']}!")
            else:
                print(f"ℹ️ {player['name']} already has 'Finals MVP'.")
            break
            
    if found:
        with open(PLAYERS_DB_PATH, 'w', encoding='utf-8') as f:
            json.dump(players, f, indent=2, ensure_ascii=False)
        print("Database saved.")
    else:
        print("Error: SGA not found in database.")

if __name__ == "__main__":
    update_sga_fmvp()
