#!/usr/bin/env python3
"""
Scrape NBA transfers/transactions from Wikipedia for seasons 2010 to 2026.
Uses pages like:
- https://en.wikipedia.org/wiki/2023_NBA_free_agency
- https://en.wikipedia.org/wiki/2023_NBA_draft (for draft picks)
"""

import json
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def get_page(url: str) -> BeautifulSoup | None:
    """Fetch and parse a Wikipedia page."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return None
        print(f"   ⚠️ Error: {e}")
        return None
    except Exception as e:
        print(f"   ⚠️ Error: {e}")
        return None

def extract_player_names_from_page(soup: BeautifulSoup) -> set[str]:
    """Extract player names from Wikipedia page content."""
    players = set()
    
    # Look for links to player pages
    for link in soup.find_all("a", href=True):
        href = link.get("href", "")
        text = link.get_text(strip=True)
        
        # Player links usually have sports-related patterns
        if "/wiki/" in href and not any(x in href.lower() for x in ["team", "nba_", "list_of", "season", "category", "file:", "template:"]):
            # Filter to likely player names (2-4 words, capitalized)
            words = text.split()
            if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                # Exclude common non-player terms
                if not any(x.lower() in text.lower() for x in ["NBA", "Team", "Draft", "Trade", "Season", "Championship", "Award", "All-Star"]):
                    players.add(text)
    
    return players

def extract_trades_from_page(soup: BeautifulSoup, year: int) -> list[dict]:
    """Extract trade information from page."""
    trades = []
    
    # Look for trade tables
    tables = soup.find_all("table", {"class": re.compile(r"wikitable")})
    
    for table in tables:
        rows = table.find_all("tr")
        for row in rows[1:]:  # Skip header
            cells = row.find_all(["td", "th"])
            if len(cells) >= 2:
                # Extract player names from cells
                row_players = []
                for cell in cells:
                    for link in cell.find_all("a"):
                        text = link.get_text(strip=True)
                        if text and len(text) > 3:
                            row_players.append(text)
                
                if row_players:
                    trades.append({
                        "year": year,
                        "type": "trade",
                        "players": row_players,
                        "raw": " | ".join(c.get_text(strip=True)[:100] for c in cells[:3])
                    })
    
    return trades

def extract_signings_from_lists(soup: BeautifulSoup, year: int) -> list[dict]:
    """Extract free agent signings from lists."""
    signings = []
    
    # Look for lists in the page
    for ul in soup.find_all("ul"):
        for li in ul.find_all("li", recursive=False):
            text = li.get_text(strip=True)
            # Look for signing patterns
            if any(x in text.lower() for x in ["signed", "sign", "agreed", "deal", "contract"]):
                # Extract player and team
                links = li.find_all("a")
                if links:
                    signings.append({
                        "year": year,
                        "type": "signing",
                        "details": text[:300]
                    })
    
    return signings

def scrape_year(year: int) -> dict:
    """Scrape all transaction-related pages for a given year."""
    result = {
        "year": year,
        "players_mentioned": set(),
        "trades": [],
        "signings": []
    }
    
    # Free agency page
    free_agency_url = f"https://en.wikipedia.org/wiki/{year}_NBA_free_agency"
    print(f"   📄 Free agency...")
    soup = get_page(free_agency_url)
    if soup:
        result["players_mentioned"].update(extract_player_names_from_page(soup))
        result["signings"].extend(extract_signings_from_lists(soup, year))
    
    # Trade deadline page (usually during season)
    # Try season labels like "2023-24 NBA trades"
    
    # Main season page
    if year < 2025:
        season_url = f"https://en.wikipedia.org/wiki/{year}–{str(year+1)[-2:]}_NBA_season"
        print(f"   📄 Season page...")
        soup = get_page(season_url)
        if soup:
            result["players_mentioned"].update(extract_player_names_from_page(soup))
            result["trades"].extend(extract_trades_from_page(soup, year))
    
    return result

def main():
    print("🏀 Scraping NBA transactions from Wikipedia (2010-2026)")
    print("=" * 60)
    
    all_players = set()
    all_trades = []
    all_signings = []
    
    for year in range(2010, 2027):
        print(f"\n📥 {year}...")
        data = scrape_year(year)
        
        all_players.update(data["players_mentioned"])
        all_trades.extend(data["trades"])
        all_signings.extend(data["signings"])
        
        print(f"   Found: {len(data['players_mentioned'])} players, {len(data['trades'])} trades, {len(data['signings'])} signings")
        time.sleep(0.5)  # Be nice to Wikipedia
    
    print(f"\n✅ Summary:")
    print(f"   Total unique players mentioned: {len(all_players)}")
    print(f"   Total trades: {len(all_trades)}")
    print(f"   Total signings: {len(all_signings)}")
    
    # Save results
    output = {
        "players": sorted(list(all_players)),
        "trades": all_trades,
        "signings": all_signings
    }
    
    output_path = Path("lib/wikipedia_nba_transactions.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Saved to {output_path}")
    
    # Show sample players
    if all_players:
        print("\n📋 Sample players found:")
        for p in sorted(list(all_players))[:20]:
            print(f"   - {p}")

if __name__ == "__main__":
    main()
