import json
import os

PLAYERS_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'lib', 'players.json')

def check_players():
    print(f"Loading database from {PLAYERS_DB_PATH}...")
    
    with open(PLAYERS_DB_PATH, 'r', encoding='utf-8') as f:
        players = json.load(f)

    targets = [
        "Brooks Barnhizer", 
        "Chris Youngblood", 
        "Nikola Topić", 
        "Adam Flagler", 
        "Alex Ducas"
    ]
    
    found = {name: False for name in targets}

    for player in players:
        if player['name'] in targets:
            found[player['name']] = True
            print(f"Found: {player['name']} (Champion: {player.get('champion', False)})")

    print("\nMissing Players:")
    for name, is_found in found.items():
        if not is_found:
            print(f"  - {name}")

if __name__ == "__main__":
    check_players()
