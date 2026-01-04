import { useState } from 'react'

interface StartScreenProps {
  onStart: (name: string) => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStart(name || 'Player')
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] flex flex-col justify-center items-center z-50 gap-6 p-8">
      {/* Neon glow background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-[100px]" />
      </div>

      {/* Logo */}
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          <span className="text-cyan-400 drop-shadow-[0_0_10px_#00ffff]">SLITHER</span>
          <span className="text-pink-400 drop-shadow-[0_0_10px_#ff00ff]">.IO</span>
        </h1>
        <p className="text-gray-400">Grow the longest snake!</p>
      </div>

      {/* Animated snake */}
      <div className="flex items-center gap-1 relative z-10">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`rounded-full ${i === 0 ? 'w-6 h-6' : 'w-5 h-5'}`}
            style={{
              background: i % 2 === 0 
                ? 'linear-gradient(135deg, #FF0066, #FF3388)' 
                : 'linear-gradient(135deg, #FF3388, #FF0066)',
              boxShadow: '0 0 10px #FF0066',
              animation: `bounce 0.6s ease-in-out ${i * 0.08}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Name input */}
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 relative z-10">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          maxLength={15}
          className="px-6 py-3 text-lg bg-black/50 border-2 border-cyan-500/50 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,255,255,0.3)] w-64 text-center transition-all"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        />

        <button
          type="submit"
          className="px-12 py-4 text-xl font-bold rounded-full transition-all active:scale-95"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            background: 'linear-gradient(135deg, #00ffff, #0088ff)',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
            color: '#000',
          }}
        >
          PLAY
        </button>
      </form>

      {/* Instructions */}
      <div className="text-gray-400 text-center text-sm max-w-sm mt-4 relative z-10">
        <p className="mb-2">🖱️ <strong>Move mouse</strong> to steer</p>
        <p className="mb-2">🖱️ <strong>Hold click</strong> or <strong>Space</strong> to boost</p>
        <p className="mb-2">💀 <strong>Don't crash</strong> into other snakes!</p>
        <p>✨ <strong>Collect orbs</strong> to grow longer</p>
      </div>

      {/* Mobile hint */}
      <div className="absolute bottom-6 text-gray-500 text-xs text-center">
        <p>On mobile: Touch to move, double-tap to boost</p>
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
