from nba_api.stats.endpoints import commonallplayers
from nba_api.stats.endpoints import playercareerstats
import time

print("Testing API connectivity...")

try:
    print("1. Testing CommonAllPlayers...")
    board = commonallplayers.CommonAllPlayers(is_only_current_season=0, timeout=10)
    df = board.get_data_frames()[0]
    print(f"✅ CommonAllPlayers success: {len(df)} players")
except Exception as e:
    print(f"❌ CommonAllPlayers failed: {e}")

try:
    print("2. Testing PlayerCareerStats (LeBron James)...")
    career = playercareerstats.PlayerCareerStats(player_id='2544', timeout=10)
    df = career.get_data_frames()[0]
    print(f"✅ PlayerCareerStats success: {len(df)} rows")
except Exception as e:
    print(f"❌ PlayerCareerStats failed: {e}")
