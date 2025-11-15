import { NextRequest, NextResponse } from "next/server";
import { gameStore } from "@/lib/game-store";
import { nanoid } from "nanoid";

const MINIMUM_WAIT_TIME = 10000; // 10 seconds minimum wait for matchmaking

export async function POST(request: NextRequest) {
  try {
    const playerId = nanoid(10);
    const now = Date.now();
    
    // Check if there's a waiting game
    const waitingGameId = gameStore.getWaitingGame();
    
    if (waitingGameId) {
      const game = gameStore.getGame(waitingGameId);
      
      // Make sure the game still exists and is waiting
      if (game && game.status === "waiting_for_opponent") {
        // Try to join the waiting game
        const updatedGame = gameStore.joinGame(waitingGameId, playerId);
        
        if (updatedGame) {
          return NextResponse.json({
            gameId: updatedGame.id,
            playerId,
            playerNumber: "player2",
          });
        }
      }
      
      // Only clear and replace the waiting game if it's older than the minimum wait time
      // This ensures games remain available for matching for at least 10 seconds
      if (!game || now - game.createdAt > MINIMUM_WAIT_TIME) {
        gameStore.setWaitingGame(null);
      } else {
        // Waiting game is still valid (less than 10 seconds old)
        // Create a new game for this player but don't set it as the waiting game
        const newGame = gameStore.createGame(playerId);
        return NextResponse.json({
          gameId: newGame.id,
          playerId,
          playerNumber: "player1",
        });
      }
    }
    
    // Create a new game and set it as the waiting game
    const game = gameStore.createGame(playerId);
    gameStore.setWaitingGame(game.id);
    
    return NextResponse.json({
      gameId: game.id,
      playerId,
      playerNumber: "player1",
    });
  } catch (error) {
    console.error("Matchmaking error:", error);
    return NextResponse.json(
      { error: "Failed to find or create game" },
      { status: 500 }
    );
  }
}

