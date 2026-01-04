# 🐍 Slither.io Clone

A multiplayer-style snake game with neon graphics, smooth controls, and boost mechanics. Built with React, TypeScript, and Canvas.

## Features

- 🎮 **Smooth cursor control** - Snake follows your mouse/touch
- ⚡ **Boost mechanic** - Speed up at the cost of length, leaving pellet trails
- 🌟 **Chase pellets** - Special orbs that flee from you (worth more!)
- 🤖 **15 AI opponents** - Smart bots with hunting/fleeing behavior
- 📊 **Leaderboard** - Top 10 players
- 🗺️ **Minimap** - See all snakes on the arena
- 🌈 **Neon aesthetics** - Glowing snakes and particles
- 📱 **Mobile support** - Touch controls with double-tap boost

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **HTML5 Canvas** - Game rendering

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Controls

| Input | Action |
|-------|--------|
| Mouse / Touch | Steer snake toward cursor |
| Hold Click / Space / ↑ | Boost (costs length) |
| Double-tap (mobile) | Boost |

## Project Structure

```
src/
├── components/     # React UI components
│   └── ui/        # Reusable UI components
├── game/          # Game engine & logic
│   ├── constants.ts
│   ├── types.ts
│   ├── Snake.ts
│   ├── Food.ts
│   ├── AISnake.ts
│   └── GameEngine.ts
├── hooks/         # Custom React hooks
├── lib/           # Utilities
├── pages/         # Page components
├── App.tsx
└── main.tsx
```

## Game Mechanics

- **Growing**: Eat glowing orbs to increase your length
- **Boosting**: Hold to move faster, but you lose length and leave pellet trails behind
- **Killing**: If another snake's head hits your body, they die and drop orbs
- **Death**: Running into another snake's body kills you
- **Chase Pellets**: Special sparkling orbs that flee when you approach - worth 10x normal!

## Strategies

1. **Coiling**: Circle around smaller snakes to trap them
2. **Cut-off**: Boost in front of other snakes to make them crash into you
3. **Scavenging**: Follow big snakes and collect their dropped orbs when they die
4. **Edge play**: Stay near borders where snakes have less escape room
5. **Boost trails**: Your boost pellets can be eaten - use this to bait enemies

## License

MIT
