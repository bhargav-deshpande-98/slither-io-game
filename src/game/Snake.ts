import {
  INITIAL_LENGTH,
  SEGMENT_RADIUS,
  SEGMENT_SPACING,
  BASE_SPEED,
  BOOST_SPEED,
  BOOST_COST,
  MIN_BOOST_LENGTH,
  TURN_SPEED,
  WORLD_SIZE,
  SNAKE_PATTERNS,
} from './constants'
import type { Snake, Segment, Camera, BoostPellet } from './types'
import type { SnakePattern } from './constants'

let snakeIdCounter = 0
let pelletIdCounter = 0

export function createSnake(
  x: number,
  y: number,
  isPlayer: boolean,
  name: string,
  pattern?: SnakePattern
): Snake {
  const segments: Segment[] = []
  const angle = Math.random() * Math.PI * 2

  // Create initial segments
  for (let i = 0; i < INITIAL_LENGTH; i++) {
    segments.push({
      x: x - Math.cos(angle) * i * SEGMENT_SPACING,
      y: y - Math.sin(angle) * i * SEGMENT_SPACING,
    })
  }

  return {
    id: `snake_${snakeIdCounter++}`,
    segments,
    angle,
    targetAngle: angle,
    speed: BASE_SPEED,
    isBoosting: false,
    isPlayer,
    pattern: pattern || SNAKE_PATTERNS[Math.floor(Math.random() * SNAKE_PATTERNS.length)],
    name,
    isAlive: true,
    length: INITIAL_LENGTH,
  }
}

export function updateSnake(snake: Snake, boostPellets: BoostPellet[]): { snake: Snake; newPellets: BoostPellet[] } {
  if (!snake.isAlive) return { snake, newPellets: [] }

  const newPellets: BoostPellet[] = []
  const updatedSnake = { ...snake, segments: [...snake.segments] }

  // Smooth angle interpolation toward target
  let angleDiff = updatedSnake.targetAngle - updatedSnake.angle
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
  updatedSnake.angle += angleDiff * TURN_SPEED

  // Determine speed
  const canBoost = updatedSnake.segments.length > MIN_BOOST_LENGTH
  const actuallyBoosting = updatedSnake.isBoosting && canBoost
  updatedSnake.speed = actuallyBoosting ? BOOST_SPEED : BASE_SPEED

  // Move head
  const head = updatedSnake.segments[0]
  const newHeadX = head.x + Math.cos(updatedSnake.angle) * updatedSnake.speed
  const newHeadY = head.y + Math.sin(updatedSnake.angle) * updatedSnake.speed

  // Clamp to world (with bounce back effect at border)
  const clampedX = Math.max(SEGMENT_RADIUS, Math.min(WORLD_SIZE - SEGMENT_RADIUS, newHeadX))
  const clampedY = Math.max(SEGMENT_RADIUS, Math.min(WORLD_SIZE - SEGMENT_RADIUS, newHeadY))

  // Add new head
  updatedSnake.segments.unshift({ x: clampedX, y: clampedY })

  // Handle tail and boosting
  if (actuallyBoosting) {
    // Drop pellets while boosting
    const tail = updatedSnake.segments[updatedSnake.segments.length - 1]
    
    // Create boost pellet
    newPellets.push({
      id: `pellet_${pelletIdCounter++}`,
      x: tail.x + (Math.random() - 0.5) * 10,
      y: tail.y + (Math.random() - 0.5) * 10,
      color: updatedSnake.pattern.primary,
      value: 0.5,
      lifetime: 300, // Frames until disappear
    })

    // Remove extra segments while boosting
    const segmentsToRemove = Math.ceil(BOOST_COST)
    for (let i = 0; i < segmentsToRemove && updatedSnake.segments.length > MIN_BOOST_LENGTH; i++) {
      updatedSnake.segments.pop()
    }
  } else {
    // Normal movement - just remove tail
    updatedSnake.segments.pop()
  }

  // Update visual length
  updatedSnake.length = updatedSnake.segments.length

  return { snake: updatedSnake, newPellets }
}

export function growSnake(snake: Snake, amount: number): Snake {
  const updatedSnake = { ...snake, segments: [...snake.segments] }
  const tail = updatedSnake.segments[updatedSnake.segments.length - 1]

  for (let i = 0; i < Math.ceil(amount); i++) {
    updatedSnake.segments.push({ ...tail })
  }
  
  updatedSnake.length = updatedSnake.segments.length
  return updatedSnake
}

export function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
  time: number
) {
  if (!snake.isAlive || snake.segments.length === 0) return

  const { pattern, isBoosting } = snake

  // Draw from tail to head
  for (let i = snake.segments.length - 1; i >= 0; i--) {
    const segment = snake.segments[i]
    
    const screenX = (segment.x - camera.x) * camera.zoom + canvasWidth / 2
    const screenY = (segment.y - camera.y) * camera.zoom + canvasHeight / 2

    // Skip if off screen
    if (
      screenX < -30 ||
      screenX > canvasWidth + 30 ||
      screenY < -30 ||
      screenY > canvasHeight + 30
    ) {
      continue
    }

    const isHead = i === 0
    
    // Size varies slightly along body
    const sizeMultiplier = isHead ? 1.2 : 1 - (i / snake.segments.length) * 0.3
    const radius = SEGMENT_RADIUS * camera.zoom * Math.max(0.7, sizeMultiplier)

    // Alternating pattern
    const useSecondary = i % 4 < 2
    const baseColor = useSecondary ? pattern.secondary : pattern.primary

    // Glow effect when boosting
    if (isBoosting) {
      const glowRadius = radius * 2
      const gradient = ctx.createRadialGradient(
        screenX, screenY, radius * 0.5,
        screenX, screenY, glowRadius
      )
      gradient.addColorStop(0, pattern.glow + '66')
      gradient.addColorStop(1, pattern.glow + '00')
      ctx.beginPath()
      ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Body segment
    ctx.beginPath()
    ctx.arc(screenX, screenY, radius, 0, Math.PI * 2)
    
    // Gradient fill
    const gradient = ctx.createRadialGradient(
      screenX - radius * 0.3, screenY - radius * 0.3, 0,
      screenX, screenY, radius
    )
    gradient.addColorStop(0, lightenColor(baseColor, 40))
    gradient.addColorStop(0.7, baseColor)
    gradient.addColorStop(1, darkenColor(baseColor, 20))
    ctx.fillStyle = gradient
    ctx.fill()

    // Subtle outline
    ctx.strokeStyle = darkenColor(baseColor, 30)
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw head details
    if (isHead) {
      drawSnakeHead(ctx, screenX, screenY, radius, snake.angle, pattern, isBoosting, time)
    }
  }

  // Draw name
  drawSnakeName(ctx, snake, camera, canvasWidth, canvasHeight)
}

function drawSnakeHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  angle: number,
  pattern: SnakePattern,
  isBoosting: boolean,
  time: number
) {
  // Eyes
  const eyeOffset = radius * 0.5
  const eyeRadius = radius * 0.35
  const pupilRadius = radius * 0.2

  for (const side of [-0.4, 0.4]) {
    const eyeX = x + Math.cos(angle + side) * eyeOffset
    const eyeY = y + Math.sin(angle + side) * eyeOffset

    // Eye white
    ctx.beginPath()
    ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()

    // Pupil (looks forward)
    const pupilX = eyeX + Math.cos(angle) * pupilRadius * 0.3
    const pupilY = eyeY + Math.sin(angle) * pupilRadius * 0.3
    ctx.beginPath()
    ctx.arc(pupilX, pupilY, pupilRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#000000'
    ctx.fill()

    // Eye shine
    ctx.beginPath()
    ctx.arc(eyeX - pupilRadius * 0.3, eyeY - pupilRadius * 0.3, pupilRadius * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fill()
  }

  // Antenna/feelers when boosting
  if (isBoosting) {
    const antennaLength = radius * 1.5
    const wobble = Math.sin(time * 0.02) * 0.2

    for (const side of [-0.3, 0.3]) {
      const startX = x + Math.cos(angle) * radius
      const startY = y + Math.sin(angle) * radius
      const endX = startX + Math.cos(angle + side + wobble) * antennaLength
      const endY = startY + Math.sin(angle + side + wobble) * antennaLength

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.strokeStyle = pattern.glow
      ctx.lineWidth = 2
      ctx.stroke()

      // Antenna tip
      ctx.beginPath()
      ctx.arc(endX, endY, 3, 0, Math.PI * 2)
      ctx.fillStyle = pattern.glow
      ctx.fill()
    }
  }
}

function drawSnakeName(
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
) {
  const head = snake.segments[0]
  const screenX = (head.x - camera.x) * camera.zoom + canvasWidth / 2
  const screenY = (head.y - camera.y) * camera.zoom + canvasHeight / 2 - SEGMENT_RADIUS * camera.zoom * 2 - 10

  ctx.font = `bold ${11 * camera.zoom}px Arial`
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFFFFF'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 3
  ctx.strokeText(snake.name, screenX, screenY)
  ctx.fillText(snake.name, screenX, screenY)

  // Length below name
  ctx.font = `${9 * camera.zoom}px Arial`
  ctx.fillStyle = snake.pattern.primary
  ctx.strokeText(snake.length.toString(), screenX, screenY + 12 * camera.zoom)
  ctx.fillText(snake.length.toString(), screenX, screenY + 12 * camera.zoom)
}

export function checkSnakeCollision(snake1: Snake, snake2: Snake): boolean {
  if (!snake1.isAlive || !snake2.isAlive) return false
  if (snake1.id === snake2.id) return false

  const head = snake1.segments[0]
  const collisionRadius = SEGMENT_RADIUS * 1.5

  // Check if snake1's head hits any segment of snake2 (except first few)
  for (let i = 3; i < snake2.segments.length; i++) {
    const segment = snake2.segments[i]
    const dx = head.x - segment.x
    const dy = head.y - segment.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < collisionRadius) {
      return true
    }
  }

  return false
}

// Color utilities
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0xff) + amt)
  const B = Math.min(255, (num & 0xff) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0xff) - amt)
  const B = Math.max(0, (num & 0xff) - amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}
