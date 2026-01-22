from nba_api.stats.endpoints import playercareerstats, playerawards
import time

PLAYER_ID = '203476' # Gorgui Dieng
PLAYER_NAME = 'Gorgui Dieng'

print(f"Testing API for {PLAYER_NAME} ({PLAYER_ID})...")

try:
    print("1. Testing PlayerCareerStats...")
    career = playercareerstats.PlayerCareerStats(player_id=PLAYER_ID, timeout=25)
    df = career.get_data_frames()[0]
    print(f"✅ PlayerCareerStats success: {len(df)} rows")
    print(df['TEAM_ABBREVIATION'].unique().tolist())
except Exception as e:
    print(f"❌ PlayerCareerStats failed: {e}")

try:
    print("2. Testing PlayerAwards...")
    aw = playerawards.PlayerAwards(player_id=PLAYER_ID, timeout=25)
    df = aw.get_data_frames()[0]
    print(f"✅ PlayerAwards success: {len(df)} rows")
except Exception as e:
    print(f"❌ PlayerAwards failed: {e}")
