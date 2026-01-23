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

export function getTeamLogoUrl(abbreviation: string): string {
  // Mapping standard NBA codes to ESPN image codes
  const mapping: Record<string, string> = {
    "UTA": "utah",
    "NOP": "no",
    "NOH": "no",
    "NYK": "ny",
    "SAS": "sa",
    "GSW": "gs",
    "PHX": "phx", // is phx
    "BKN": "bkn",
    "NJN": "bkn", // Fallback
    "SEA": "sea", // or okc fallback? SEA logo exists usually
    "WAS": "wsh"  // Check this one, often wsh
  }
  const code = mapping[abbreviation] || abbreviation
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

const MANUAL_PLAYERS: NBAPlayer[] = [
  {
    id: "lebron-james",
    name: "LeBron James",
    teams: ["CLE", "MIA", "LAL"],
    awards: ["MVP", "Finals MVP", "All-Star MVP"],
    allStar: true,
    champion: true,
    championYears: ["2012", "2013", "2016", "2020"],
    mvp: true,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: true,
    college: "None",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 27.1,
    rpgCareer: 7.5,
    apgCareer: 7.4,
    position: "SF",
    nbaId: "2544",
    active: true
  },
  {
    id: "stephen-curry",
    name: "Stephen Curry",
    teams: ["GSW"],
    awards: ["MVP", "Finals MVP", "All-Star MVP"],
    allStar: true,
    champion: true,
    championYears: ["2015", "2017", "2018", "2022"],
    mvp: true,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Davidson",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 24.8,
    rpgCareer: 4.7,
    apgCareer: 6.4,
    position: "PG",
    nbaId: "201939",
    active: true
  },
  {
    id: "kevin-durant",
    name: "Kevin Durant",
    teams: ["SEA", "OKC", "GSW", "BKN", "PHX", "HOU"],
    awards: ["MVP", "Finals MVP", "All-Star MVP"],
    allStar: true,
    champion: true,
    championYears: ["2017", "2018"],
    mvp: true,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "Texas",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 27.3,
    rpgCareer: 7.0,
    apgCareer: 4.4,
    position: "SF",
    nbaId: "201142",
    active: true
  },
  {
    id: "giannis-antetokounmpo",
    name: "Giannis Antetokounmpo",
    teams: ["MIL"],
    awards: ["MVP", "Finals MVP", "DPOY"],
    allStar: true,
    champion: true,
    championYears: ["2021"],
    mvp: true,
    dpoy: true,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "None",
    country: "Greece",
    decades: ["2010s", "2020s"],
    ppgCareer: 22.6,
    rpgCareer: 9.6,
    apgCareer: 4.7,
    position: "PF",
    nbaId: "203507",
    active: true
  },
  {
    id: "kawhi-leonard",
    name: "Kawhi Leonard",
    teams: ["SAS", "TOR", "LAC"],
    awards: ["Finals MVP", "DPOY"],
    allStar: true,
    champion: true,
    championYears: ["2014", "2019"],
    mvp: false,
    dpoy: true,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "San Diego State",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 19.9,
    rpgCareer: 6.5,
    apgCareer: 3.0,
    position: "SF",
    nbaId: "202695",
    active: true
  },
  {
    id: "james-harden",
    name: "James Harden",
    teams: ["OKC", "HOU", "BKN", "PHI", "LAC"],
    awards: ["MVP"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: true,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Arizona State",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 24.1,
    rpgCareer: 5.6,
    apgCareer: 7.1,
    position: "SG",
    nbaId: "201935",
    active: true
  },
  {
    id: "nikola-jokic",
    name: "Nikola Jokic",
    teams: ["DEN"],
    awards: ["MVP", "Finals MVP"],
    allStar: true,
    champion: true,
    championYears: ["2023"],
    mvp: true,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "None",
    country: "Serbia",
    decades: ["2010s", "2020s"],
    ppgCareer: 20.2,
    rpgCareer: 10.5,
    apgCareer: 6.6,
    position: "C",
    nbaId: "203999",
    active: true
  },
  {
    id: "luka-doncic",
    name: "Luka Doncic",
    teams: ["DAL", "LAL"],
    awards: ["ROY"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "None",
    country: "Slovenia",
    decades: ["2010s", "2020s"],
    ppgCareer: 27.6,
    rpgCareer: 8.6,
    apgCareer: 8.0,
    position: "PG",
    nbaId: "1629029",
    active: true
  },
  {
    id: "kobe-bryant",
    name: "Kobe Bryant",
    teams: ["LAL"],
    awards: ["MVP", "Finals MVP", "All-Star MVP"],
    allStar: true,
    champion: true,
    championYears: ["2000", "2001", "2002", "2009", "2010"],
    mvp: true,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "None",
    country: "USA",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 25.0,
    rpgCareer: 5.2,
    apgCareer: 4.7,
    position: "SG",
    nbaId: "977",
    active: false
  },
  {
    id: "michael-jordan",
    name: "Michael Jordan",
    teams: ["CHI", "WAS"],
    awards: ["MVP", "Finals MVP", "DPOY", "All-Star MVP"],
    allStar: true,
    champion: true,
    championYears: ["1991", "1992", "1993", "1996", "1997", "1998"],
    mvp: true,
    dpoy: true,
    roy: true,
    allNBA: true,
    allDefensive: true,
    college: "North Carolina",
    country: "USA",
    decades: ["1980s", "1990s", "2000s"],
    ppgCareer: 30.1,
    rpgCareer: 6.2,
    apgCareer: 5.3,
    position: "SG",
    nbaId: "893",
    active: false
  },
  {
    id: "tim-duncan",
    name: "Tim Duncan",
    teams: ["SAS"],
    awards: ["MVP", "Finals MVP"],
    allStar: true,
    champion: true,
    championYears: ["1999", "2003", "2005", "2007", "2014"],
    mvp: true,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: true,
    college: "Wake Forest",
    country: "U.S. Virgin Islands",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 19.0,
    rpgCareer: 10.8,
    apgCareer: 3.0,
    position: "PF",
    nbaId: "1495",
    active: false
  },
  {
    id: "shaquille-oneal",
    name: "Shaquille O'Neal",
    teams: ["ORL", "LAL", "MIA", "PHX", "CLE", "BOS"],
    awards: ["MVP", "Finals MVP"],
    allStar: true,
    champion: true,
    championYears: ["2000", "2001", "2002", "2006"],
    mvp: true,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "LSU",
    country: "USA",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 23.7,
    rpgCareer: 10.9,
    apgCareer: 2.5,
    position: "C",
    nbaId: "406",
    active: false
  },
  {
    id: "dwyane-wade",
    name: "Dwyane Wade",
    teams: ["MIA", "CHI", "CLE"],
    awards: ["Finals MVP", "All-Star MVP"],
    allStar: true,
    champion: true,
    championYears: ["2006", "2012", "2013"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "Marquette",
    country: "USA",
    decades: ["2000s", "2010s"],
    ppgCareer: 22.0,
    rpgCareer: 4.7,
    apgCareer: 5.4,
    position: "SG",
    nbaId: "2548",
    active: false
  },
  {
    id: "dirk-nowitzki",
    name: "Dirk Nowitzki",
    teams: ["DAL"],
    awards: ["MVP", "Finals MVP"],
    allStar: true,
    champion: true,
    championYears: ["2011"],
    mvp: true,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "None",
    country: "Germany",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 20.7,
    rpgCareer: 7.5,
    apgCareer: 2.4,
    position: "PF",
    nbaId: "1717",
    active: false
  },
  {
    id: "chris-paul",
    name: "Chris Paul",
    teams: ["NOH", "LAC", "HOU", "OKC", "PHX", "GSW", "SAS"],
    awards: ["ROY", "All-Star MVP"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: true,
    college: "Wake Forest",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 17.5,
    rpgCareer: 4.5,
    apgCareer: 9.4,
    position: "PG",
    nbaId: "101108",
    active: true
  },
  {
    id: "russell-westbrook",
    name: "Russell Westbrook",
    teams: ["OKC", "HOU", "WAS", "LAL", "LAC", "DEN","SAC"],
    awards: ["MVP", "All-Star MVP"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: true,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "UCLA",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 22.0,
    rpgCareer: 7.3,
    apgCareer: 8.3,
    position: "PG",
    nbaId: "201566",
    active: true
  },
  {
    id: "anthony-davis",
    name: "Anthony Davis",
    teams: ["NOH", "LAL", "DAL"],
    awards: ["All-Star MVP"],
    allStar: true,
    champion: true,
    championYears: ["2020"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "Kentucky",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 23.8,
    rpgCareer: 10.3,
    apgCareer: 2.4,
    position: "PF",
    nbaId: "203076",
    active: true
  },
  {
    id: "paul-george",
    name: "Paul George",
    teams: ["IND", "OKC", "LAC", "PHI"],
    awards: [],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "Fresno State",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 20.0,
    rpgCareer: 6.4,
    apgCareer: 3.0,
    position: "SF",
    nbaId: "202331",
    active: true
  },
  {
    id: "kyrie-irving",
    name: "Kyrie Irving",
    teams: ["CLE", "BOS", "BKN", "DAL"],
    awards: ["ROY"],
    allStar: true,
    champion: true,
    championYears: ["2016"],
    mvp: false,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "Duke",
    country: "Australia",
    decades: ["2010s", "2020s"],
    ppgCareer: 23.6,
    rpgCareer: 3.9,
    apgCareer: 5.7,
    position: "PG",
    nbaId: "202681",
    active: true
  },
  {
    id: "jimmy-butler",
    name: "Jimmy Butler",
    teams: ["CHI", "MIN", "PHI", "MIA", "GSW"],
    awards: ["MIP", "All-Star"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "Marquette",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 18.2,
    rpgCareer: 5.3,
    apgCareer: 4.4,
    position: "SF",
    nbaId: "202710",
    active: true
  },
  {
    id: "jayson-tatum",
    name: "Jayson Tatum",
    teams: ["BOS"],
    awards: [],
    allStar: true,
    champion: true,
    championYears: ["2024"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Duke",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 23.1,
    rpgCareer: 7.2,
    apgCareer: 4.0,
    position: "SF",
    nbaId: "1628369",
    active: true
  },
  {
    id: "joel-embiid",
    name: "Joel Embiid",
    teams: ["PHI"],
    awards: ["MVP"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: true,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "Kansas",
    country: "Cameroon",
    decades: ["2010s", "2020s"],
    ppgCareer: 27.2,
    rpgCareer: 11.2,
    apgCareer: 3.4,
    position: "C",
    nbaId: "203954",
    active: true
  },
  {
    id: "damian-lillard",
    name: "Damian Lillard",
    teams: ["POR", "MIL"],
    awards: ["ROY"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "Weber State",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 25.1,
    rpgCareer: 4.2,
    apgCareer: 6.7,
    position: "PG",
    nbaId: "203081",
    active: true
  },
  {
    id: "donovan-mitchell",
    name: "Donovan Mitchell",
    teams: ["UTA", "CLE"],
    awards: [],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Louisville",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 24.5,
    rpgCareer: 4.2,
    apgCareer: 4.8,
    position: "SG",
    nbaId: "1628378",
    active: true
  },
  {
    id: "devin-booker",
    name: "Devin Booker",
    teams: ["PHX"],
    awards: [],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Kentucky",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 23.5,
    rpgCareer: 4.0,
    apgCareer: 4.7,
    position: "SG",
    nbaId: "1626164",
    active: true
  },
  {
    id: "trae-young",
    name: "Trae Young",
    teams: ["ATL"],
    awards: [],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Oklahoma",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 25.3,
    rpgCareer: 3.7,
    apgCareer: 9.5,
    position: "PG",
    nbaId: "1629027",
    active: true
  },
  {
    id: "zion-williamson",
    name: "Zion Williamson",
    teams: ["NOH"],
    awards: [],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Duke",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 25.0,
    rpgCareer: 7.0,
    apgCareer: 4.2,
    position: "PF",
    nbaId: "1629627",
    active: true
  },
  {
    id: "ja-morant",
    name: "Ja Morant",
    teams: ["MEM"],
    awards: ["ROY"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "Murray State",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 22.5,
    rpgCareer: 4.5,
    apgCareer: 7.3,
    position: "PG",
    nbaId: "1629630",
    active: true
  },
  {
    id: "allen-iverson",
    name: "Allen Iverson",
    teams: ["PHI", "DEN", "DET", "MEM"],
    awards: ["MVP", "All-Star MVP"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: true,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "Georgetown",
    country: "USA",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 26.7,
    rpgCareer: 3.7,
    apgCareer: 6.2,
    position: "PG",
    nbaId: "947",
    active: false
  },
  {
    id: "kevin-garnett",
    name: "Kevin Garnett",
    teams: ["MIN", "BOS", "BKN"],
    awards: ["MVP", "DPOY"],
    allStar: true,
    champion: true,
    championYears: ["2008"],
    mvp: true,
    dpoy: true,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "None",
    country: "USA",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 17.8,
    rpgCareer: 10.0,
    apgCareer: 3.7,
    position: "PF",
    nbaId: "708",
    active: false
  },
  {
    id: "paul-pierce",
    name: "Paul Pierce",
    teams: ["BOS", "BKN", "WAS", "LAC"],
    awards: ["Finals MVP"],
    allStar: true,
    champion: true,
    championYears: ["2008"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Kansas",
    country: "USA",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 19.7,
    rpgCareer: 5.6,
    apgCareer: 3.5,
    position: "SF",
    nbaId: "1718",
    active: false
  },
  {
    id: "ray-allen",
    name: "Ray Allen",
    teams: ["MIL", "SEA", "BOS", "MIA"],
    awards: [],
    allStar: true,
    champion: true,
    championYears: ["2008", "2013"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Connecticut",
    country: "USA",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 18.9,
    rpgCareer: 4.1,
    apgCareer: 3.4,
    position: "SG",
    nbaId: "951",
    active: false
  },
  {
    id: "tony-parker",
    name: "Tony Parker",
    teams: ["SAS", "CHA"],
    awards: ["Finals MVP"],
    allStar: true,
    champion: true,
    championYears: ["2003", "2005", "2007", "2014"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "None",
    country: "France",
    decades: ["2000s", "2010s"],
    ppgCareer: 15.5,
    rpgCareer: 2.7,
    apgCareer: 5.6,
    position: "PG",
    nbaId: "2225",
    active: false
  },
  {
    id: "manu-ginobili",
    name: "Manu Ginobili",
    teams: ["SAS"],
    awards: [],
    allStar: true,
    champion: true,
    championYears: ["2003", "2005", "2007", "2014"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "None",
    country: "Argentina",
    decades: ["2000s", "2010s"],
    ppgCareer: 13.3,
    rpgCareer: 3.5,
    apgCareer: 3.8,
    position: "SG",
    nbaId: "1938",
    active: false
  },
  {
    id: "steve-nash",
    name: "Steve Nash",
    teams: ["PHX", "DAL", "LAL"],
    awards: ["MVP"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: true,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Santa Clara",
    country: "Canada",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 14.3,
    rpgCareer: 3.0,
    apgCareer: 8.5,
    position: "PG",
    nbaId: "959",
    active: false
  },
  {
    id: "vince-carter",
    name: "Vince Carter",
    teams: ["TOR", "NJN", "ORL", "PHX", "DAL", "MEM", "SAC", "ATL"],
    awards: ["ROY"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "North Carolina",
    country: "USA",
    decades: ["1990s", "2000s", "2010s", "2020s"],
    ppgCareer: 16.7,
    rpgCareer: 4.3,
    apgCareer: 3.1,
    position: "SG",
    nbaId: "1713",
    active: false
  },
  {
    id: "tracy-mcgrady",
    name: "Tracy McGrady",
    teams: ["TOR", "ORL", "HOU", "NYK", "DET", "ATL", "SAS"],
    awards: [],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "None",
    country: "USA",
    decades: ["1990s", "2000s", "2010s"],
    ppgCareer: 19.6,
    rpgCareer: 5.6,
    apgCareer: 4.4,
    position: "SG",
    nbaId: "1503",
    active: false
  },
  {
    id: "dwight-howard",
    name: "Dwight Howard",
    teams: ["ORL", "LAL", "HOU", "ATL", "CHA", "WAS", "PHI", "TAI"],
    awards: ["DPOY"],
    allStar: true,
    champion: true,
    championYears: ["2020"],
    mvp: false,
    dpoy: true,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "None",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 15.7,
    rpgCareer: 11.8,
    apgCareer: 1.3,
    position: "C",
    nbaId: "2730",
    active: false
  },
  {
    id: "carmelo-anthony",
    name: "Carmelo Anthony",
    teams: ["DEN", "NYK", "OKC", "HOU", "POR", "LAL"],
    awards: [],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Syracuse",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 22.5,
    rpgCareer: 7.0,
    apgCareer: 3.3,
    position: "SF",
    nbaId: "2546",
    active: false
  },
  {
    id: "blake-griffin",
    name: "Blake Griffin",
    teams: ["LAC", "DET", "BKN", "BOS"],
    awards: ["ROY"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "Oklahoma",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 19.8,
    rpgCareer: 8.1,
    apgCareer: 4.2,
    position: "PF",
    nbaId: "201933",
    active: false
  },
  {
    id: "deron-williams",
    name: "Deron Williams",
    teams: ["UTA", "NJN", "DAL", "CLE"],
    awards: [],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Illinois",
    country: "USA",
    decades: ["2000s", "2010s"],
    ppgCareer: 16.3,
    rpgCareer: 3.1,
    apgCareer: 8.1,
    position: "PG",
    nbaId: "101114",
    active: false
  },
  {
    id: "shai-gilgeous-alexander",
    name: "Shai Gilgeous-Alexander",
    teams: ["LAC", "OKC"],
    awards: ["Champion", "All-Star", "MVP", "Finals MVP"],
    allStar: true,
    champion: true,
    championYears: ["2025"],
    mvp: true,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Kentucky",
    country: "Canada",
    decades: ["2010s", "2020s"],
    ppgCareer: 23.0,
    rpgCareer: 4.8,
    apgCareer: 5.5,
    position: "PG",
    nbaId: "1628983",
    active: true
  },
  {
    id: "victor-wembanyama",
    name: "Victor Wembanyama",
    teams: ["SAS"],
    awards: ["ROY"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: true,
    college: "None",
    country: "France",
    decades: ["2020s"],
    ppgCareer: 21.4,
    rpgCareer: 10.6,
    apgCareer: 3.9,
    position: "C",
    nbaId: "1641705",
    active: true
  },
  {
    id: "bam-adebayo",
    name: "Bam Adebayo",
    teams: ["MIA"],
    awards: [],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "Kentucky",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 14.8,
    rpgCareer: 8.8,
    apgCareer: 3.4,
    position: "C",
    nbaId: "1628389",
    active: true
  },
  {
    id: "draymond-green",
    name: "Draymond Green",
    teams: ["GSW"],
    awards: ["DPOY"],
    allStar: true,
    champion: true,
    championYears: ["2015", "2017", "2018", "2022"],
    mvp: false,
    dpoy: true,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "Michigan State",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 8.7,
    rpgCareer: 6.9,
    apgCareer: 5.5,
    position: "PF",
    nbaId: "203110",
    active: true
  },
  {
    id: "klay-thompson",
    name: "Klay Thompson",
    teams: ["GSW", "DAL"],
    awards: [],
    allStar: true,
    champion: true,
    championYears: ["2015", "2017", "2018", "2022"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "Washington State",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 19.6,
    rpgCareer: 3.5,
    apgCareer: 2.3,
    position: "SG",
    nbaId: "202691",
    active: true
  },
  {
    id: "andre-iguodala",
    name: "Andre Iguodala",
    teams: ["PHI", "DEN", "GSW", "MIA"],
    awards: ["Finals MVP"],
    allStar: true,
    champion: true,
    championYears: ["2015", "2017", "2018", "2022"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: false,
    allDefensive: true,
    college: "Arizona",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 11.3,
    rpgCareer: 4.9,
    apgCareer: 4.2,
    position: "SF",
    nbaId: "2738",
    active: false
  },
  {
    id: "rudy-gobert",
    name: "Rudy Gobert",
    teams: ["UTA", "MIN"],
    awards: ["DPOY"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: true,
    roy: false,
    allNBA: true,
    allDefensive: true,
    college: "None",
    country: "France",
    decades: ["2010s", "2020s"],
    ppgCareer: 11.7,
    rpgCareer: 11.7,
    apgCareer: 1.2,
    position: "C",
    nbaId: "203497",
    active: true
  },
  {
    id: "karl-anthony-towns",
    name: "Karl-Anthony Towns",
    teams: ["MIN", "NYK"],
    awards: ["ROY"],
    allStar: true,
    champion: false,
    championYears: [],
    mvp: false,
    dpoy: false,
    roy: true,
    allNBA: true,
    allDefensive: false,
    college: "Kentucky",
    country: "USA",
    decades: ["2010s", "2020s"],
    ppgCareer: 22.8,
    rpgCareer: 10.8,
    apgCareer: 3.2,
    position: "C",
    nbaId: "1626157",
    active: true
  },
  {
    id: "pascal-siakam",
    name: "Pascal Siakam",
    teams: ["TOR", "IND"],
    awards: [],
    allStar: true,
    champion: true,
    championYears: ["2019"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "New Mexico State",
    country: "Cameroon",
    decades: ["2010s", "2020s"],
    ppgCareer: 17.0,
    rpgCareer: 6.7,
    apgCareer: 3.5,
    position: "PF",
    nbaId: "1627783",
    active: true
  },
  {
    id: "kyle-lowry",
    name: "Kyle Lowry",
    teams: ["MEM", "HOU", "TOR", "MIA", "PHI"],
    awards: [],
    allStar: true,
    champion: true,
    championYears: ["2019"],
    mvp: false,
    dpoy: false,
    roy: false,
    allNBA: true,
    allDefensive: false,
    college: "Villanova",
    country: "USA",
    decades: ["2000s", "2010s", "2020s"],
    ppgCareer: 14.2,
    rpgCareer: 4.4,
    apgCareer: 5.9,
    position: "PG",
    nbaId: "200768",
    active: true
  }
]

// Import additional players and merge
import { ADDITIONAL_NBA_PLAYERS } from './additional-nba-data'
import importedPlayers from './players.json'

// Helper to remove duplicates (prefer Manual > Imported > Additional)

const manualIds = new Set(MANUAL_PLAYERS.map(p => p.id));
const manualNames = new Set(MANUAL_PLAYERS.map(p => p.name));

const importedArray = importedPlayers as unknown as NBAPlayer[];
const importedIds = new Set(importedArray.map(p => p.id));
const importedNames = new Set(importedArray.map(p => p.name));

// 1. Keep imported players that aren't in manual list (check ID and Name)
const uniqueImported = importedArray.filter(p => !manualIds.has(p.id) && !manualNames.has(p.name));

// 2. Keep additional players ONLY if they aren't in manual OR imported list (check ID and Name)
const uniqueAdditional = ADDITIONAL_NBA_PLAYERS.filter(p => 
  !manualIds.has(p.id) && !manualNames.has(p.name) &&
  !importedIds.has(p.id) && !importedNames.has(p.name)
);

export const ALL_NBA_PLAYERS = [...MANUAL_PLAYERS, ...uniqueImported, ...uniqueAdditional]
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

// Check if player matches a criteria
export function matchesCriteria(player: NBAPlayer, criteria: Criteria): boolean {
  switch (criteria.type) {
    case "team":
      return player.teams.includes(criteria.value)
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
const FAMOUS_PLAYER_IDS = [
  "lebron-james", "michael-jordan", "kobe-bryant", "stephen-curry", "kevin-durant", "shaquille-oneal",
  "magic-johnson", "larry-bird", "wilt-chamberlain", "kareem-abdul-jabbar", "bill-russell",
  "tim-duncan", "hakeem-olajuwon", "oscar-robertson", "jerry-west", "julius-erving",
  "moses-malone", "karl-malone", "charles-barkley", "john-stockton", "david-robinson",
  "scottie-pippen", "dwyane-wade", "dirk-nowitzki", "kevin-garnett", "allen-iverson",
  "steve-nash", "giannis-antetokounmpo", "nikola-jokic", "luka-doncic", "jayson-tatum",
  "joel-embiid", "kawhi-leonard", "james-harden", "russell-westbrook", "chris-paul",
  "carmelo-anthony", "dwight-howard", "anthony-davis", "kyrie-irving", "damian-lillard",
  "paul-pierce", "ray-allen", "reggie-miller", "patrick-ewing", "dominique-wilkins",
  "isiah-thomas", "clyde-drexler", "james-worthy", "kevin-mchale", "robert-parish",
  "dennis-rodman", "pau-gasol", "tony-parker", "manu-ginobili", "vince-carter",
  "tracy-mcgrady", "grant-hill", "jason-kidd", "gary-payton", "dikembe-mutombo",
  "alonzo-mourning", "chris-bosh", "klay-thompson", "draymond-green", "jimmy-butler",
  "paul-george", "devin-booker", "anthony-edwards", "victor-wembanyama", "zion-williamson",
  "ja-morant", "trae-young", "donovan-mitchell", "shai-gilgeous-alexander", "tyrese-haliburton",
  "jalen-brunson", "bam-adebayo", "jaylen-brown", "domantas-sabonis", "de-aaron-fox"
];

export function generateGrid(
  difficulty: "easy" | "medium" | "hard" = "medium",
  size: number = 3
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
      // Shuffle and pick criteria
      const shuffled = [...allCriteria].sort(() => Math.random() - 0.5)
      
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
  return { 
      rows: allCriteria.slice(0, size), 
      cols: allCriteria.slice(size, size * 2) 
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

// Get player suggestions based on partial name
export function getPlayerSuggestions(query: string, limit = 5): NBAPlayer[] {
  if (!query || query.length < 2) return []
  
  const normalizedQuery = query.toLowerCase()
  return ALL_NBA_PLAYERS
    .filter((p) => p.name.toLowerCase().includes(normalizedQuery))
    .slice(0, limit)
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
