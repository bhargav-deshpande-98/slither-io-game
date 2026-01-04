import { useEffect, useCallback, useRef } from 'react'

interface UseGameInputProps {
  onMouseMove: (x: number, y: number) => void
  onBoost: (boosting: boolean) => void
  isPlaying: boolean
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function useGameInput({
  onMouseMove,
  onBoost,
  isPlaying,
  canvasRef,
}: UseGameInputProps) {
  const lastTapRef = useRef(0)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPlaying) return
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      onMouseMove(e.clientX - rect.left, e.clientY - rect.top)
    },
    [isPlaying, canvasRef, onMouseMove]
  )

  const handleMouseDown = useCallback(() => {
    if (!isPlaying) return
    onBoost(true)
  }, [isPlaying, onBoost])

  const handleMouseUp = useCallback(() => {
    onBoost(false)
  }, [onBoost])

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isPlaying) return
      e.preventDefault()
      
      // Double tap detection for boost
      const now = Date.now()
      if (now - lastTapRef.current < 300) {
        onBoost(true)
      }
      lastTapRef.current = now
      
      const touch = e.touches[0]
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      onMouseMove(touch.clientX - rect.left, touch.clientY - rect.top)
    },
    [isPlaying, canvasRef, onMouseMove, onBoost]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPlaying) return
      e.preventDefault()
      
      const touch = e.touches[0]
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      onMouseMove(touch.clientX - rect.left, touch.clientY - rect.top)
    },
    [isPlaying, canvasRef, onMouseMove]
  )

  const handleTouchEnd = useCallback(() => {
    onBoost(false)
  }, [onBoost])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying) return
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        onBoost(true)
      }
    },
    [isPlaying, onBoost]
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        onBoost(false)
      }
    },
    [onBoost]
  )

  useEffect(() => {
    const canvas = canvasRef.current

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mousedown', handleMouseDown)
      canvas.addEventListener('mouseup', handleMouseUp)
      canvas.addEventListener('mouseleave', handleMouseUp)
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
      canvas.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)

      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mousedown', handleMouseDown)
        canvas.removeEventListener('mouseup', handleMouseUp)
        canvas.removeEventListener('mouseleave', handleMouseUp)
        canvas.removeEventListener('touchstart', handleTouchStart)
        canvas.removeEventListener('touchmove', handleTouchMove)
        canvas.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [
    canvasRef,
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ])
}
