import {
  WORLD_SIZE,
  GRID_SIZE,
  FOOD_COUNT,
  AI_COUNT,
  CHASE_PELLET_COUNT,
  COLORS,
  SNAKE_PATTERNS,
} from './constants'
import type { GameData, Camera, LeaderboardEntry, Snake, BoostPellet } from './types'
import { createSnake, updateSnake, growSnake, drawSnake, checkSnakeCollision } from './Snake'
import {
  spawnInitialFood,
  createFood,
  createDeathFood,
  updateChasePellets,
  updateBoostPellets,
  drawFood,
  drawBoostPellets,
  checkFoodCollision,
  checkBoostPelletCollision,
} from './Food'
import { createAISnake, updateAISnake, respawnAISnake } from './AISnake'

// ============================================
// GAME INITIALIZATION
// ============================================

export function initializeGame(): GameData {
  return {
    gameState: 'start',
    player: null,
    aiSnakes: [],
    food: [],
    boostPellets: [],
    camera: {
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      zoom: 1,
    },
    mouseX: WORLD_SIZE / 2,
    mouseY: WORLD_SIZE / 2,
    score: 0,
    highScore: parseInt(localStorage.getItem('slitherHighScore') || '0'),
    leaderboard: [],
  }
}

export function startGame(gameData: GameData, playerName: string): GameData {
  const player = createSnake(
    WORLD_SIZE / 2,
    WORLD_SIZE / 2,
    true,
    playerName || 'Player',
    SNAKE_PATTERNS[0]
  )

  const aiSnakes: Snake[] = []
  for (let i = 0; i < AI_COUNT; i++) {
    aiSnakes.push(createAISnake())
  }

  const food = spawnInitialFood(FOOD_COUNT, CHASE_PELLET_COUNT)

  return {
    ...gameData,
    gameState: 'playing',
    player,
    aiSnakes,
    food,
    boostPellets: [],
    camera: {
      x: player.segments[0].x,
      y: player.segments[0].y,
      zoom: 1,
    },
    score: player.segments.length,
  }
}

// ============================================
// GAME UPDATE
// ============================================

export function updateGame(gameData: GameData, dt: number, time: number): GameData {
  if (gameData.gameState !== 'playing' || !gameData.player) {
    return gameData
  }

  let data = { ...gameData }
  let player: Snake = { ...data.player! }
  let aiSnakes: Snake[] = data.aiSnakes.map(snake => ({ ...snake }))
  let food = [...data.food]
  let boostPellets = [...data.boostPellets]

  // Update player direction based on mouse
  const head = player.segments![0]
  player.targetAngle = Math.atan2(data.mouseY - head.y, data.mouseX - head.x)

  // Update player
  const playerResult = updateSnake(player, boostPellets)
  player = playerResult.snake
  boostPellets = [...boostPellets, ...playerResult.newPellets]

  // Update AI
  const allSnakes = [player, ...aiSnakes]
  aiSnakes = aiSnakes.map(snake => {
    if (!snake.isAlive) return snake
    
    const updated = updateAISnake(snake, allSnakes, food)
    const result = updateSnake(updated, boostPellets)
    boostPellets = [...boostPellets, ...result.newPellets]
    return result.snake
  })

  // Update chase pellets (they flee from snakes)
  food = updateChasePellets(food, [player, ...aiSnakes])

  // Update boost pellet lifetimes
  boostPellets = updateBoostPellets(boostPellets)

  // Player eats food
  const playerHead = player.segments![0]
  let foodEaten = 0
  food = food.filter(f => {
    if (checkFoodCollision(playerHead, f)) {
      foodEaten += f.value
      return false
    }
    return true
  })
  if (foodEaten > 0) {
    player = growSnake(player, foodEaten)
  }

  // Player eats boost pellets
  boostPellets = boostPellets.filter(p => {
    if (checkBoostPelletCollision(playerHead, p)) {
      player = growSnake(player, p.value)
      return false
    }
    return true
  })

  // AI eats food
  for (let i = 0; i < aiSnakes.length; i++) {
    const snake = aiSnakes[i]
    if (!snake.isAlive) continue

    const aiHead = snake.segments[0]
    let eaten = 0
    
    food = food.filter(f => {
      if (checkFoodCollision(aiHead, f)) {
        eaten += f.value
        return false
      }
      return true
    })

    boostPellets = boostPellets.filter(p => {
      if (checkBoostPelletCollision(aiHead, p)) {
        eaten += p.value
        return false
      }
      return true
    })

    if (eaten > 0) {
      aiSnakes[i] = growSnake(snake, eaten)
    }
  }

  // Check player collision with AI
  for (const ai of aiSnakes) {
    if (checkSnakeCollision(player, ai)) {
      // Player dies
      const deathFood = createDeathFood(player)
      food = [...food, ...deathFood]

      const finalScore = player.segments!.length
      let highScore = data.highScore
      if (finalScore > highScore) {
        highScore = finalScore
        localStorage.setItem('slitherHighScore', highScore.toString())
      }

      return {
        ...data,
        gameState: 'gameover',
        player: { ...player, isAlive: false } as Snake,
        aiSnakes,
        food,
        boostPellets,
        score: finalScore,
        highScore,
      }
    }
  }

  // Check AI collision with player (AI dies)
  for (let i = 0; i < aiSnakes.length; i++) {
    const ai = aiSnakes[i]
    if (!ai.isAlive) continue

    if (checkSnakeCollision(ai, player)) {
      const deathFood = createDeathFood(ai)
      food = [...food, ...deathFood]
      aiSnakes[i] = { ...ai, isAlive: false }
    }
  }

  // Check AI collision with each other
  for (let i = 0; i < aiSnakes.length; i++) {
    const snake1 = aiSnakes[i]
    if (!snake1.isAlive) continue

    for (let j = 0; j < aiSnakes.length; j++) {
      if (i === j) continue
      const snake2 = aiSnakes[j]
      if (!snake2.isAlive) continue

      if (checkSnakeCollision(snake1, snake2)) {
        const deathFood = createDeathFood(snake1)
        food = [...food, ...deathFood]
        aiSnakes[i] = { ...snake1, isAlive: false }
        break
      }
    }
  }

  // Respawn dead AI
  aiSnakes = aiSnakes.map(snake => {
    if (!snake.isAlive && Math.random() < 0.01) {
      return respawnAISnake(snake)
    }
    return snake
  })

  // Maintain food count
  while (food.length < FOOD_COUNT + CHASE_PELLET_COUNT) {
    const isChase = food.filter(f => f.isChase).length < CHASE_PELLET_COUNT
    food.push(createFood(undefined, undefined, isChase && Math.random() < 0.1))
  }

  // Update camera
  const playerCenter = player.segments![0]
  const targetZoom = Math.max(0.5, Math.min(1, 30 / Math.sqrt(player.segments!.length)))
  
  data.camera = {
    x: data.camera.x + (playerCenter.x - data.camera.x) * 0.08,
    y: data.camera.y + (playerCenter.y - data.camera.y) * 0.08,
    zoom: data.camera.zoom + (targetZoom - data.camera.zoom) * 0.05,
  }

  // Update leaderboard
  const leaderboard = calculateLeaderboard(player, aiSnakes)

  return {
    ...data,
    player,
    aiSnakes,
    food,
    boostPellets,
    score: player.segments!.length,
    leaderboard,
  }
}

function calculateLeaderboard(player: Snake, aiSnakes: Snake[]): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = []

  if (player.isAlive) {
    entries.push({
      id: player.id,
      name: player.name,
      length: player.segments.length,
      isPlayer: true,
    })
  }

  for (const snake of aiSnakes) {
    if (snake.isAlive) {
      entries.push({
        id: snake.id,
        name: snake.name,
        length: snake.segments.length,
        isPlayer: false,
      })
    }
  }

  entries.sort((a, b) => b.length - a.length)
  return entries.slice(0, 10)
}

// ============================================
// PLAYER CONTROLS
// ============================================

export function updateMousePosition(
  gameData: GameData,
  screenX: number,
  screenY: number,
  canvasWidth: number,
  canvasHeight: number
): GameData {
  const worldX = (screenX - canvasWidth / 2) / gameData.camera.zoom + gameData.camera.x
  const worldY = (screenY - canvasHeight / 2) / gameData.camera.zoom + gameData.camera.y

  return {
    ...gameData,
    mouseX: worldX,
    mouseY: worldY,
  }
}

export function setPlayerBoosting(gameData: GameData, boosting: boolean): GameData {
  if (!gameData.player) return gameData

  return {
    ...gameData,
    player: {
      ...gameData.player,
      isBoosting: boosting,
    },
  }
}

// ============================================
// RENDERING
// ============================================

export function renderGame(
  ctx: CanvasRenderingContext2D,
  gameData: GameData,
  width: number,
  height: number,
  time: number
) {
  const { camera, player, aiSnakes, food, boostPellets } = gameData

  // Background
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)

  // Grid with dots
  drawGrid(ctx, camera, width, height)

  // World border
  drawWorldBorder(ctx, camera, width, height)

  // Food
  drawFood(ctx, food, camera, width, height, time)

  // Boost pellets
  drawBoostPellets(ctx, boostPellets, camera, width, height)

  // AI snakes (behind player)
  for (const snake of aiSnakes) {
    drawSnake(ctx, snake, camera, width, height, time)
  }

  // Player snake (on top)
  if (player && player.isAlive) {
    drawSnake(ctx, player, camera, width, height, time)
  }

  // Minimap
  drawMinimap(ctx, gameData, width, height)
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  width: number,
  height: number
) {
  const gridSize = GRID_SIZE * camera.zoom
  const offsetX = (-camera.x * camera.zoom + width / 2) % gridSize
  const offsetY = (-camera.y * camera.zoom + height / 2) % gridSize

  ctx.fillStyle = COLORS.gridDot

  // Draw dots at intersections
  for (let x = offsetX; x < width; x += gridSize) {
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.arc(x, y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawWorldBorder(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  width: number,
  height: number
) {
  const left = (0 - camera.x) * camera.zoom + width / 2
  const right = (WORLD_SIZE - camera.x) * camera.zoom + width / 2
  const top = (0 - camera.y) * camera.zoom + height / 2
  const bottom = (WORLD_SIZE - camera.y) * camera.zoom + height / 2

  // Glowing red border
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 8 * camera.zoom
  ctx.shadowColor = COLORS.border
  ctx.shadowBlur = 20
  ctx.strokeRect(left, top, right - left, bottom - top)
  ctx.shadowBlur = 0

  // Warning zone gradient
  const gradientSize = 100 * camera.zoom
  
  // Left edge
  if (left > 0) {
    const gradient = ctx.createLinearGradient(left, 0, left + gradientSize, 0)
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)')
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(left, top, gradientSize, bottom - top)
  }
}

function drawMinimap(
  ctx: CanvasRenderingContext2D,
  gameData: GameData,
  width: number,
  height: number
) {
  const mapSize = 120
  const mapMargin = 15
  const mapX = width - mapSize - mapMargin
  const mapY = height - mapSize - mapMargin

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.beginPath()
  ctx.arc(mapX + mapSize / 2, mapY + mapSize / 2, mapSize / 2, 0, Math.PI * 2)
  ctx.fill()

  // Border
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.stroke()

  const scale = mapSize / WORLD_SIZE
  const centerX = mapX + mapSize / 2
  const centerY = mapY + mapSize / 2

  // AI snakes as small dots
  for (const snake of gameData.aiSnakes) {
    if (!snake.isAlive) continue
    const head = snake.segments[0]
    const dotX = centerX + (head.x - WORLD_SIZE / 2) * scale
    const dotY = centerY + (head.y - WORLD_SIZE / 2) * scale

    ctx.beginPath()
    ctx.arc(dotX, dotY, 2, 0, Math.PI * 2)
    ctx.fillStyle = snake.pattern.primary + '88'
    ctx.fill()
  }

  // Player as larger dot
  if (gameData.player && gameData.player.isAlive) {
    const head = gameData.player.segments[0]
    const dotX = centerX + (head.x - WORLD_SIZE / 2) * scale
    const dotY = centerY + (head.y - WORLD_SIZE / 2) * scale

    ctx.beginPath()
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2)
    ctx.fillStyle = gameData.player.pattern.primary
    ctx.fill()
    ctx.strokeStyle = '#FFF'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}
