// World configuration
export const WORLD_SIZE = 4000
export const GRID_SIZE = 50

// Snake configuration
export const INITIAL_LENGTH = 10
export const SEGMENT_RADIUS = 8
export const SEGMENT_SPACING = 5
export const BASE_SPEED = 3.5
export const BOOST_SPEED = 7
export const BOOST_COST = 0.3 // Segments lost per frame while boosting
export const MIN_BOOST_LENGTH = 10
export const TURN_SPEED = 0.12

// Food configuration
export const FOOD_COUNT = 800
export const FOOD_RADIUS = 4
export const FOOD_VALUE = 1
export const DEATH_FOOD_VALUE = 2
export const BOOST_PELLET_VALUE = 0.5

// Chase pellet configuration (special orbs that flee)
export const CHASE_PELLET_COUNT = 20
export const CHASE_PELLET_VALUE = 10
export const CHASE_PELLET_SPEED = 2
export const CHASE_PELLET_FLEE_DISTANCE = 150

// AI configuration
export const AI_COUNT = 15
export const AI_VISION_RANGE = 300

// Snake color patterns (neon style)
export const SNAKE_PATTERNS = [
  { primary: '#FF0066', secondary: '#FF3388', glow: '#FF0066' },
  { primary: '#00FFFF', secondary: '#66FFFF', glow: '#00FFFF' },
  { primary: '#FFFF00', secondary: '#FFFF66', glow: '#FFFF00' },
  { primary: '#FF6600', secondary: '#FF8833', glow: '#FF6600' },
  { primary: '#00FF00', secondary: '#66FF66', glow: '#00FF00' },
  { primary: '#FF00FF', secondary: '#FF66FF', glow: '#FF00FF' },
  { primary: '#00FF99', secondary: '#66FFBB', glow: '#00FF99' },
  { primary: '#FF3333', secondary: '#FF6666', glow: '#FF3333' },
  { primary: '#3399FF', secondary: '#66BBFF', glow: '#3399FF' },
  { primary: '#FFCC00', secondary: '#FFDD66', glow: '#FFCC00' },
  { primary: '#FF0099', secondary: '#FF66BB', glow: '#FF0099' },
  { primary: '#99FF00', secondary: '#BBFF66', glow: '#99FF00' },
] as const

// Food colors (bright neon)
export const FOOD_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#FF69B4', '#7FFF00', '#FF4500', '#00CED1',
]

// Background
export const COLORS = {
  background: '#0a0a0a',
  grid: '#1a1a1a',
  gridDot: '#222222',
  border: '#FF0000',
} as const

export type SnakePattern = typeof SNAKE_PATTERNS[number]

// AI Names
export const AI_NAMES = [
  'Slither', 'Viper', 'Serpent', 'Noodle', 'Snek',
  'Wiggles', 'Naga', 'Cobra', 'Python', 'Anaconda',
  'Rattler', 'Mamba', 'Asp', 'Boa', 'Sidewinder',
  'Coil', 'Fang', 'Scale', 'Hiss', 'Glider',
]
