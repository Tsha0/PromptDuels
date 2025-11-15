import { Game, TargetWebsite } from "@/types/game";
import { nanoid } from "nanoid";

// Target websites configuration
export const TARGET_WEBSITES: TargetWebsite[] = [
  {
    id: "rideshare",
    name: "Ride Share App",
    screenshotPath: "/screenshots/rideshare.png",
    description: "A ride-sharing application with a map interface, pickup/dropoff locations, and ride options",
    blockedWords: ["uber", "lyft", "didi", "grab", "ola"],
  },
  {
    id: "search",
    name: "Search Engine",
    screenshotPath: "/screenshots/search.png",
    description: "A clean search homepage with a centered search bar and minimal branding",
    blockedWords: ["google", "bing", "yahoo", "duckduckgo"],
  },
  {
    id: "social",
    name: "Social Feed",
    screenshotPath: "/screenshots/social.png",
    description: "A social media feed with posts, likes, comments, and a sidebar",
    blockedWords: ["facebook", "instagram", "twitter", "x.com", "tiktok", "snapchat"],
  },
  {
    id: "ecommerce",
    name: "E-commerce Product Page",
    screenshotPath: "/screenshots/ecommerce.png",
    description: "An online shopping product page with images, price, description, and add to cart button",
    blockedWords: ["amazon", "ebay", "alibaba", "etsy", "walmart"],
  },
];

// In-memory game store
class GameStore {
  private games: Map<string, Game> = new Map();
  private waitingGame: string | null = null;

  createGame(playerId: string): Game {
    const gameId = nanoid(10);
    const targetWebsite = TARGET_WEBSITES[Math.floor(Math.random() * TARGET_WEBSITES.length)];
    
    const game: Game = {
      id: gameId,
      status: "waiting_for_opponent",
      targetWebsite,
      player1: {
        id: playerId,
      },
      promptPhaseDuration: 45, // 45 seconds
      createdAt: Date.now(),
    };

    this.games.set(gameId, game);
    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  updateGame(gameId: string, updates: Partial<Game>): Game | undefined {
    const game = this.games.get(gameId);
    if (!game) return undefined;

    const updatedGame = { ...game, ...updates };
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  joinGame(gameId: string, playerId: string): Game | undefined {
    const game = this.games.get(gameId);
    if (!game || game.player2) return undefined;

    const updatedGame = {
      ...game,
      player2: { id: playerId },
      status: "prompt_phase" as const,
      promptPhaseStartedAt: Date.now(),
    };

    this.games.set(gameId, updatedGame);
    this.waitingGame = null;
    return updatedGame;
  }

  getWaitingGame(): string | null {
    return this.waitingGame;
  }

  setWaitingGame(gameId: string | null): void {
    this.waitingGame = gameId;
  }

  submitPrompt(gameId: string, playerId: string, prompt: string): Game | undefined {
    const game = this.games.get(gameId);
    if (!game) return undefined;

    let updatedGame = { ...game };

    if (game.player1.id === playerId) {
      updatedGame.player1 = {
        ...game.player1,
        prompt,
        promptSubmittedAt: Date.now(),
      };
    } else if (game.player2?.id === playerId) {
      updatedGame.player2 = {
        ...game.player2,
        prompt,
        promptSubmittedAt: Date.now(),
      };
    } else {
      return undefined;
    }

    // Check if both players have submitted
    if (updatedGame.player1.prompt && updatedGame.player2?.prompt) {
      updatedGame.status = "waiting_for_ai";
    }

    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  updateResults(
    gameId: string,
    player1Result: any,
    player2Result: any,
    winner: "player1" | "player2" | "tie"
  ): Game | undefined {
    const game = this.games.get(gameId);
    if (!game) return undefined;

    const updatedGame = {
      ...game,
      player1: {
        ...game.player1,
        result: player1Result,
      },
      player2: game.player2 ? {
        ...game.player2,
        result: player2Result,
      } : undefined,
      winner,
      status: "results" as const,
    };

    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  // Clean up old games (optional, for memory management)
  cleanupOldGames(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    for (const [gameId, game] of this.games.entries()) {
      if (now - game.createdAt > maxAgeMs) {
        this.games.delete(gameId);
        if (this.waitingGame === gameId) {
          this.waitingGame = null;
        }
      }
    }
  }
}

export const gameStore = new GameStore();

