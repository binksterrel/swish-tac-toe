#!/usr/bin/env python3
"""
Update players.json with team information from Wikipedia trades.
Cross-references trade data to add missing team associations for players.
"""

import json
from pathlib import Path
from collections import defaultdict

def load_json(path: str) -> dict | list:
    """Load JSON file."""
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def save_json(path: str, data):
    """Save JSON file with nice formatting."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def normalize_name(name: str) -> str:
    """Normalize player name for matching."""
    return name.lower().strip().replace(".", "").replace("'", "").replace("-", " ")

def main():
    print("🔄 Updating players.json with Wikipedia trade data...")
    
    # Load data
    players_path = Path("lib/players.json")
    wiki_clean_path = Path("lib/wikipedia_nba_clean.json")
    
    if not players_path.exists():
        print("❌ players.json not found")
        return
    
    if not wiki_clean_path.exists():
        print("❌ wikipedia_nba_clean.json not found. Run clean_wikipedia_data.py first")
        return
    
    players = load_json(players_path)
    wiki_data = load_json(wiki_clean_path)
    
    print(f"📚 Loaded {len(players)} players from database")
    print(f"📚 Loaded {len(wiki_data.get('team_changes', []))} trade records from Wikipedia")
    
    # Create normalized name -> player index map
    name_to_indices = defaultdict(list)
    for i, player in enumerate(players):
        name = player.get("name", "")
        normalized = normalize_name(name)
        name_to_indices[normalized].append(i)
        
        # Also add last name only for matching
        parts = name.split()
        if len(parts) >= 2:
            last_name = normalize_name(parts[-1])
            if len(last_name) > 3:  # Skip very short last names
                name_to_indices[f"lastname:{last_name}"].append(i)
    
    # Process each trade record
    updates_count = 0
    team_additions = defaultdict(set)  # player_name -> set of teams to add
    
    for trade in wiki_data.get("team_changes", []):
        trade_players = trade.get("players", [])
        trade_teams = trade.get("teams", [])
        year = trade.get("year", 0)
        
        if not trade_teams:
            continue
        
        for player_name in trade_players:
            normalized = normalize_name(player_name)
            
            # Try exact match first
            indices = name_to_indices.get(normalized, [])
            
            # If no exact match, try last name
            if not indices:
                parts = player_name.split()
                if len(parts) >= 2:
                    last_name = normalize_name(parts[-1])
                    indices = name_to_indices.get(f"lastname:{last_name}", [])
            
            # Add teams for matched players
            for idx in indices:
                player = players[idx]
                current_teams = set(player.get("teams", []))
                
                for team in trade_teams:
                    if team not in current_teams:
                        team_additions[player["name"]].add(team)
    
    # Apply the updates
    for player_name, new_teams in team_additions.items():
        # Find player by name
        for player in players:
            if player.get("name") == player_name:
                current_teams = player.get("teams", [])
                for team in new_teams:
                    if team not in current_teams:
                        current_teams.append(team)
                        updates_count += 1
                player["teams"] = current_teams
                break
    
    print(f"\n✅ Added {updates_count} team associations to {len(team_additions)} players")
    
    # Save updated data
    save_json(players_path, players)
    print(f"💾 Saved updated players.json")
    
    # Show some examples of updates
    print("\n📋 Sample updates made:")
    for player_name, teams in list(team_additions.items())[:20]:
        print(f"   {player_name}: +{list(teams)}")

if __name__ == "__main__":
    main()
