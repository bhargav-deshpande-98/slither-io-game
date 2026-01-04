import type { SnakePattern } from './constants'

export type GameState = 'start' | 'playing' | 'gameover'

export interface Vector2 {
  x: number
  y: number
}

export interface Segment {
  x: number
  y: number
}

export interface Snake {
  id: string
  segments: Segment[]
  angle: number
  targetAngle: number
  speed: number
  isBoosting: boolean
  isPlayer: boolean
  pattern: SnakePattern
  name: string
  isAlive: boolean
  length: number // Visual length counter
}

export interface Food {
  id: string
  x: number
  y: number
  color: string
  value: number
  isChase: boolean // Chase pellets flee from snakes
  angle?: number // For chase pellet movement
}

export interface BoostPellet {
  id: string
  x: number
  y: number
  color: string
  value: number
  lifetime: number
}

export interface Camera {
  x: number
  y: number
  zoom: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  length: number
  isPlayer: boolean
}

export interface GameData {
  gameState: GameState
  player: Snake | null
  aiSnakes: Snake[]
  food: Food[]
  boostPellets: BoostPellet[]
  camera: Camera
  mouseX: number
  mouseY: number
  score: number
  highScore: number
  leaderboard: LeaderboardEntry[]
}
