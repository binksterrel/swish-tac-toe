#!/usr/bin/env python3
"""
Clean Wikipedia NBA transactions data by filtering actual NBA players.
Cross-references with existing players.json database.
"""

import json
from pathlib import Path

def load_existing_players():
    """Load existing player names from players.json."""
    players_path = Path("lib/players.json")
    if players_path.exists():
        with open(players_path) as f:
            data = json.load(f)
        return {p.get("name", "") for p in data}
    return set()

def is_likely_player_name(name: str, existing_players: set) -> bool:
    """Check if a name is likely a real NBA player."""
    # Skip obvious non-players
    skip_patterns = [
        "arena", "center", "sports", "network", "wikipedia", "airlines", "hotel",
        "corporation", "channel", "news", "division", "conference", "association",
        "jersey", "texas", "florida", "california", "toronto", "new york",
        "chicago", "boston", "los angeles", "miami", "denver", "dallas",
        "about ", "list of", "template", "category", "file:", "help:", "portal",
        "hawk", "laker", "celtic", "bull", "heat", "net", "knick", "spur",
        ".com", ".org", "tv", "broadcast", "media", "press", "arena", "stadium"
    ]
    
    name_lower = name.lower()
    if any(p in name_lower for p in skip_patterns):
        return False
    
    # Skip single word names (usually teams or places)
    words = name.split()
    if len(words) < 2:
        return False
    
    # Skip names with special characters (usually not players)
    if any(c in name for c in ["&", "@", "(", ")", "#", "/"]):
        return False
    
    # If it's in our existing database, it's definitely a player
    if name in existing_players:
        return True
    
    # Skip names that end with common non-player suffixes
    if name_lower.endswith(("center", "arena", "stadium", "sports", "news")):
        return False
    
    # Check if it looks like a person's name (first last format)
    if len(words) >= 2 and all(w[0].isupper() for w in words if len(w) > 0):
        # Additional filter: skip if any word is too long (>15 chars)
        if all(len(w) <= 15 for w in words):
            return True
    
    return False

def extract_team_changes_from_trades(trades: list) -> list[dict]:
    """Extract team change information from trade data."""
    team_changes = []
    
    nba_teams = {
        "Atlanta Hawks": "ATL", "Boston Celtics": "BOS", "Brooklyn Nets": "BKN",
        "Charlotte Hornets": "CHA", "Chicago Bulls": "CHI", "Cleveland Cavaliers": "CLE",
        "Dallas Mavericks": "DAL", "Denver Nuggets": "DEN", "Detroit Pistons": "DET",
        "Golden State Warriors": "GSW", "Houston Rockets": "HOU", "Indiana Pacers": "IND",
        "Los Angeles Clippers": "LAC", "Los Angeles Lakers": "LAL", "Memphis Grizzlies": "MEM",
        "Miami Heat": "MIA", "Milwaukee Bucks": "MIL", "Minnesota Timberwolves": "MIN",
        "New Orleans Pelicans": "NOP", "New York Knicks": "NYK", "Oklahoma City Thunder": "OKC",
        "Orlando Magic": "ORL", "Philadelphia 76ers": "PHI", "Phoenix Suns": "PHX",
        "Portland Trail Blazers": "POR", "Sacramento Kings": "SAC", "San Antonio Spurs": "SAS",
        "Toronto Raptors": "TOR", "Utah Jazz": "UTA", "Washington Wizards": "WAS"
    }
    
    for trade in trades:
        raw = trade.get("raw", "")
        year = trade.get("year", 0)
        players = trade.get("players", [])
        
        # Try to find team mentions
        teams_mentioned = []
        for team_name, abbrev in nba_teams.items():
            if team_name in raw or abbrev in raw:
                teams_mentioned.append(abbrev)
        
        if teams_mentioned and players:
            team_changes.append({
                "year": year,
                "players": [p for p in players if is_likely_player_name(p, set())],
                "teams": teams_mentioned,
                "raw": raw[:200]
            })
    
    return team_changes

def main():
    print("🧹 Cleaning Wikipedia NBA transactions data...")
    
    # Load raw Wikipedia data
    wiki_path = Path("lib/wikipedia_nba_transactions.json")
    if not wiki_path.exists():
        print("❌ No Wikipedia data found. Run scrape_wikipedia_transfers.py first.")
        return
    
    with open(wiki_path) as f:
        wiki_data = json.load(f)
    
    # Load existing players
    existing_players = load_existing_players()
    print(f"📚 Loaded {len(existing_players)} existing players from database")
    
    # Clean player list
    raw_players = wiki_data.get("players", [])
    clean_players = [p for p in raw_players if is_likely_player_name(p, existing_players)]
    
    print(f"✅ Filtered {len(raw_players)} -> {len(clean_players)} likely players")
    
    # Find players from Wikipedia that aren't in our database
    new_players = [p for p in clean_players if p not in existing_players]
    print(f"🆕 Found {len(new_players)} potential new players not in database")
    
    # Extract team changes from trades
    trades = wiki_data.get("trades", [])
    team_changes = extract_team_changes_from_trades(trades)
    print(f"🔄 Found {len(team_changes)} trades with team information")
    
    # Save cleaned data
    output = {
        "clean_players": clean_players,
        "new_players_not_in_db": new_players[:500],  # Limit to avoid too large file
        "team_changes": team_changes,
        "stats": {
            "raw_players": len(raw_players),
            "clean_players": len(clean_players),
            "new_players": len(new_players),
            "total_trades": len(trades),
            "trades_with_teams": len(team_changes)
        }
    }
    
    output_path = Path("lib/wikipedia_nba_clean.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Saved cleaned data to {output_path}")
    
    # Show some samples
    print("\n📋 Sample new players (not in our database):")
    for p in new_players[:30]:
        print(f"   - {p}")

if __name__ == "__main__":
    main()
