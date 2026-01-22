from nba_api.stats.endpoints import commonallplayers
import pandas as pd

print("Fetching player list to identify current batch...")
try:
    board = commonallplayers.CommonAllPlayers(is_only_current_season=0, timeout=60)
    df = board.get_data_frames()[0]
    
    df['TO_YEAR'] = df['TO_YEAR'].astype(int)
    df['FROM_YEAR'] = df['FROM_YEAR'].astype(int)
    
    df_sorted = df.sort_values(by=['TO_YEAR', 'FROM_YEAR'], ascending=[False, False])
    
    # We are interested in index 822 (0-indexed relative to the start of processing?)
    # The script processes a batch from 550 to 1100.
    # The progress file contains raw IDs. 
    # If the progress file has 822 lines, and we started fresh (or appended?), 
    # it means we have processed 822 players TOTAL?
    # Wait, 822 players in the file.
    # The first batch was 0-549 (approx 550 players).
    # The second batch starts at 550.
    # If file has 822 lines, and 549 were from batch 1...
    # Then 822 - 549 = 273 players processed in Batch 2.
    # So we are at offset 550 + 273 = 823 in the sorted list.
    
    print("\n--- Players around index 823 (Batch 2 progress) ---")
    subset = df_sorted.iloc[820:835]
    for i, (idx, row) in enumerate(subset.iterrows()):
        real_idx = 820 + i
        print(f"Index {real_idx}: {row['DISPLAY_FIRST_LAST']} (ID: {row['PERSON_ID']}) - {row['TO_YEAR']}")

except Exception as e:
    print(e)
