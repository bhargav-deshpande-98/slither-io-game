import {
  WORLD_SIZE,
  AI_VISION_RANGE,
  SEGMENT_RADIUS,
  AI_NAMES,
  SNAKE_PATTERNS,
} from './constants'
import type { Snake, Food } from './types'
import { createSnake } from './Snake'

export function createAISnake(): Snake {
  const x = Math.random() * (WORLD_SIZE - 400) + 200
  const y = Math.random() * (WORLD_SIZE - 400) + 200
  const name = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)]
  const pattern = SNAKE_PATTERNS[Math.floor(Math.random() * SNAKE_PATTERNS.length)]

  return createSnake(x, y, false, name, pattern)
}

export function updateAISnake(
  snake: Snake,
  allSnakes: Snake[],
  food: Food[]
): Snake {
  if (!snake.isAlive || snake.segments.length === 0) return snake

  const head = snake.segments[0]
  let targetAngle = snake.angle
  let shouldBoost = false

  // Find nearest food
  let nearestFood: Food | null = null
  let nearestFoodDist = AI_VISION_RANGE * 1.5

  for (const f of food) {
    const dx = f.x - head.x
    const dy = f.y - head.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Prefer larger value food
    const effectiveDist = dist / (f.value || 1)
    
    if (effectiveDist < nearestFoodDist) {
      nearestFoodDist = effectiveDist
      nearestFood = f
    }
  }

  // Find threats (other snake heads nearby)
  let nearestThreat: { x: number; y: number; dist: number; length: number } | null = null
  
  // Find potential kills (can cut off other snakes)
  let potentialKill: { x: number; y: number; dist: number } | null = null

  for (const other of allSnakes) {
    if (other.id === snake.id || !other.isAlive || other.segments.length === 0) continue

    const otherHead = other.segments[0]
    const dx = otherHead.x - head.x
    const dy = otherHead.y - head.y
    const headDist = Math.sqrt(dx * dx + dy * dy)

    // Check if their head is a threat (they might cut us off)
    if (headDist < AI_VISION_RANGE) {
      // Check their direction
      const theirAngleToUs = Math.atan2(head.y - otherHead.y, head.x - otherHead.x)
      let angleDiff = Math.abs(other.angle - theirAngleToUs)
      while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2)

      // They're heading toward us
      if (angleDiff < Math.PI / 3 && other.segments.length >= snake.segments.length) {
        if (!nearestThreat || headDist < nearestThreat.dist) {
          nearestThreat = { x: otherHead.x, y: otherHead.y, dist: headDist, length: other.segments.length }
        }
      }
    }

    // Check for body segments we could cut off
    for (let i = 5; i < other.segments.length; i++) {
      const seg = other.segments[i]
      const segDx = seg.x - head.x
      const segDy = seg.y - head.y
      const segDist = Math.sqrt(segDx * segDx + segDy * segDy)

      // Check if we might be able to get in front of them
      if (segDist < AI_VISION_RANGE * 0.8 && segDist > 50) {
        // Calculate if we can intercept
        const interceptAngle = Math.atan2(segDy, segDx)
        
        if (!potentialKill || segDist < potentialKill.dist) {
          potentialKill = { x: seg.x, y: seg.y, dist: segDist }
        }
      }
    }

    // Avoid their body if too close
    for (let i = 0; i < Math.min(50, other.segments.length); i++) {
      const seg = other.segments[i]
      const segDx = seg.x - head.x
      const segDy = seg.y - head.y
      const segDist = Math.sqrt(segDx * segDx + segDy * segDy)

      if (segDist < 50) {
        if (!nearestThreat || segDist < nearestThreat.dist) {
          nearestThreat = { x: seg.x, y: seg.y, dist: segDist, length: other.segments.length }
        }
      }
    }
  }

  // Decision making
  if (nearestThreat && nearestThreat.dist < 80) {
    // Emergency evasion - turn away sharply
    const threatAngle = Math.atan2(nearestThreat.y - head.y, nearestThreat.x - head.x)
    targetAngle = threatAngle + Math.PI + (Math.random() - 0.5) * 0.5
    shouldBoost = nearestThreat.dist < 50 && snake.segments.length > 15
  } else if (potentialKill && snake.segments.length > 20 && Math.random() < 0.3) {
    // Aggressive: try to cut off other snakes
    targetAngle = Math.atan2(potentialKill.y - head.y, potentialKill.x - head.x)
    shouldBoost = potentialKill.dist < 100
  } else if (nearestFood) {
    // Go for food
    targetAngle = Math.atan2(nearestFood.y - head.y, nearestFood.x - head.x)
    
    // Boost toward high-value food
    if (nearestFood.isChase && nearestFoodDist < 100) {
      shouldBoost = snake.segments.length > 15
    }
  } else {
    // Wander
    if (Math.random() < 0.02) {
      targetAngle = snake.angle + (Math.random() - 0.5) * Math.PI * 0.5
    }
  }

  // Avoid world boundaries
  const margin = 150
  if (head.x < margin) targetAngle = 0
  if (head.x > WORLD_SIZE - margin) targetAngle = Math.PI
  if (head.y < margin) targetAngle = Math.PI / 2
  if (head.y > WORLD_SIZE - margin) targetAngle = -Math.PI / 2

  // Corner avoidance
  if (head.x < margin && head.y < margin) targetAngle = Math.PI / 4
  if (head.x > WORLD_SIZE - margin && head.y < margin) targetAngle = Math.PI * 3 / 4
  if (head.x < margin && head.y > WORLD_SIZE - margin) targetAngle = -Math.PI / 4
  if (head.x > WORLD_SIZE - margin && head.y > WORLD_SIZE - margin) targetAngle = -Math.PI * 3 / 4

  return {
    ...snake,
    targetAngle,
    isBoosting: shouldBoost,
  }
}

export function respawnAISnake(snake: Snake): Snake {
  const x = Math.random() * (WORLD_SIZE - 400) + 200
  const y = Math.random() * (WORLD_SIZE - 400) + 200

  return {
    ...createSnake(x, y, false, snake.name, snake.pattern),
    id: snake.id,
  }
}
