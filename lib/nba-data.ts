// NBA Players Database with career information
export interface NBAPlayer {
  id: string
  name: string
  teams: string[]
  awards: string[]
  allStar: boolean
  champion: boolean
  championYears: string[]
  mvp: boolean
  dpoy: boolean
  roy: boolean
  allNBA: boolean
  allDefensive: boolean
  college: string
  country: string
  decades: string[]
  ppgCareer: number
  rpgCareer: number
  apgCareer: number
  position: string
  nbaId?: string // Added for headshots
  active?: boolean
}

// Helper to map historical/legacy teams to modern franchises
export function getModernTeam(abbreviation: string): string {
  const mapping: Record<string, string> = {
    // OKC Franchise
    "SEA": "OKC",
    // BKN Franchise
    "NJN": "BKN",
    "NYN": "BKN",
    // LAC Franchise
    "SDC": "LAC",
    "BUF": "LAC",
    // SAC Franchise
    "KCK": "SAC",
    "KCO": "SAC",
    "CIN": "SAC",
    "ROC": "SAC",
    // PHI Franchise
    "SYR": "PHI",
    // GSW Franchise
    "SFW": "GSW",
    "PHL": "GSW",
    // ATL Franchise
    "STL": "ATL",
    "MLH": "ATL",
    "TRI": "ATL",
    // DET Franchise
    "FTW": "DET",
    // LAL Franchise
    "MNL": "LAL",
    // NOP Franchise
    "NOH": "NOP",
    "NOK": "NOP",
    "CHA": "CHA", 
    "CHH": "CHA", 
    // WAS Franchise
    "WSB": "WAS",
    "CAP": "WAS",
    "BAL": "WAS",
    "CHZ": "WAS",
    "CHP": "WAS",
    // HOU Franchise
    "SDR": "HOU",
    // UTA Franchise
    "NOJ": "UTA",
    // MEM Franchise
    "VAN": "MEM",
  };
  return mapping[abbreviation] || abbreviation;
}

export function getTeamLogoUrl(abbreviation: string): string {
  const modernTeam = getModernTeam(abbreviation);
  // Mapping standard NBA codes to ESPN image codes
  const mapping: Record<string, string> = {
    "UTA": "utah",
    "NOP": "no",
    "NYK": "ny",
    "SAS": "sa",
    "GSW": "gs",
    "PHX": "phx",
    "BKN": "bkn",
    "WAS": "wsh"
  }
  const code = mapping[modernTeam] || modernTeam
  return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${code.toLowerCase()}.png`
}


export function getPlayerPhotoUrl(player: NBAPlayer): string {
  if (player.nbaId) {
    return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${player.nbaId}.png`
  }
  // Fallback to a generic player placeholder or a search-based one if possible
  return `https://nba-players.herokuapp.com/players/${player.id.split('-').reverse().join('/')}` 
  // Note: herokuapp might be down, so maybe just a nice avatar.
}

import importedPlayers from './players.json'

export const ALL_NBA_PLAYERS = importedPlayers as unknown as NBAPlayer[];

// Optimization: Create Maps for O(1) access
export const PLAYER_MAP = new Map<string, NBAPlayer>();
export const PLAYER_NAME_MAP = new Map<string, NBAPlayer>();

ALL_NBA_PLAYERS.forEach(p => {
  PLAYER_MAP.set(p.id, p);
  PLAYER_NAME_MAP.set(p.name, p);
  // Also map lowercase name for case-insensitive lookup if needed, 
  // but strictly we usually use exact name or ID.
  // We can add a normalized map if needed for search.
});
export const NBA_PLAYERS = ALL_NBA_PLAYERS // Backward compatibility

// Team info for display
export const NBA_TEAMS: Record<string, { name: string; city: string; colors: string[] }> = {
  ATL: { name: "Hawks", city: "Atlanta", colors: ["#E03A3E", "#C1D32F"] },
  BOS: { name: "Celtics", city: "Boston", colors: ["#007A33", "#BA9653"] },
  BKN: { name: "Nets", city: "Brooklyn", colors: ["#000000", "#FFFFFF"] },
  CHA: { name: "Hornets", city: "Charlotte", colors: ["#1D1160", "#00788C"] },
  CHI: { name: "Bulls", city: "Chicago", colors: ["#CE1141", "#000000"] },
  CLE: { name: "Cavaliers", city: "Cleveland", colors: ["#860038", "#FDBB30"] },
  DAL: { name: "Mavericks", city: "Dallas", colors: ["#00538C", "#002B5E"] },
  DEN: { name: "Nuggets", city: "Denver", colors: ["#0E2240", "#FEC524"] },
  DET: { name: "Pistons", city: "Detroit", colors: ["#C8102E", "#1D42BA"] },
  GSW: { name: "Warriors", city: "Golden State", colors: ["#1D428A", "#FFC72C"] },
  HOU: { name: "Rockets", city: "Houston", colors: ["#CE1141", "#000000"] },
  IND: { name: "Pacers", city: "Indiana", colors: ["#002D62", "#FDBB30"] },
  LAC: { name: "Clippers", city: "LA", colors: ["#C8102E", "#1D428A"] },
  LAL: { name: "Lakers", city: "Los Angeles", colors: ["#552583", "#FDB927"] },
  MEM: { name: "Grizzlies", city: "Memphis", colors: ["#5D76A9", "#12173F"] },
  MIA: { name: "Heat", city: "Miami", colors: ["#98002E", "#F9A01B"] },
  MIL: { name: "Bucks", city: "Milwaukee", colors: ["#00471B", "#EEE1C6"] },
  MIN: { name: "Timberwolves", city: "Minnesota", colors: ["#0C2340", "#236192"] },
  NOH: { name: "Pelicans", city: "New Orleans", colors: ["#0C2340", "#C8102E"] },
  NYK: { name: "Knicks", city: "New York", colors: ["#006BB6", "#F58426"] },
  OKC: { name: "Thunder", city: "Oklahoma City", colors: ["#007AC1", "#EF3B24"] },
  ORL: { name: "Magic", city: "Orlando", colors: ["#0077C0", "#C4CED4"] },
  PHI: { name: "76ers", city: "Philadelphia", colors: ["#006BB6", "#ED174C"] },
  PHX: { name: "Suns", city: "Phoenix", colors: ["#1D1160", "#E56020"] },
  POR: { name: "Trail Blazers", city: "Portland", colors: ["#E03A3E", "#000000"] },
  SAC: { name: "Kings", city: "Sacramento", colors: ["#5A2D81", "#63727A"] },
  SAS: { name: "Spurs", city: "San Antonio", colors: ["#C4CED4", "#000000"] },
  SEA: { name: "SuperSonics", city: "Seattle", colors: ["#00653A", "#FFC200"] },
  TOR: { name: "Raptors", city: "Toronto", colors: ["#CE1141", "#000000"] },
  UTA: { name: "Jazz", city: "Utah", colors: ["#002B5C", "#00471B"] },
  WAS: { name: "Wizards", city: "Washington", colors: ["#002B5C", "#E31837"] },
  NJN: { name: "Nets", city: "New Jersey", colors: ["#002A60", "#CD1041"] }
}

// Criteria types
export type CriteriaType = 
  | "team" 
  | "award" 
  | "allStar" 
  | "champion" 
  | "mvp" 
  | "dpoy" 
  | "roy" 
  | "allNBA" 
  | "allDefensive" 
  | "decade" 
  | "country" 
  | "ppg" 
  | "rpg" 
  | "apg"
  | "position"
  | "draft_pick_1"
  | "draft_top_3"

export interface Criteria {
  type: CriteriaType
  value: string
  label: string
  icon?: string
}

// Generate random criteria pools
export const TEAM_CRITERIA: Criteria[] = [
  { type: "team", value: "ATL", label: "Hawks" },
  { type: "team", value: "BOS", label: "Celtics" },
  { type: "team", value: "BKN", label: "Nets" },
  { type: "team", value: "CHA", label: "Hornets" },
  { type: "team", value: "CHI", label: "Bulls" },
  { type: "team", value: "CLE", label: "Cavaliers" },
  { type: "team", value: "DAL", label: "Mavericks" },
  { type: "team", value: "DEN", label: "Nuggets" },
  { type: "team", value: "DET", label: "Pistons" },
  { type: "team", value: "GSW", label: "Warriors" },
  { type: "team", value: "HOU", label: "Rockets" },
  { type: "team", value: "IND", label: "Pacers" },
  { type: "team", value: "LAC", label: "Clippers" },
  { type: "team", value: "LAL", label: "Lakers" },
  { type: "team", value: "MEM", label: "Grizzlies" },
  { type: "team", value: "MIA", label: "Heat" },
  { type: "team", value: "MIL", label: "Bucks" },
  { type: "team", value: "MIN", label: "Timberwolves" },
  { type: "team", value: "NOP", label: "Pelicans" },
  { type: "team", value: "NYK", label: "Knicks" },
  { type: "team", value: "OKC", label: "Thunder" },
  { type: "team", value: "ORL", label: "Magic" },
  { type: "team", value: "PHI", label: "76ers" },
  { type: "team", value: "PHX", label: "Suns" },
  { type: "team", value: "POR", label: "Trail Blazers" },
  { type: "team", value: "SAC", label: "Kings" },
  { type: "team", value: "SAS", label: "Spurs" },
  { type: "team", value: "TOR", label: "Raptors" },
  { type: "team", value: "UTA", label: "Jazz" },
  { type: "team", value: "WAS", label: "Wizards" },
]

export const AWARD_CRITERIA: Criteria[] = [
  { type: "mvp", value: "true", label: "MVP" },
  { type: "dpoy", value: "true", label: "DPOY" },
  { type: "roy", value: "true", label: "ROY" },
  { type: "champion", value: "true", label: "Champion" },
  { type: "allStar", value: "true", label: "All-Star" },
  { type: "allNBA", value: "true", label: "All-NBA" },
  { type: "allDefensive", value: "true", label: "All-Defensive" },
  { type: "draft_pick_1", value: "true", label: "Picked 1st" },
  { type: "draft_top_3", value: "true", label: "Top 3 Pick" },
]

export const STAT_CRITERIA: Criteria[] = [
  { type: "ppg", value: "20", label: "20+ PTS" },
  { type: "ppg", value: "25", label: "25+ PTS" },
  { type: "rpg", value: "8", label: "8+ REB" },
  { type: "rpg", value: "10", label: "10+ REB" },
  { type: "apg", value: "5", label: "5+ PAD" },
  { type: "apg", value: "8", label: "8+ PAD" },
]

export const DECADE_CRITERIA: Criteria[] = [
  { type: "decade", value: "1990s", label: "Années 90" },
  { type: "decade", value: "2000s", label: "Années 2000" },
  { type: "decade", value: "2010s", label: "Années 2010" },
  { type: "decade", value: "2020s", label: "Années 2020" },
]

export const COUNTRY_CRITERIA: Criteria[] = [
  { type: "country", value: "USA", label: "USA" },
  { type: "country", value: "international", label: "International" },
]

export const POSITION_CRITERIA: Criteria[] = [
  { type: "position", value: "PG", label: "Meneur" },
  { type: "position", value: "SG", label: "Arrière" },
  { type: "position", value: "SF", label: "Ailier" },
  { type: "position", value: "PF", label: "Ailier fort" },
  { type: "position", value: "C", label: "Pivot" },
]

// List of First Overall Picks (User Provided)
// Note: Includes "Akeem Olajuwon" which acts as "Hakeem Olajuwon" alias if needed, 
// but we should probably support both or just normalize.
// For now, simple includes check.
const DRAFT_NUMBER_ONES = [
  "Clifton McNeely", "Andy Tonkovich", "Howie Shannon", "Charlie Share", "Gene Melchiorre", "Mark Workman", "Ray Felix", "Frank Selvy", "Dick Ricketts", "Sihugo Green", "Rod Hundley", "Elgin Baylor", "Bob Boozer", "Oscar Robertson", "Walt Bellamy", "Bill McGill", "Art Heyman", "Jim Barnes", "Fred Hetzel", "Cazzie Russell", "Jimmy Walker", "Elvin Hayes", "Lew Alcindor", "Bob Lanier", "Austin Carr", "LaRue Martin", "Doug Collins", "Bill Walton", "David Thompson", "John Lucas", "Kent Benson", "Mychal Thompson", "Magic Johnson", "Joe Barry Carroll", "Mark Aguirre", "James Worthy", "Ralph Sampson", "Akeem Olajuwon", "Hakeem Olajuwon", "Patrick Ewing", "Brad Daugherty", "David Robinson", "Danny Manning", "Pervis Ellison", "Derrick Coleman", "Larry Johnson", "Shaquille O'Neal", "Chris Webber", "Glenn Robinson", "Joe Smith", "Allen Iverson", "Tim Duncan", "Michael Olowokandi", "Elton Brand", "Kenyon Martin", "Kwame Brown", "Yao Ming", "LeBron James", "Dwight Howard", "Andrew Bogut", "Andrea Bargnani", "Greg Oden", "Derrick Rose", "Blake Griffin", "John Wall", "Kyrie Irving", "Anthony Davis", "Anthony Bennett", "Andrew Wiggins", "Karl-Anthony Towns", "Ben Simmons", "Markelle Fultz", "Deandre Ayton", "Zion Williamson", "Anthony Edwards", "Cade Cunningham", "Paolo Banchero", "Victor Wembanyama", "Zaccharie Risacher", "Cooper Flagg" // Added Hakeem explicitly to safe
].map(n => n.toLowerCase());

// List of Second Overall Picks (User Provided)
const DRAFT_NUMBER_TWOS = [
    // 2021-2025
    "Jalen Green", "Chet Holmgren", "Brandon Miller", "Alex Sarr", "Dylan Harper",
    // 2000-2020
    "James Wiseman", "Ja Morant", "Marvin Bagley", "Lonzo Ball", "Brandon Ingram", "D'Angelo Russell", "Jabari Parker", "Victor Oladipo", "Michael Kidd-Gilchrist", "Derrick Williams", "Evan Turner",
    "Hasheem Thabeet", "Michael Beasley", "Kevin Durant", "LaMarcus Aldridge", "Marvin Williams", "Emeka Okafor", "Darko Milicic", "Jay Williams", "Tyson Chandler", "Stromile Swift",
    // 1980-1999
    "Steve Francis", "Mike Bibby", "Keith Van Horn", "Marcus Camby", "Antonio McDyess", "Jason Kidd", "Shawn Bradley", "Alonzo Mourning", "Kenny Anderson", "Gary Payton",
    "Danny Ferry", "Rik Smits", "Armon Gilliam", "Len Bias", "Wayman Tisdale", "Sam Bowie", "Steve Stipanovich", "Terry Cummings", "Isiah Thomas", "Darrell Griffith",
    // 1960-1979
    "David Greenwood", "Phil Ford", "Otis Birdsong", "Scott May", "David Meyers", "Marvin Barnes", "Jim Brewer", "Bob McAdoo", "Sidney Wicks", "Rudy Tomjanovich",
    "Neal Walk", "Wes Unseld", "Earl Monroe", "Dave Bing", "Rick Barry", "Joe Caldwell", "Rod Thorn", "Paul Hogue", "Tom Stith", "Jerry West",
    // 1950-1959
    "Bailey Howell", "Archie Dees", "Charles Tyra", "Bill Russell", "Maurice Stokes", "Bob Pettit", "Bob Houbregs", "Jim Baechtold", "Mel Hutchins", "Don Rehfeldt"
].map(n => n.toLowerCase());

// List of Third Overall Picks (User Provided)
const DRAFT_NUMBER_THREES = [
    // 2020s
    "V.J. Edgecombe", "Reed Sheppard", "Scoot Henderson", "Jabari Smith Jr.", "Evan Mobley", "LaMelo Ball",
    // 2010s
    "RJ Barrett", "Luka Dončić", "Jayson Tatum", "Jaylen Brown", "Jahlil Okafor", "Joel Embiid", "Otto Porter Jr.", "Bradley Beal", "Enes Kanter", "Derrick Favors",
    // 2000s
    "James Harden", "O.J. Mayo", "Al Horford", "Adam Morrison", "Deron Williams", "Ben Gordon", "Carmelo Anthony", "Mike Dunleavy Jr.", "Pau Gasol", "Darius Miles",
    // 1990s
    "Baron Davis", "Raef LaFrentz", "Chauncey Billups", "Shareef Abdur-Rahim", "Jerry Stackhouse", "Grant Hill", "Penny Hardaway", "Christian Laettner", "Billy Owens", "Chris Jackson", "Mahmoud Abdul-Rauf",
    // 1980s
    "Sean Elliott", "Charles Smith", "Dennis Hopson", "Chris Washburn", "Benoit Benjamin", "Michael Jordan", "Rodney McCray", "Dominique Wilkins", "Buck Williams", "Kevin McHale",
    // 1970s
    "Bill Cartwright", "Rick Robey", "Marques Johnson", "Richard Washington", "Marvin Webster", "Tommy Burleson", "Ernie DiGregorio", "Dwight Davis", "Elmore Smith", "Pete Maravich",
    // 1960s
    "Lucius Allen", "Bob Kauffman", "Clem Haskins", "Clyde Lee", "Dave Stallworth", "Gary Bradds", "Nate Thurmond", "Zelmo Beaty", "Larry Siegfried", "Darrall Imhoff",
    // 1950s & Pre
    "Wilt Chamberlain", "Mike Farmer", "Jim Krebs", "Jim Paxson Sr.", "Jim Loscutoff", "Gene Shue", "Jack Molinas", "Dick Groat", "Marc Freiberger", "Bob Cousy", "Fred Schaus", "George Hauptfuhrer", "Bulbs Ehlers"
].map(n => n.toLowerCase());

// Check if player matches a criteria
export function matchesCriteria(player: NBAPlayer, criteria: Criteria): boolean {
  if (player.name === 'Kevin Durant' || player.name === "Shaquille O'Neal") {
    console.log(`[Validation Debug] Checking KD against ${criteria.label} (${criteria.type})`)
    if (criteria.type === 'team') console.log('Teams:', player.teams, 'Value:', criteria.value)
    if (criteria.type === 'allStar') console.log('AllStar:', player.allStar)
  }

  switch (criteria.type) {
    case "team":
      // Consolidate both player's teams and the criteria team
      const modernCriteriaTeam = getModernTeam(criteria.value);
      return player.teams.some(t => getModernTeam(t) === modernCriteriaTeam);

    case "mvp":
      return player.mvp
    case "dpoy":
      return player.dpoy
    case "roy":
      return player.roy
    case "champion":
      return player.champion
    case "allStar":
      return player.allStar
    case "allNBA":
      return player.allNBA
    case "allDefensive":
      return player.allDefensive
    case "draft_pick_1":
      return DRAFT_NUMBER_ONES.includes(player.name.toLowerCase()) || 
             (player.name === "Hakeem Olajuwon" && DRAFT_NUMBER_ONES.includes("akeem olajuwon")) || 
             (player.name === "Kareem Abdul-Jabbar" && DRAFT_NUMBER_ONES.includes("lew alcindor"));
    case "draft_top_3":
      const name = player.name.toLowerCase();
      return DRAFT_NUMBER_ONES.includes(name) || 
             DRAFT_NUMBER_TWOS.includes(name) || 
             DRAFT_NUMBER_THREES.includes(name) ||
        	   (name === "hakeem olajuwon" && DRAFT_NUMBER_ONES.includes("akeem olajuwon")) || 
             (name === "kareem abdul-jabbar" && DRAFT_NUMBER_ONES.includes("lew alcindor"));
    case "decade":
      return player.decades.includes(criteria.value)
    case "country":
      if (criteria.value === "international") {
        return player.country !== "USA"
      }
      return player.country === criteria.value
    case "ppg":
      return player.ppgCareer >= parseFloat(criteria.value)
    case "rpg":
      return player.rpgCareer >= parseFloat(criteria.value)
    case "apg":
      return player.apgCareer >= parseFloat(criteria.value)
    case "position":
      return player.position === criteria.value
    default:
      return false
  }
}

// Validate if a player matches both row and column criteria
// Validate if a player matches both row and column criteria
export function validatePlayerForCell(
  playerOrName: string | NBAPlayer,
  rowCriteria: Criteria,
  colCriteria: Criteria
): { valid: boolean; player: NBAPlayer | null; reason?: string } {
  let player: NBAPlayer | undefined

  if (typeof playerOrName === "string") {
    const normalizedName = playerOrName.toLowerCase().trim()
    player = ALL_NBA_PLAYERS.find(
      (p) => p.name.toLowerCase() === normalizedName
    )
  } else {
    player = playerOrName
  }

  if (!player) {
    return { valid: false, player: null, reason: "Joueur non trouvé" }
  }

  const matchesRow = matchesCriteria(player, rowCriteria)
  const matchesCol = matchesCriteria(player, colCriteria)

  if (!matchesRow && !matchesCol) {
    return {
      valid: false,
      player,
      reason: `${player.name} ne correspond à aucun critère`,
    }
  }

  if (!matchesRow) {
    return {
      valid: false,
      player,
      reason: `${player.name} ne correspond pas à : ${rowCriteria.label}`,
    }
  }

  if (!matchesCol) {
    return {
      valid: false,
      player,
      reason: `${player.name} ne correspond pas à : ${colCriteria.label}`,
    }
  }

  return { valid: true, player }
}

// Generate a random grid with valid solutions
// Top ~100 Famous Players for Easy Mode
export const FAMOUS_PLAYER_IDS = [
  // Tier 1: Recent Superstars (User Priority)
  "lebron-james", "stephen-curry", "kevin-durant", "giannis-antetokounmpo", "nikola-jokic", 
  "luka-doncic", "jayson-tatum", "joel-embiid", "anthony-edwards", "victor-wembanyama", 
  "ja-morant", "shai-gilgeous-alexander", "devin-booker", "jimmy-butler", "kawhi-leonard",
  "james-harden", "russell-westbrook", "chris-paul", "damian-lillard", "kyrie-irving",
  "anthony-davis", "paul-george", "jaylen-brown", "trae-young", "donovan-mitchell",
  "tyrese-haliburton", "jalen-brunson", "bam-adebayo", "domantas-sabonis", "de-aaron-fox",
  
  // Tier 2: Absolute Legends (Must Keep)
  "michael-jordan", "kobe-bryant", "shaquille-oneal", "tim-duncan", "magic-johnson", 
  "larry-bird", "wilt-chamberlain", "kareem-abdul-jabbar", "bill-russell", "hakeem-olajuwon",
  
  // Tier 3: Other Legends & Stars
  "dirk-nowitzki", "dwyane-wade", "kevin-garnett", "allen-iverson", "steve-nash",
  "charles-barkley", "scottie-pippen", "david-robinson", "john-stockton", "karl-malone",
  "oscar-robertson", "jerry-west", "julius-erving", "moses-malone",
  "carmelo-anthony", "dwight-howard", "paul-pierce", "ray-allen", "reggie-miller", 
  "patrick-ewing", "dominique-wilkins", "isiah-thomas", "clyde-drexler", "james-worthy", 
  "kevin-mchale", "robert-parish", "dennis-rodman", "pau-gasol", "tony-parker", "manu-ginobili", 
  "vince-carter", "tracy-mcgrady", "grant-hill", "jason-kidd", "gary-payton", "dikembe-mutombo",
  "alonzo-mourning", "chris-bosh", "klay-thompson", "draymond-green"
];

export function generateGrid(
  difficulty: "easy" | "medium" | "hard" = "medium",
  size: number = 3,
  excludeValues: string[] = [] // Values to exclude from new grid (e.g. previous criteria values)
): {
  rows: Criteria[]
  cols: Criteria[]
} {
  // Define specific pools based on difficulty
  const majorAwards = AWARD_CRITERIA.filter(c => ["mvp", "champion", "allStar"].includes(c.type));
  const specialistAwards = AWARD_CRITERIA.filter(c => !["mvp", "champion", "allStar"].includes(c.type));

  // Popular teams for Easy mode (High intersection probability)
  const POPULAR_TEAMS = TEAM_CRITERIA.filter(t => 
    ["LAL", "BOS", "GSW", "CHI", "MIA", "SAS", "PHI", "NYK", "HOU", "BKN", "PHX", "CLE", "OKC", "MIL", "DAL", "DEN"].includes(t.value)
  );

  let allCriteria: Criteria[] = [];
  let RETRY_LIMIT = 50;

  if (difficulty === "easy") {
      // Easy: Popular Teams + Major Awards ONLY
      allCriteria.push(...POPULAR_TEAMS);
      allCriteria.push(...majorAwards);
  } 
  else if (difficulty === "medium") {
      // Medium: Teams + Major Awards + Positions + Stats
      allCriteria.push(...TEAM_CRITERIA);
      allCriteria.push(...majorAwards);
      allCriteria.push(...POSITION_CRITERIA);
      allCriteria.push(...STAT_CRITERIA);
  } 
  else {
      // Hard: Everything (Teams + All Awards + Positions + Stats + Decades + Country)
      allCriteria.push(...TEAM_CRITERIA);
      allCriteria.push(...majorAwards);
      allCriteria.push(...specialistAwards);
      allCriteria.push(...POSITION_CRITERIA);
      allCriteria.push(...STAT_CRITERIA);
      allCriteria.push(...DECADE_CRITERIA);
      allCriteria.push(...COUNTRY_CRITERIA);
  }

  // Generation Loop (Retry until valid)
  for (let attempt = 0; attempt < RETRY_LIMIT; attempt++) {
      // Filter out excluded values (from previous rounds)
      const filteredCriteria = excludeValues.length > 0 
        ? allCriteria.filter(c => !excludeValues.includes(c.value))
        : allCriteria
      
      // Shuffle and pick criteria
      const shuffled = [...filteredCriteria].sort(() => Math.random() - 0.5)
      
      const rows: Criteria[] = []
      const cols: Criteria[] = []
      const usedTypes = new Set<string>()

      // Pick row criteria
      for (const criteria of shuffled) {
        if (rows.length >= size) break
        const typeKey = `${criteria.type}-${criteria.value}`
        if (!usedTypes.has(typeKey)) {
          rows.push(criteria)
          usedTypes.add(typeKey)
        }
      }

      // Pick column criteria (different from rows)
      for (const criteria of shuffled) {
        if (cols.length >= size) break
        const typeKey = `${criteria.type}-${criteria.value}`
        if (!usedTypes.has(typeKey)) {
          cols.push(criteria)
          usedTypes.add(typeKey)
        }
      }
      
      // Validation Check for Easy Mode
      // We want to ensure that for EVERY CELL in Easy Mode, there is at least one "Famous Player" 
      // who satisfies the criteria. This guarantees "no-brainer" answers.
      if (difficulty === "easy") {
          let allCellsHaveFamousSolution = true;
          
          for (const row of rows) {
              for (const col of cols) {
                  const validPlayers = findValidPlayersForCell(row, col);
                  // Check if any valid player is in the FAMOUS list
                  const hasFamous = validPlayers.some(p => FAMOUS_PLAYER_IDS.includes(p.id));
                  if (!hasFamous) {
                      allCellsHaveFamousSolution = false;
                      break; 
                  }
              }
              if (!allCellsHaveFamousSolution) break;
          }
          
          if (!allCellsHaveFamousSolution) {
              continue; // Retry generation
          }
      }

      // Check validation for other modes too? For medium/hard we just assume consistency?
      // Actually, for 5x5, we might run out of intersections if we pick random stuff.
      // Ideally we should check if EVERY cell has at least 1 solution for any difficulty.
      // But for now, let's trust the "Retry Limit" logic coupled with Easy check.
      // For 5x5 Hard, it might be tough.
      
      if (rows.length === size && cols.length === size) {
         return { rows, cols }
      }
  }

  // Fallback if retries exhausted (just return the last attempt)
  console.warn("Could not generate perfect grid after retries.");
  // Shuffle one last time for the fallback to ensure variety
  const fallbackShuffled = [...allCriteria].sort(() => Math.random() - 0.5);
  return { 
      rows: fallbackShuffled.slice(0, size), 
      cols: fallbackShuffled.slice(size, size * 2) 
  }
}

// Find all valid players for a cell
export function findValidPlayersForCell(
  rowCriteria: Criteria,
  colCriteria: Criteria
): NBAPlayer[] {
  return ALL_NBA_PLAYERS.filter(
    (player) =>
      matchesCriteria(player, rowCriteria) &&
      matchesCriteria(player, colCriteria)
  )
}

// Get player suggestions based on partial name with Smart Ranking
export function getPlayerSuggestions(query: string, limit = 5): NBAPlayer[] {
  if (!query || query.length < 2) return []
  
  const normalizedQuery = query.toLowerCase().trim()
  
  // 1. Filter candidates (must match at least loosely)
  const candidates = ALL_NBA_PLAYERS.filter(p => 
      p.name.toLowerCase().includes(normalizedQuery)
  );

  // 2. Score candidates
  const scoredCandidates = candidates.map(player => {
      let score = 0;
      const normalizedName = player.name.toLowerCase();
      
      // A. Relevance Matches
      if (normalizedName === normalizedQuery) {
          score += 100; // Perfect match
      } else if (normalizedName.startsWith(normalizedQuery)) {
          score += 75; // Prefix match (e.g. "Leb" -> "LeBron")
      } else if (normalizedName.includes(" " + normalizedQuery)) {
          score += 60; // Start of last name (e.g. "Jam" -> "LeBron James")
      } else {
          score += 10; // Simple substring match (e.g. "ron" -> "LeBron")
      }
      
      // B. Fame / Quality Boosts
      if (FAMOUS_PLAYER_IDS.includes(player.id)) {
          score += 50; // Huge boost for superstars
      }
      
      // Active player small boost (current players are often searched more)
      if (player.active) {
          score += 5;
      }
      
      // All-Star boost (if data available, currently boolean)
      if (player.allStar) {
          score += 20;
      }
      
      // MVP boost
      if (player.mvp) {
          score += 30;
      }

      // Tie-breaker: Short names often strictly clearer or Alphabetical
      // Handled by sort stability or secondary sort

      return { player, score };
  });

  // 3. Sort by Score Descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  // 4. Return top N
  return scoredCandidates.slice(0, limit).map(sc => sc.player);
}

// Get a random notable player for the "Guessing Game"
export function getRandomNotablePlayer(): NBAPlayer {
  // Filter for the "Top 100" most famous players to make the game guessable for average fans.
  // Criteria:
  // 1. Won an MVP or Finals MVP (Legends)
  // 2. 5+ All-Star appearances (Superstars)
  // 3. High Career PPG (> 20.0) with significant career
  // 4. RECENT PLAYERS ONLY (played in 2000s or later)
  
  const candidates = ALL_NBA_PLAYERS.filter(p => {
      // Must have valid ID for photo
      if (!p.nbaId) return false;
      
      // CRITICAL: Only recent players (2000s onwards)
      // Check if player has played in 2000s, 2010s, or 2020s
      const isRecent = p.decades.some(d => d === "2000s" || d === "2010s" || d === "2020s");
      if (!isRecent) return false;
      
      // Auto-include MVPs and Finals MVPs
      if (p.mvp || (p.awards && p.awards.includes("Finals MVP"))) return true;
      
      // Count All-Star appearances (approximated by checking awards list or just assume "All-Star" implies at least 1, 
      // but here we want MULTIPLE. Since we don't store the exact count in this simple schema, 
      // we rely on other proxies like "75th Anniversary" if we had it, or high stats.)
      
      // High Scoring average is a good proxy for fame
      if (p.ppgCareer >= 22.0) return true;
      
      // Recent stars (active with > 20 PPG)
      if (p.active && p.ppgCareer >= 20.0) return true;
      
      // Manual check for "very famous" names based on awards density
      // If they have > 3 types of awards (e.g. All-Star, All-NBA, ROY)
      if (p.awards && p.awards.length >= 3) return true;
      
      return false;
  });
  
  // If pool is too small, fallback to slightly looser criteria (but still recent!)
  if (candidates.length < 50) {
      const backup = ALL_NBA_PLAYERS.filter(p => {
          const isRecent = p.decades.some(d => d === "2000s" || d === "2010s" || d === "2020s");
          return p.nbaId && p.allStar && p.ppgCareer > 18.0 && isRecent;
      });
      if (backup.length > 0) {
          const randomIndex = Math.floor(Math.random() * backup.length);
          return backup[randomIndex];
      }
  }
  
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}
