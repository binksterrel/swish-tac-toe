
import json
import time
import os
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats, commonallplayers

# Output file (we will update this file)
DATA_FILE = 'lib/players.json'

def fetch_data():
    print("Reading existing database...")
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            existing_data = json.load(f)
    else:
        existing_data = []
        
    # Create lookup map for existing players
    # Map by nbaId for precise matching
    existing_map = {p.get('nbaId'): p for p in existing_data if p.get('nbaId')}
    # Fallback map by ID (slug)
    slug_map = {p['id']: p for p in existing_data}
    
    print("Fetching all players list from API...")
    try:
        # Try dynamic API fetch (The "God Mode" list)
        print("Attempting to fetch COMPLETE player list from NBA Server (CommonAllPlayers)...")
        # is_only_current_season=0 gets ALL players in history
        board = commonallplayers.CommonAllPlayers(is_only_current_season=0, timeout=30)
        df_players = board.get_data_frames()[0]
        
        # Convert to list of dicts compatible with static format
        # API columns: PERSON_ID, DISPLAY_FIRST_LAST, ROSTERSTATUS, etc.
        nba_players = []
        for _, row in df_players.iterrows():
            nba_players.append({
                'id': row['PERSON_ID'],
                'full_name': row['DISPLAY_FIRST_LAST'],
                'is_active': row['ROSTERSTATUS'] == 1 # Usually 1=Active
            })
            
        print(f"SUCCESS: Retrieved {len(nba_players)} players from LIVE API.")
        
    except Exception as e:
        print(f"WARNING: API List fetch failed ({e}). Falling back to static list.")
        nba_players = players.get_players()

    print(f"Total players to process: {len(nba_players)}")
    print("This will take approximately 1-2 hours. Progress saved every 50 players.")
    
    updates_count = 0
    BATCH_SIZE = 50
    
    for i, player in enumerate(nba_players):
        p_id = str(player['id'])
        name = player['full_name']

        # SMART RESUME: Check if player is already processed in our DB
        # If we have them AND they have >1 team (implies processed) or we marked them processed?
        # Simpler: If they exist and have a populated teams array (length > 0), assume done.
        # But wait, some players purely have 1 team. 
        # Better: We rely on the log progress user sees, OR we just check if they are in existing_map.
        # But user wants to UPDATE them.
        # Let's check if 'nbaId' is present and teams is not empty. 
        # To be safe for "Resume", we can skip if they are in existing_map. 
        # BUT if the user wants to retry failed ones, we shouldn't skip.
        # compromise: check if we have data for them.
        
        existing_p = existing_map.get(p_id)
        if existing_p and len(existing_p.get('teams', [])) > 0:
             # Already processed/imported. Skip to save time.
             # Unless we specifically want to refresh.
             # User said "Resume".
             # print(f"Skipping {name} (Already in DB)")
             continue

        try:
            name = player['full_name']
            p_id = str(player['id'])
            
            # 1. Try match by nbaId
            target_player = existing_map.get(p_id)
            
            # 2. Try match by generated slug
            if not target_player:
                slug_id = name.lower().replace(" ", "-").replace(".", "").replace("'", "")
                target_player = slug_map.get(slug_id)
            
            # OPTIMIZATION: If player already has multiple teams (likely manually updated or active fetch), 
            # we might skip to save time? 
            # User wants "Closest to reality". Let's Update EVERYONE unless clearly done.
            # But to make it resumable, maybe check if we have a flag?
            # Let's just run it. 
            
            # Fetch Career Stats
            try:
                career = playercareerstats.PlayerCareerStats(player_id=p_id, timeout=10) # Add timeout
                df = career.get_data_frames()[0]
                teams = df['TEAM_ABBREVIATION'].unique().tolist()
                teams = [t for t in teams if t != 'TOT']
                
                # If existing player, update
                if target_player:
                    target_player['teams'] = teams
                    # Don't overwrite active status blindly, relying on API list
                    target_player['active'] = player['is_active']
                    if not target_player.get('nbaId'):
                        target_player['nbaId'] = p_id
                    print(f"[{i+1}/{len(nba_players)}] Updated {name}: {teams}")
                else:
                    # Create New
                    slug_id = name.lower().replace(" ", "-").replace(".", "").replace("'", "")
                    new_player = {
                        "id": slug_id,
                        "name": name,
                        "teams": teams,
                        "awards": [],
                        "allStar": False,
                        "champion": False,
                        "championYears": [],
                        "mvp": False,
                        "dpoy": False,
                        "roy": False,
                        "allNBA": False,
                        "allDefensive": False,
                        "college": "",
                        "country": "USA", 
                        "decades": [], 
                        "ppgCareer": 0,
                        "rpgCareer": 0,
                        "apgCareer": 0,
                        "position": "",
                        "nbaId": p_id,
                        "active": player['is_active']
                    }
                    existing_data.append(new_player)
                    slug_map[slug_id] = new_player
                    existing_map[p_id] = new_player
                    print(f"[{i+1}/{len(nba_players)}] Added NEW {name}: {teams}")

                updates_count += 1
                
                # BATCH SAVE
                if updates_count % BATCH_SIZE == 0:
                    print(f"--- Saving Batch ({updates_count} updated) ---")
                    with open(DATA_FILE, 'w') as f:
                        json.dump(existing_data, f, indent=2)

            except Exception as api_err:
                 print(f"API Error for {name}: {api_err}")
                 time.sleep(5) # Increased Backoff on error

            # Be nice to the API (Increased delay to avoid timeouts)
            time.sleep(1.5)

        except Exception as e:
            print(f"Error processing {player['full_name']}: {e}")

    # Final Save
    with open(DATA_FILE, 'w') as f:
        json.dump(existing_data, f, indent=2)
    
    print(f"Updated {updates_count} players in {DATA_FILE}")
if __name__ == "__main__":
    fetch_data()
