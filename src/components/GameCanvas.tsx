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
  }, [])

  useEffect(() => {
    gameDataRef.current = gameData
  }, [gameData])

  const handleStart = useCallback((name: string) => {
    if (!gameDataRef.current) return
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

      const updated = updateGame(gameDataRef.current, dt, time)

      if (updated !== gameDataRef.current) {
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
