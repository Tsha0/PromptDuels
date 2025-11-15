import { NextRequest, NextResponse } from "next/server";
import { gameStore } from "@/lib/game-store";
import { evaluatePrompts } from "./submit/route";

// Flag to track if AI evaluation is in progress for a game
const evaluatingGames = new Set<string>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const playerId = request.nextUrl.searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    const game = gameStore.getGame(gameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Determine which player this is
    let yourPlayerNumber: "player1" | "player2";
    if (game.player1.id === playerId) {
      yourPlayerNumber = "player1";
    } else if (game.player2?.id === playerId) {
      yourPlayerNumber = "player2";
    } else {
      return NextResponse.json(
        { error: "Player not in this game" },
        { status: 403 }
      );
    }

    // Auto-submit empty prompts if time has expired
    if (
      game.status === "prompt_phase" &&
      game.promptPhaseStartedAt &&
      Date.now() - game.promptPhaseStartedAt > game.promptPhaseDuration * 1000
    ) {
      // Check if any player hasn't submitted
      if (!game.player1.prompt) {
        gameStore.submitPrompt(gameId, game.player1.id, "");
      }
      if (game.player2 && !game.player2.prompt) {
        gameStore.submitPrompt(gameId, game.player2.id, "");
      }
      
      // Get updated game state
      const updatedGame = gameStore.getGame(gameId);
      if (updatedGame) {
        // If both players have now submitted and we're in waiting_for_ai state,
        // trigger AI evaluation asynchronously
        if (
          updatedGame.status === "waiting_for_ai" &&
          updatedGame.player1.prompt !== undefined &&
          updatedGame.player2?.prompt !== undefined &&
          !evaluatingGames.has(gameId)
        ) {
          evaluatingGames.add(gameId);
          
          // Trigger AI evaluation in the background
          (async () => {
            try {
              console.log(`Auto-submitting triggered AI evaluation for game ${gameId}...`);
              
              const results = await evaluatePrompts(
                updatedGame.targetWebsite.description,
                updatedGame.targetWebsite.name,
                updatedGame.player1.prompt,
                updatedGame.player2.prompt
              );

              const player1Result = {
                prompt: updatedGame.player1.prompt,
                htmlString: results.player1.htmlString,
                score: results.player1.score,
                commentary: results.player1.commentary,
              };

              const player2Result = {
                prompt: updatedGame.player2.prompt,
                htmlString: results.player2.htmlString,
                score: results.player2.score,
                commentary: results.player2.commentary,
              };

              gameStore.updateResults(
                gameId,
                player1Result,
                player2Result,
                results.winner
              );
              
              console.log(`Auto-evaluation completed for game ${gameId}, winner: ${results.winner}`);
            } catch (err) {
              console.error("Auto-evaluation failed:", err);
              
              // Store error results so players aren't stuck
              const errorResult = {
                prompt: "",
                htmlString: "<div class='p-8 text-center'>AI evaluation failed. Please try again.</div>",
                score: 0,
                commentary: "AI evaluation encountered an error",
              };
              
              gameStore.updateResults(
                gameId,
                {
                  ...errorResult,
                  prompt: updatedGame.player1.prompt || "",
                },
                {
                  ...errorResult,
                  prompt: updatedGame.player2?.prompt || "",
                },
                "tie"
              );
            } finally {
              evaluatingGames.delete(gameId);
            }
          })();
        }
        
        return NextResponse.json({
          game: updatedGame,
          yourPlayerId: playerId,
          yourPlayerNumber,
        });
      }
    }

    return NextResponse.json({
      game,
      yourPlayerId: playerId,
      yourPlayerNumber,
    });
  } catch (error) {
    console.error("Get game error:", error);
    return NextResponse.json(
      { error: "Failed to get game state" },
      { status: 500 }
    );
  }
}

