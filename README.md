# Competitive Vibecoding

A 1v1 web game where players compete to write the best prompt for recreating a target app's UI using AI.

## Overview

Two players are shown a screenshot of a well-known app (Uber, Google, Facebook, etc.). Each player has 45 seconds to write a prompt describing how to recreate the UI without mentioning the app's name. An AI model (Gemini) generates HTML/CSS based on each prompt, and the best recreation wins.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Animations**: Framer Motion
- **Background**: Paper Design Shaders (@paper-design/shaders-react)
- **AI**: Google Gemini 2.0 Flash
- **Deployment**: Vercel-ready

## Features

- ✨ **Stunning animated backgrounds** using Paper Design Shaders (MeshGradient + DotOrbit)
- 🎮 Simple matchmaking system
- ⏱️ Real-time countdown timer with client polling
- 🚫 Brand name validation
- 🤖 AI-powered HTML generation and evaluation
- 📱 Responsive design
- 🔒 Sandboxed iframe rendering for security
- 🎉 Smooth animations with Framer Motion throughout

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test Multiplayer

Open two browser windows/tabs and click "Find Game" in both to start a match.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── matchmaking/          # POST endpoint for finding/creating games
│   │   └── game/[gameId]/
│   │       ├── route.ts          # GET game state
│   │       └── submit/route.ts   # POST prompt submission
│   ├── game/[gameId]/
│   │   └── page.tsx              # Main game page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Start menu
│   └── globals.css               # Global styles
├── components/
│   ├── game/
│   │   ├── BrowserFrame.tsx      # Browser mockup for screenshots
│   │   ├── PromptPhase.tsx       # Prompt writing phase
│   │   ├── ResultsPhase.tsx      # Results display
│   │   ├── UIPreview.tsx         # Sandboxed iframe preview
│   │   └── WaitingForOpponent.tsx
│   └── ui/
│       ├── background-paper-shaders.tsx
│       ├── button.tsx
│       └── card.tsx
├── lib/
│   ├── game-store.ts             # In-memory game state
│   └── utils.ts                  # Utility functions
├── types/
│   └── game.ts                   # TypeScript types
└── public/
    └── screenshots/              # Target app screenshots
        ├── rideshare.png
        ├── search.png
        ├── social.png
        └── ecommerce.png
```

## How It Works

### Game Flow

1. **Start Menu**: Player clicks "Find Game"
2. **Matchmaking**: System pairs two players or creates a waiting room
3. **Target Display**: Both players see the same target app screenshot
4. **Prompt Phase**: 45-second countdown to write a description
5. **AI Evaluation**: Gemini generates HTML and scores both prompts
6. **Results**: Side-by-side comparison with winner announcement

### API Architecture

- **Matchmaking**: Simple queue system with in-memory store
- **Game State**: Client polls every 2 seconds for updates
- **Prompt Submission**: Validates blocked words, triggers AI when both submit
- **AI Processing**: Synchronous for MVP (runs when both prompts received)

### Security Features

- Sandboxed iframes for generated HTML
- Script tag removal and sanitization
- No inline JavaScript execution
- Brand name validation

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add `GEMINI_API_KEY` environment variable
4. Deploy

```bash
npm run build
```

## Future Enhancements

- Database integration (Vercel Postgres)
- WebSocket real-time updates
- User accounts and matchmaking rating
- More target apps
- Custom time limits
- Tournament mode
- Leaderboards

## License

MIT

## Credits

Built for Code Jam 2025

