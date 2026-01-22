import json

main_path = 'lib/players.json'
enriched_path = 'lib/players_enriched.json'

try:
    with open(main_path, 'r') as f:
        main_data = json.load(f)

    with open(enriched_path, 'r') as f:
        enriched_data = json.load(f)

    # Append enriched data to main data
    combined_data = main_data + enriched_data
    
    with open(main_path, 'w') as f:
        json.dump(combined_data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully appended {len(enriched_data)} records from {enriched_path} to {main_path}")

except FileNotFoundError:
    print("One of the files was not found. Skipping append.")
except Exception as e:
    print(f"Error appending data: {e}")
