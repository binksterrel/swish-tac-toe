import json
import os

PLAYERS_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'lib', 'players.json')

def inspect():
    with open(PLAYERS_DB_PATH, 'r') as f:
        players = json.load(f)
    
    targets = ["Shai Gilgeous-Alexander", "Kevin Durant", "Russell Westbrook"]
    for p in players:
        if p['name'] in targets:
            print(f"Name: {p['name']}")
            print(f"Teams: {p['teams']}")
            print(f"Active: {p['active']}")
            print("-" * 20)

if __name__ == "__main__":
    inspect()
