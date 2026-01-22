import json
import time
import os
import random
from datetime import datetime
from nba_api.stats.endpoints import commonallplayers, playercareerstats, playerawards

# Configuration
DATA_FILE = 'lib/players.json'
TARGET_COUNT = 550 # Aim for a bit more than 500 to be safe
BATCH_SAVE = 10

def get_recent_players_list():
    """Fetch all players and filter for the most recent ~500."""
    print("📋 Fetching complete player list from NBA API...")
    try:
        # Fetch all players
        board = commonallplayers.CommonAllPlayers(is_only_current_season=0, timeout=60)
        df = board.get_data_frames()[0]
        
        # Ensure numeric columns for sorting
        df['TO_YEAR'] = df['TO_YEAR'].astype(int)
        df['FROM_YEAR'] = df['FROM_YEAR'].astype(int)
        
        # Sort by TO_YEAR desc (most recent), then FROM_YEAR desc (youngest among same exit year)
        # This prioritizes Active players (TO_YEAR=current) and recently retired.
        df_sorted = df.sort_values(by=['TO_YEAR', 'FROM_YEAR'], ascending=[False, False])
        
        # Take next batch (550 to 1100)
        top_players = df_sorted.iloc[550:1100]
        
        players_list = []
        for _, row in top_players.iterrows():
            players_list.append({
                'id': str(row['PERSON_ID']),
                'name': row['DISPLAY_FIRST_LAST'],
                'active': row['ROSTERSTATUS'] == 1,
                'from_year': row['FROM_YEAR'],
                'to_year': row['TO_YEAR']
            })
            
        print(f"✅ Selected {len(players_list)} players (From {players_list[-1]['to_year']} to {players_list[0]['to_year']})")
        return players_list

    except Exception as e:
        print(f"❌ Error fetching player list: {e}")
        return []

def fetch_with_retry(endpoint_class, player_name="Unknown", **kwargs):
    """Helper to fetch data with retries."""
    last_error = None
    for attempt in range(3):
        try:
            return endpoint_class(**kwargs, timeout=25)
        except Exception as e:
            last_error = e
            print(f"   ⚠️ Timeout/Error for {player_name}, retrying ({attempt+1}/3)...")
            time.sleep(2 * (attempt + 1))
    raise last_error

def fetch_player_details(player_id, player_name):
    """Fetch Teams and Awards for a specific player."""
    data = {
        'teams': [],
        'awards': [],
        'championYears': [],
        'allStar': False,
        'champion': False,
        'mvp': False,
        'dpoy': False,
        'roy': False,
        'allNBA': False,
        'allDefensive': False
    }
    
    try:
        # 1. Fetch Career Stats (Teams)
        # Random sleep to de-sync threads and respect rate limits
        time.sleep(random.uniform(3.0, 6.0))
        
        career = fetch_with_retry(playercareerstats.PlayerCareerStats, player_name=player_name, player_id=player_id)
        df_career = career.get_data_frames()[0]
        teams = df_career['TEAM_ABBREVIATION'].unique().tolist()
        data['teams'] = [t for t in teams if t != 'TOT' and t != '']

        # 2. Fetch Awards
        time.sleep(0.5)
        aw = fetch_with_retry(playerawards.PlayerAwards, player_name=player_name, player_id=player_id)
        df_awards = aw.get_data_frames()[0]
        
        for _, row in df_awards.iterrows():
            desc = row['DESCRIPTION']
            # award_type = row['AWARD'] # Caused KeyError
            
            # Map API Award names to our Schema
            
            if 'Champion' in desc:
                data['champion'] = True
                season = row['SEASON'] # e.g. "2023-24"
                if '-' in season:
                    year = "20" + season.split('-')[1]
                    if year not in data['championYears']:
                        data['championYears'].append(year)
            
            if 'Most Valuable Player' in desc:
                data['mvp'] = True
                if 'MVP' not in data['awards']: data['awards'].append('MVP')
            
            if 'Defensive Player of the Year' in desc:
                data['dpoy'] = True
                if 'DPOY' not in data['awards']: data['awards'].append('DPOY')
                
            if 'Rookie of the Year' in desc:
                data['roy'] = True
                if 'ROY' not in data['awards']: data['awards'].append('ROY')
                
            if 'All-Star' in desc:
                data['allStar'] = True
                if 'All-Star' not in data['awards']: data['awards'].append('All-Star')
                
            if 'All-NBA' in desc:
                data['allNBA'] = True
            
            if 'All-Defensive' in desc:
                 data['allDefensive'] = True
            
            if 'Finals MVP' in desc:
                if 'Finals MVP' not in data['awards']: data['awards'].append('Finals MVP')

        # Clean lists
        data['championYears'].sort()
        if data['champion']: 
            if 'Champion' not in data['awards']: data['awards'].insert(0, 'Champion')
            
        return data

    except Exception as e:
        print(f"⚠️ Error fetching details for {player_name}: {e}")
        return None

def load_existing_db():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def main():
    print("🚀 Starting GOD MODE Data Update (Top 500 Recent)...")
    
    # 1. Get List
    target_players = get_recent_players_list()
    if not target_players:
        print("Stopping due to empty list.")
        return

    # 2. Load DB
    existing_db = load_existing_db()
    existing_map_nba_id = {str(p.get('nbaId')): p for p in existing_db if p.get('nbaId')}
    existing_map_slug = {p['id']: p for p in existing_db}
    
    # Multi-threading for speed (Max 5 workers to respect rate limits)
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    updates_count = 0
    MAX_WORKERS = 1
    
    today_date = datetime.now().strftime("%Y-%m-%d")
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_player = {}
        for p in target_players:
            pid = p['id']
            if os.path.exists("god_mode_progress.txt"):
                with open("god_mode_progress.txt", "r") as f:
                    done_ids = f.read().splitlines()
                if pid in done_ids:
                    # Silent skip to reduce noise, or just print a summary later
                    # print(f"⏩ Skipping {p['name']} (Already processed)")
                    continue

            # Submit processing
            print(f"⏳ Queuing {p['name']}...")
            future_to_player[executor.submit(fetch_player_details, pid, p['name'])] = p

        for future in as_completed(future_to_player):
            p_info = future_to_player[future]
            pid = p_info['id']
            name = p_info['name']
            
            try:
                details = future.result()
                if details:
                    # Update Progress Log immediately
                    with open("god_mode_progress.txt", "a") as log:
                        log.write(f"{pid}\n")
                if details:
                    # Find in DB (Refresh map or use thread-safe lock if modifying shared dict? 
                    # Python dicts are thread-safe for single ops, but logic here is complex.
                    # Better to collect results and apply them sequentially or just trust the serialized loop here.)
                    # Note: 'as_completed' yields results as they finish, so this loop IS sequential.
                    
                    db_player = existing_map_nba_id.get(pid)
                    if not db_player:
                        slug = name.lower().replace(" ", "-").replace(".", "").replace("'", "")
                        db_player = existing_map_slug.get(slug)
                    
                    if db_player:
                        db_player['teams'] = details['teams']
                        db_player['awards'] = details['awards']
                        db_player['championYears'] = details['championYears']
                        db_player['allStar'] = details['allStar']
                        db_player['champion'] = details['champion']
                        db_player['mvp'] = details['mvp']
                        db_player['dpoy'] = details['dpoy']
                        db_player['roy'] = details['roy']
                        db_player['allNBA'] = details['allNBA']
                        db_player['allDefensive'] = details['allDefensive']
                        db_player['nbaId'] = pid
                        db_player['active'] = p_info['active']
                        print(f"   ✅ Updated {name}")
                    else:
                        slug = name.lower().replace(" ", "-").replace(".", "").replace("'", "")
                        new_player = {
                            "id": slug,
                            "name": name,
                            "teams": details['teams'],
                            "awards": details['awards'],
                            "allStar": details['allStar'],
                            "champion": details['champion'],
                            "championYears": details['championYears'],
                            "mvp": details['mvp'],
                            "dpoy": details['dpoy'],
                            "roy": details['roy'],
                            "allNBA": details['allNBA'],
                            "allDefensive": details['allDefensive'],
                            "college": "",
                            "country": "USA",
                            "decades": [],
                            "ppgCareer": 0,
                            "rpgCareer": 0,
                            "apgCareer": 0,
                            "position": "G-F",
                            "nbaId": pid,
                            "active": p_info['active']
                        }
                        
                        start_year = p_info['from_year']
                        end_year = p_info['to_year']
                        decades = set()
                        for y in range(start_year, end_year + 1):
                            dec = (y // 10) * 10
                            decades.add(f"{dec}s")
                        new_player['decades'] = sorted(list(decades))
                        
                        existing_db.append(new_player)
                        existing_map_nba_id[pid] = new_player
                        print(f"   ✨ Created {name}")

                    updates_count += 1
                    
                    if updates_count % BATCH_SAVE == 0:
                        with open(DATA_FILE, 'w') as f:
                            json.dump(existing_db, f, indent=2)
                        print(f"   💾 Saved batch {updates_count}")
                        
            except Exception as e:
                print(f"   ❌ Error processing {name}: {e}")

    # Final Save
    with open(DATA_FILE, 'w') as f:
        json.dump(existing_db, f, indent=2)
    print("🏁 God Mode Update Complete!")

if __name__ == "__main__":
    main()
