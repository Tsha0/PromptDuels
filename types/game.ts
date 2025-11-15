export type GameStatus = 
  | "waiting_for_opponent"
  | "prompt_phase"
  | "waiting_for_ai"
  | "results";

export interface TargetWebsite {
  id: string;
  name: string;
  screenshotPath: string;
  description: string;
  blockedWords: string[];
}

export interface PlayerResult {
  prompt: string;
  htmlString: string;
  score: number;
  commentary: string;
}

export interface Player {
  id: string;
  prompt?: string;
  promptSubmittedAt?: number;
  result?: PlayerResult;
}

export interface Game {
  id: string;
  status: GameStatus;
  targetWebsite: TargetWebsite;
  player1: Player;
  player2?: Player;
  winner?: "player1" | "player2" | "tie";
  promptPhaseStartedAt?: number;
  promptPhaseDuration: number; // in seconds
  createdAt: number;
}

export interface GameStateResponse {
  game: Game;
  yourPlayerId: string;
  yourPlayerNumber: "player1" | "player2";
}

