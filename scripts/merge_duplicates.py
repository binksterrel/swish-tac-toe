#!/usr/bin/env python3
"""
Merge duplicate players in players.json.
Combines teams, awards, and stats for players with the exact same name.
"""

import json
from pathlib import Path

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def merge_player_data(players):
    """Merge a list of player dicts into one."""
    if not players:
        return None
    
    # Base is the first player (usually the one with best data or first encountered)
    # We prefer the one with an NBA ID if possible
    base = next((p for p in players if p.get("nbaId")), players[0])
    
    merged = base.copy()
    
    # Merge Sets
    all_teams = set()
    all_awards = set()
    all_champion_years = set()
    
    # Merge Booleans (True if any is True)
    is_all_star = False
    is_champion = False
    is_mvp = False
    is_dpoy = False
    is_roy = False
    
    for p in players:
        # Teams
        if "teams" in p:
            all_teams.update(p["teams"])
            
        # Awards
        if "awards" in p:
            all_awards.update(p["awards"])
            
        # Champion Years
        if "championYears" in p:
            all_champion_years.update(p["championYears"])
            
        # Booleans
        if p.get("allStar"): is_all_star = True
        if p.get("champion"): is_champion = True
        if p.get("mvp"): is_mvp = True
        if p.get("dpoy"): is_dpoy = True
        if p.get("roy"): is_roy = True
        
    # Update merged object
    merged["teams"] = sorted(list(all_teams))
    merged["awards"] = sorted(list(all_awards))
    merged["championYears"] = sorted(list(all_champion_years))
    merged["allStar"] = is_all_star
    merged["champion"] = is_champion
    merged["mvp"] = is_mvp
    merged["dpoy"] = is_dpoy
    merged["roy"] = is_roy
    
    return merged

def main():
    print("🔄 Merging duplicate players...")
    
    path = Path("lib/players.json")
    players = load_json(path)
    
    print(f"📚 Total players before: {len(players)}")
    
    # Group by name
    by_name = {}
    for p in players:
        name = p.get("name").strip()
        if name not in by_name:
            by_name[name] = []
        by_name[name].append(p)
    
    unique_names = len(by_name)
    print(f"👥 Unique names: {unique_names}")
    
    merged_list = []
    duplicates_count = 0
    
    for name, p_list in by_name.items():
        if len(p_list) > 1:
            duplicates_count += 1
            merged = merge_player_data(p_list)
            merged_list.append(merged)
            print(f"  🔹 Merged {len(p_list)} entries for '{name}'")
        else:
            merged_list.append(p_list[0])
    
    # Sort alphabetically by name
    merged_list.sort(key=lambda x: x["name"])
    
    print(f"📉 Reduced from {len(players)} to {len(merged_list)} players")
    print(f"✅ Merged {duplicates_count} duplicate groups")
    
    # Save
    save_json(path, merged_list)
    print(f"💾 Saved to {path}")

if __name__ == "__main__":
    main()
