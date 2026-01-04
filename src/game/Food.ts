import {
  WORLD_SIZE,
  FOOD_RADIUS,
  FOOD_VALUE,
  FOOD_COLORS,
  CHASE_PELLET_VALUE,
  CHASE_PELLET_SPEED,
  CHASE_PELLET_FLEE_DISTANCE,
  SEGMENT_RADIUS,
} from './constants'
import type { Food, BoostPellet, Camera, Snake } from './types'

let foodIdCounter = 0

export function createFood(x?: number, y?: number, isChase: boolean = false): Food {
  return {
    id: `food_${foodIdCounter++}`,
    x: x ?? Math.random() * WORLD_SIZE,
    y: y ?? Math.random() * WORLD_SIZE,
    color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)],
    value: isChase ? CHASE_PELLET_VALUE : FOOD_VALUE,
    isChase,
    angle: Math.random() * Math.PI * 2,
  }
}

export function createDeathFood(snake: Snake): Food[] {
  const foods: Food[] = []
  
  // Create food from every few segments
  for (let i = 0; i < snake.segments.length; i += 2) {
    const segment = snake.segments[i]
    foods.push({
      id: `food_${foodIdCounter++}`,
      x: segment.x + (Math.random() - 0.5) * 20,
      y: segment.y + (Math.random() - 0.5) * 20,
      color: snake.pattern.primary,
      value: 2,
      isChase: false,
    })
  }
  
  return foods
}

export function spawnInitialFood(count: number, chasePelletCount: number): Food[] {
  const foods: Food[] = []
  
  // Regular food
  for (let i = 0; i < count; i++) {
    foods.push(createFood())
  }
  
  // Chase pellets
  for (let i = 0; i < chasePelletCount; i++) {
    foods.push(createFood(undefined, undefined, true))
  }
  
  return foods
}

export function updateChasePellets(food: Food[], snakes: Snake[]): Food[] {
  return food.map(f => {
    if (!f.isChase) return f
    
    // Find nearest snake head
    let nearestDist = Infinity
    let fleeAngle = f.angle ?? 0
    
    for (const snake of snakes) {
      if (!snake.isAlive || snake.segments.length === 0) continue
      
      const head = snake.segments[0]
      const dx = head.x - f.x
      const dy = head.y - f.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < CHASE_PELLET_FLEE_DISTANCE && dist < nearestDist) {
        nearestDist = dist
        // Flee in opposite direction
        fleeAngle = Math.atan2(f.y - head.y, f.x - head.x)
      }
    }
    
    // Move if fleeing
    if (nearestDist < CHASE_PELLET_FLEE_DISTANCE) {
      const newX = f.x + Math.cos(fleeAngle) * CHASE_PELLET_SPEED
      const newY = f.y + Math.sin(fleeAngle) * CHASE_PELLET_SPEED
      
      return {
        ...f,
        x: Math.max(50, Math.min(WORLD_SIZE - 50, newX)),
        y: Math.max(50, Math.min(WORLD_SIZE - 50, newY)),
        angle: fleeAngle,
      }
    }
    
    // Random wandering when not fleeing
    if (Math.random() < 0.02) {
      return {
        ...f,
        angle: (f.angle ?? 0) + (Math.random() - 0.5) * 0.5,
      }
    }
    
    return f
  })
}

export function updateBoostPellets(pellets: BoostPellet[]): BoostPellet[] {
  return pellets
    .map(p => ({ ...p, lifetime: p.lifetime - 1 }))
    .filter(p => p.lifetime > 0)
}

export function drawFood(
  ctx: CanvasRenderingContext2D,
  food: Food[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
  time: number
) {
  for (const f of food) {
    const screenX = (f.x - camera.x) * camera.zoom + canvasWidth / 2
    const screenY = (f.y - camera.y) * camera.zoom + canvasHeight / 2

    if (
      screenX < -20 ||
      screenX > canvasWidth + 20 ||
      screenY < -20 ||
      screenY > canvasHeight + 20
    ) {
      continue
    }

    // Pulsing effect
    const pulse = 1 + Math.sin(time * 0.005 + f.x * 0.01) * 0.2
    const baseRadius = f.isChase ? FOOD_RADIUS * 1.5 : FOOD_RADIUS
    const radius = baseRadius * camera.zoom * pulse

    // Glow effect
    const glowRadius = radius * (f.isChase ? 3 : 2)
    const gradient = ctx.createRadialGradient(
      screenX, screenY, 0,
      screenX, screenY, glowRadius
    )
    gradient.addColorStop(0, f.color)
    gradient.addColorStop(0.3, f.color + '88')
    gradient.addColorStop(1, f.color + '00')
    
    ctx.beginPath()
    ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Core
    ctx.beginPath()
    ctx.arc(screenX, screenY, radius, 0, Math.PI * 2)
    ctx.fillStyle = f.color
    ctx.fill()

    // Shine
    ctx.beginPath()
    ctx.arc(screenX - radius * 0.3, screenY - radius * 0.3, radius * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fill()

    // Chase pellet special effect
    if (f.isChase) {
      // Sparkle ring
      const sparkleRadius = radius * 1.5
      ctx.beginPath()
      ctx.arc(screenX, screenY, sparkleRadius, 0, Math.PI * 2)
      ctx.strokeStyle = f.color
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.stroke()
      ctx.setLineDash([])
    }
  }
}

export function drawBoostPellets(
  ctx: CanvasRenderingContext2D,
  pellets: BoostPellet[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
) {
  for (const p of pellets) {
    const screenX = (p.x - camera.x) * camera.zoom + canvasWidth / 2
    const screenY = (p.y - camera.y) * camera.zoom + canvasHeight / 2

    if (
      screenX < -10 ||
      screenX > canvasWidth + 10 ||
      screenY < -10 ||
      screenY > canvasHeight + 10
    ) {
      continue
    }

    // Fade out as lifetime decreases
    const alpha = Math.min(1, p.lifetime / 100)
    const radius = 4 * camera.zoom

    // Glow
    const gradient = ctx.createRadialGradient(
      screenX, screenY, 0,
      screenX, screenY, radius * 2
    )
    gradient.addColorStop(0, p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'))
    gradient.addColorStop(1, p.color + '00')
    
    ctx.beginPath()
    ctx.arc(screenX, screenY, radius * 2, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Core
    ctx.beginPath()
    ctx.arc(screenX, screenY, radius, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.globalAlpha = alpha
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

export function checkFoodCollision(head: { x: number; y: number }, food: Food): boolean {
  const dx = head.x - food.x
  const dy = head.y - food.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const foodRadius = food.isChase ? FOOD_RADIUS * 1.5 : FOOD_RADIUS
  return dist < SEGMENT_RADIUS + foodRadius
}

export function checkBoostPelletCollision(head: { x: number; y: number }, pellet: BoostPellet): boolean {
  const dx = head.x - pellet.x
  const dy = head.y - pellet.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return dist < SEGMENT_RADIUS + 4
}
