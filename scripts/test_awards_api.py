
from nba_api.stats.endpoints import playerawards
import pandas as pd

# LeBron James ID: 2544
player_id = '2544'

try:
    print(f"Fetching awards for Player ID {player_id}...")
    awards = playerawards.PlayerAwards(player_id=player_id)
    df = awards.get_data_frames()[0]
    
    print("\n--- Columns ---")
    print(df.columns.tolist())
    
    print("\n--- First 5 Rows ---")
    print(df.head().to_string())
    
    print("\n--- Unique Award Descriptions ---")
    print(df['DESCRIPTION'].unique().tolist())

except Exception as e:
    print(f"Error: {e}")
