#!/usr/bin/env python3
"""
Generate a list of which MANUAL_PLAYERS should have active: true
Based on 2025-26 NBA season
"""

# Players who are still active as of 2025-26 season
ACTIVE_PLAYERS_2025 = {
    "lebron-james": True,
    "stephen-curry": True,
    "kevin-durant": True,
    "russell-westbrook": True,
    "james-harden": True,
    "chris-paul": True,
    "damian-lillard": True,
    "anthony-davis": True,
    "kawhi-leonard": True,
    "paul-george": True,
    "jimmy-butler": True,
    "kyrie-irving": True,
    "giannis-antetokounmpo": True,
    "nikola-jokic": True,
    "joel-embiid": True,
    "luka-doncic": True,
    "jayson-tatum": True,
    "devin-booker": True,
    "donovan-mitchell": True,
    "trae-young": True,
    "anthony-edwards": True,
    "ja-morant": True,
    "shai-gilgeous-alexander": True,
    "tyrese-haliburton": True,
    "lamelo-ball": True,
    "zion-williamson": True,
    "victor-wembanyama": True,
    "draymond-green": True,
    "klay-thompson": True,
    "bam-adebayo": True,
    "jaylen-brown": True,
    "deaaron-fox": True,
    "karl-anthony-towns": True,
    "rudy-gobert": True,
    "pascal-siakam": True,
    "kyle-lowry": True,
    "andre-iguodala": False,  # Retired
    
    # Legends - all retired
    "michael-jordan": False,
    "kobe-bryant": False,
    "magic-johnson": False,
    "larry-bird": False,
    "tim-duncan": False,
    "shaquille-oneal": False,
    "hakeem-olajuwon": False,
    "kareem-abdul-jabbar": False,
    "wilt-chamberlain": False,
    "bill-russell": False,
    "oscar-robertson": False,
    "jerry-west": False,
    "julius-erving": False,
    "charles-barkley": False,
    "karl-malone": False,
    "john-stockton": False,
    "scottie-pippen": False,
    "allen-iverson": False,
    "dwyane-wade": False,
    "dirk-nowitzki": False,
    "kevin-garnett": False,
    "paul-pierce": False,
    "ray-allen": False,
    "steve-nash": False,
    "vince-carter": False,
    "tracy-mcgrady": False,
    "dwight-howard": False,
    "carmelo-anthony": False,
    "blake-griffin": False,
    "deron-williams": False,
}

print("# Active status for MANUAL_PLAYERS\n")
print("Active players:")
for player_id, is_active in sorted(ACTIVE_PLAYERS_2025.items()):
    if is_active:
        print(f"  - {player_id}")

print("\nRetired players:")
for player_id, is_active in sorted(ACTIVE_PLAYERS_2025.items()):
    if not is_active:
        print(f"  - {player_id}")
