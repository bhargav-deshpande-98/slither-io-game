interface GameOverScreenProps {
  score: number
  highScore: number
  onRestart: () => void
}

export default function GameOverScreen({
  score,
  highScore,
  onRestart,
}: GameOverScreenProps) {
  const isNewHighScore = score >= highScore && score > 10

  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col justify-center items-center z-50 gap-6 p-8 backdrop-blur-sm">
      {/* Glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/20 rounded-full blur-[100px]" />
      </div>

      {/* Game Over Title */}
      <h1 
        className="text-5xl font-bold text-red-500 mb-2 relative z-10"
        style={{ 
          fontFamily: 'Orbitron, sans-serif',
          textShadow: '0 0 30px rgba(255, 0, 0, 0.5)',
        }}
      >
        GAME OVER
      </h1>

      {/* New high score */}
      {isNewHighScore && (
        <div 
          className="text-yellow-400 text-xl font-bold animate-pulse relative z-10"
          style={{ textShadow: '0 0 20px rgba(255, 200, 0, 0.5)' }}
        >
          🎉 NEW HIGH SCORE! 🎉
        </div>
      )}

      {/* Stats */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 min-w-[250px] relative z-10">
        <div className="text-center mb-6">
          <div className="text-gray-400 text-sm">YOUR LENGTH</div>
          <div 
            className="text-5xl font-bold text-white"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {score}
          </div>
        </div>

        <div className="text-center border-t border-white/10 pt-4">
          <div className="text-gray-400 text-xs">BEST</div>
          <div 
            className="text-2xl font-bold text-cyan-400"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {highScore}
          </div>
        </div>
      </div>

      {/* Dead snake visualization */}
      <div className="flex items-center gap-1 opacity-30 relative z-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full bg-gray-500"
            style={{
              transform: `rotate(${i * 15}deg)`,
            }}
          />
        ))}
        <span className="ml-2 text-2xl">💀</span>
      </div>

      {/* Play Again Button */}
      <button
        onClick={onRestart}
        className="px-10 py-4 text-xl font-bold rounded-full transition-all active:scale-95 relative z-10"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          background: 'linear-gradient(135deg, #00ffff, #0088ff)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
          color: '#000',
        }}
      >
        PLAY AGAIN
      </button>

      {/* Tips */}
      <div className="text-gray-500 text-sm text-center max-w-xs relative z-10">
        <p>💡 Tip: Coil around smaller snakes to trap them!</p>
      </div>
    </div>
  )
}
