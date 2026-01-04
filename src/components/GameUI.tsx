import type { LeaderboardEntry } from '@/game/types'

interface GameUIProps {
  score: number
  leaderboard: LeaderboardEntry[]
  isBoosting: boolean
}

export default function GameUI({ score, leaderboard, isBoosting }: GameUIProps) {
  return (
    <>
      {/* Score - top left */}
      <div className="absolute top-4 left-4 pointer-events-none z-10">
        <div className="bg-black/70 rounded-lg px-4 py-2 backdrop-blur-sm border border-white/10">
          <div className="text-white font-bold text-3xl font-game">{score}</div>
          <div className="text-gray-400 text-xs">LENGTH</div>
        </div>
        
        {/* Boost indicator */}
        {isBoosting && (
          <div className="mt-2 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 rounded-lg px-3 py-1 text-center animate-pulse">
            <div className="text-white text-xs font-bold">⚡ BOOSTING</div>
          </div>
        )}
      </div>

      {/* Leaderboard - top right */}
      <div className="absolute top-4 right-4 pointer-events-none z-10">
        <div className="bg-black/70 rounded-lg px-4 py-3 backdrop-blur-sm min-w-[160px] border border-white/10">
          <div className="text-gray-400 text-xs mb-2 font-semibold border-b border-gray-700 pb-2">
            🏆 TOP PLAYERS
          </div>
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex justify-between items-center py-1 text-sm ${
                entry.isPlayer ? 'text-cyan-400 font-bold' : 'text-white/80'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-5 text-center ${index < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                  {index === 0 ? '👑' : index + 1}
                </span>
                <span className="truncate max-w-[80px]">{entry.name}</span>
              </span>
              <span className="text-gray-400 ml-2">{entry.length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls hint - bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div className="bg-black/50 rounded-lg px-4 py-2 backdrop-blur-sm text-center border border-white/5">
          <div className="text-white/50 text-xs">
            <span className="mx-2">🖱️ Move</span>
            <span className="mx-2">🖱️ Hold / ⎵ Boost</span>
          </div>
        </div>
      </div>
    </>
  )
}
