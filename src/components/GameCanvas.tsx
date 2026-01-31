import { useRef, useState, useCallback, useEffect } from 'react'
import { useGameLoop, useGameInput, useCanvasSetup } from '@/hooks'
import {
  initializeGame,
  startGame,
  updateGame,
  renderGame,
  updateMousePosition,
  setPlayerBoosting,
  type GameData,
} from '@/game'
import StartScreen from './StartScreen'
import GameOverScreen from './GameOverScreen'
import GameUI from './GameUI'
import { initAudio, playEatSound, playKillSound, playBoostStartSound, playBoostEndSound, playDeathSound } from '@/lib/sounds'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameData, setGameData] = useState<GameData | null>(null)
  const gameDataRef = useRef<GameData | null>(null)
  const [playerName, setPlayerName] = useState('')

  const { width, height } = useCanvasSetup(canvasRef, containerRef)

  useEffect(() => {
    const initialData = initializeGame()
    setGameData(initialData)
    gameDataRef.current = initialData

    // Auto-start if nickname is passed via URL params (from Playbite app)
    const params = new URLSearchParams(window.location.search)
    const nickname = params.get('nickname')
    if (nickname) {
      initAudio()
      const newGame = startGame(initialData, nickname)
      setGameData(newGame)
      gameDataRef.current = newGame
      setPlayerName(nickname)
    }
  }, [])

  useEffect(() => {
    gameDataRef.current = gameData
  }, [gameData])

  const handleStart = useCallback((name: string) => {
    if (!gameDataRef.current) return
    initAudio()
    const newGame = startGame(gameDataRef.current, name)
    setGameData(newGame)
    gameDataRef.current = newGame
    setPlayerName(name)
  }, [])

  const handleMouseMove = useCallback(
    (x: number, y: number) => {
      if (!gameDataRef.current) return
      const updated = updateMousePosition(gameDataRef.current, x, y, width, height)
      gameDataRef.current = updated
    },
    [width, height]
  )

  const handleBoost = useCallback((boosting: boolean) => {
    if (!gameDataRef.current) return
    if (boosting) playBoostStartSound()
    else playBoostEndSound()
    const updated = setPlayerBoosting(gameDataRef.current, boosting)
    setGameData(updated)
    gameDataRef.current = updated
  }, [])

  useGameInput({
    onMouseMove: handleMouseMove,
    onBoost: handleBoost,
    isPlaying: gameData?.gameState === 'playing',
    canvasRef,
  })

  const gameLoopCallback = useCallback(
    (dt: number, time: number) => {
      if (!gameDataRef.current || !canvasRef.current) return

      const prev = gameDataRef.current
      const updated = updateGame(prev, dt, time)

      if (updated !== prev) {
        // Detect game events by comparing state
        if (prev.player && updated.player && updated.player.isAlive) {
          // Player grew (ate food or boost pellets)
          if (updated.score > prev.score) {
            // Check if player killed an AI snake (AI alive count decreased)
            const prevAlive = prev.aiSnakes.filter(s => s.isAlive).length
            const newAlive = updated.aiSnakes.filter(s => s.isAlive).length
            if (newAlive < prevAlive) {
              playKillSound()
            } else {
              playEatSound()
            }
          }
        }

        // Player died
        if (prev.gameState === 'playing' && updated.gameState === 'gameover') {
          playDeathSound()
        }

        setGameData(updated)
        gameDataRef.current = updated
      }

      const ctx = canvasRef.current.getContext('2d')
      if (ctx && width > 0 && height > 0) {
        renderGame(ctx, updated, width, height, time)
      }
    },
    [width, height]
  )

  useGameLoop(gameLoopCallback, gameData?.gameState === 'playing')

  const handleRestart = useCallback(() => {
    initAudio()
    const newGame = startGame(initializeGame(), playerName)
    setGameData(newGame)
    gameDataRef.current = newGame
  }, [playerName])

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ cursor: gameData?.gameState === 'playing' ? 'none' : 'default' }}
      />

      {gameData && (
        <>
          {gameData.gameState === 'playing' && (
            <GameUI
              score={gameData.score}
              leaderboard={gameData.leaderboard}
              isBoosting={gameData.player?.isBoosting || false}
            />
          )}

          {gameData.gameState === 'start' && (
            <StartScreen onStart={handleStart} />
          )}

          {gameData.gameState === 'gameover' && (
            <GameOverScreen
              score={gameData.score}
              highScore={gameData.highScore}
              onRestart={handleRestart}
            />
          )}
        </>
      )}
    </div>
  )
}
