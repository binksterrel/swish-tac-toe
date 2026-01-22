from nba_api.stats.endpoints import commonallplayers
import pandas as pd

print("Fetching player list to identify blocking player...")
try:
    board = commonallplayers.CommonAllPlayers(is_only_current_season=0, timeout=60)
    df = board.get_data_frames()[0]
    
    df['TO_YEAR'] = df['TO_YEAR'].astype(int)
    df['FROM_YEAR'] = df['FROM_YEAR'].astype(int)
    
    df_sorted = df.sort_values(by=['TO_YEAR', 'FROM_YEAR'], ascending=[False, False])
    
    # We suspect the stick point is after Matthew Dellavedova (203521).
    # Let's find his index and show the next 5 players.
    
    print("\n--- Players around Matthew Dellavedova ---")
    
    # Find index of 203521
    # df_sorted is a dataframe. Reset index to verify position.
    df_sorted = df_sorted.reset_index(drop=True)
    
    # Locate row
    match = df_sorted[df_sorted['PERSON_ID'] == 203521]
    if not match.empty:
        idx = match.index[0]
        print(f"Found Matthew Dellavedova at index {idx}")
        
        subset = df_sorted.iloc[idx:idx+10]
        for i, (real_idx, row) in enumerate(subset.iterrows()):
            print(f"Index {real_idx}: {row['DISPLAY_FIRST_LAST']} (ID: {row['PERSON_ID']}) - {row['TO_YEAR']}")
    else:
        print("Matthew Dellavedova NOT FOUND in sorted list??")

except Exception as e:
    print(e)
