
import json
import time
import os
import random
from nba_api.stats.endpoints import playerawards
import pandas as pd

# Files
DATA_FILE = 'lib/players.json'

def fetch_awards():
    print(f"Reading database: {DATA_FILE}")
    if not os.path.exists(DATA_FILE):
        print("Error: players.json not found.")
        return

    with open(DATA_FILE, 'r') as f:
        players = json.load(f)

    # Filter players with valid NBA IDs
    # processing_queue = [p for p in players if p.get('nbaId') and p.get('active', False) == True] # Maybe prioritize active?
    # User said "pour tout le monde" (for everyone).
    processing_queue = [p for p in players if p.get('nbaId')]
    
    print(f"Total players with NBA ID: {len(processing_queue)}")

    updates_count = 0
    BATCH_SIZE = 20
    errors_count = 0

    # Load requests locally to handle exceptions if possible, or just rely on general Exception
    from requests.exceptions import ReadTimeout, ConnectionError, RequestException

    # We iterate through the main list reference so we update objects in place
    for i, player in enumerate(players):
        nba_id = player.get('nbaId')
        
        # Skip if no NBA ID
        if not nba_id:
            continue

        # Resume Logic: Skip if already checked
        if player.get('awards_checked') is True:
             continue
            
        # Log progress every 10
        if i % 10 == 0:
            print(f"[{i+1}/{len(players)}] Processing {player['name']}...")

        retries = 3
        success = False
        
        while retries > 0 and not success:
            try:
                # Fetch Awards with longer timeout
                awards_endpoint = playerawards.PlayerAwards(player_id=nba_id, timeout=30)
                df = awards_endpoint.get_data_frames()[0]
                
                # Mark as checked
                player['awards_checked'] = True
                
                # Reset fields
                player['allStar'] = False
                player['mvp'] = False
                player['dpoy'] = False
                player['roy'] = False
                player['allNBA'] = False
                player['allDefensive'] = False
                player['champion'] = False
                player['championYears'] = []
                player['awards'] = []
                
                # Helper
                def add_award_tag(tag):
                    if tag not in player['awards']:
                        player['awards'].append(tag)

                descriptions = df['DESCRIPTION'].unique().tolist()
                
                # Parsing logic same as before...
                # 1. MVP
                if "NBA Most Valuable Player" in descriptions:
                    player['mvp'] = True
                    add_award_tag("MVP")
                
                # 2. DPOY
                has_dpoy = any("Defensive Player of the Year" in d for d in descriptions)
                if has_dpoy:
                    player['dpoy'] = True
                    add_award_tag("DPOY")

                # 3. ROY
                if "NBA Rookie of the Year" in descriptions:
                    player['roy'] = True
                    add_award_tag("ROY")

                # 4. All-Star
                if "NBA All-Star" in descriptions:
                    player['allStar'] = True
                    add_award_tag("All-Star")
                
                # 5. All-NBA
                if "All-NBA" in descriptions:
                    player['allNBA'] = True
                    
                # 6. All-Defensive
                if "All-Defensive Team" in descriptions:
                    player['allDefensive'] = True
                
                # 7. Champion
                champ_rows = df[df['DESCRIPTION'] == "NBA Champion"]
                if not champ_rows.empty:
                    player['champion'] = True
                    add_award_tag("Champion")
                    years = champ_rows['SEASON'].tolist()
                    formatted_years = []
                    for y in years:
                        try:
                            parts = y.split('-')
                            if len(parts) == 2:
                                full_year = parts[0][:2] + parts[1]
                                formatted_years.append(full_year)
                            else:
                                formatted_years.append(y)
                        except:
                            formatted_years.append(y)
                    player['championYears'] = sorted(list(set(formatted_years)))

                # 8. Finals MVP
                if "NBA Finals Most Valuable Player" in descriptions:
                    add_award_tag("Finals MVP")

                # 9. All-Star MVP
                if "NBA All-Star Most Valuable Player" in descriptions:
                    add_award_tag("All-Star MVP")
                    
                updates_count += 1
                if player['awards']:
                    print(f"   🏆 {player['name']}: {player['awards']}")
                
                success = True
                # Small sleep on success
                time.sleep(1.2)

            except Exception as e:
                retries -= 1
                if retries > 0:
                    wait_time = (3 - retries) * 5 + random.random() * 2 # 5s, 10s...
                    print(f"   ⚠️ Timeout/Error for {player['name']}. Retrying in {wait_time:.1f}s... ({e})")
                    time.sleep(wait_time)
                else:
                    print(f"❌ Failed to fetch {player['name']} after 3 attempts. Skipping.")
                    errors_count += 1

        # Batch Save every 20
        if (i + 1) % BATCH_SIZE == 0:
            print(f"--- Saving Batch (Processed {i+1} / {len(players)}) ---")
            with open(DATA_FILE, 'w') as f:
                json.dump(players, f, indent=2)

    # Final Save
    print("--- Final Save ---")
    with open(DATA_FILE, 'w') as f:
        json.dump(players, f, indent=2) 
    
    print(f"\nDONE! Processed {updates_count} players. Errors: {errors_count}")

if __name__ == "__main__":
    fetch_awards()
