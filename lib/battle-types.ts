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
  rematchVotes?: {
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

// Type for Supabase DB updates (partial updates to battles table)
export interface BattleDbUpdate {
  grid?: GridCell[][]
  current_turn?: 'host' | 'guest'
  winner?: 'host' | 'guest' | 'draw' | null
  turn_expiry?: number | null
  host_score?: number
  guest_score?: number
  round_number?: number
  round_status?: 'playing' | 'round_over' | 'finished'
  status?: 'waiting' | 'playing' | 'finished'
  skip_votes?: { host: boolean; guest: boolean }
  next_round_ready?: { host: boolean; guest: boolean }
  rematch_votes?: { host: boolean; guest: boolean }
  criteria?: { rows: Criteria[]; cols: Criteria[] }
}

