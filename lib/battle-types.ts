import { Criteria, NBAPlayer } from "./nba-data"

export interface GridCell {
  player: NBAPlayer | null
  status: 'empty' | 'correct' | 'incorrect'
  owner?: 'host' | 'guest'
}

export interface BattlePlayer {
  id: string
  name: string
  role: 'host' | 'guest'
  avatar?: string // Team Code e.g. 'LAL'
}

export interface BattleState {
  code: string
  grid: GridCell[][]
  criteria: {
    rows: Criteria[]
    cols: Criteria[]
  }
  players: {
    host: BattlePlayer | null
    guest: BattlePlayer | null
  }
  currentTurn: 'host' | 'guest'
  winner: 'host' | 'guest' | 'draw' | null
  turnExpiry?: number // Timestamp (ms)
  roundNumber?: number
  scores?: {
    host: number
    guest: number
  }
  skipVotes?: {
    host: boolean
    guest: boolean
  }
  roundStatus?: 'playing' | 'round_over' | 'finished'
  nextRoundReady?: {
    host: boolean
    guest: boolean
  }
}

export interface BattleMove {
  row: number
  col: number
  player: NBAPlayer
  role: 'host' | 'guest'
}
