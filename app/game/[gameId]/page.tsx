"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundPaperShaders } from "@/components/ui/background-paper-shaders";
import { GameStateResponse } from "@/types/game";
import WaitingForOpponent from "@/components/game/WaitingForOpponent";
import PromptPhase from "@/components/game/PromptPhase";
import ResultsPhase from "@/components/game/ResultsPhase";

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.gameId;
  const router = useRouter();
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const playerId = sessionStorage.getItem("playerId");
    if (!playerId) {
      router.push("/");
      return;
    }

    let interval: NodeJS.Timeout | null = null;

    const fetchGameState = async () => {
      try {
        const response = await fetch(`/api/game/${gameId}?playerId=${playerId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Game not found - stop polling and redirect to home after a brief message
            if (interval) clearInterval(interval);
            setError("Game not found. Redirecting to home...");
            setLoading(false);
            setTimeout(() => router.push("/"), 2000);
            return;
          }
          throw new Error("Failed to fetch game state");
        }

        const data: GameStateResponse = await response.json();
        setGameState(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching game state:", err);
        if (interval) clearInterval(interval);
        setError("Failed to load game. Please try again.");
        setLoading(false);
      }
    };

    fetchGameState();

    // Poll for updates every 2 seconds
    interval = setInterval(fetchGameState, 2000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameId, router]);

  const handleBackToMenu = () => {
    router.push("/");
  };

  const handlePlayAgain = async () => {
    router.push("/");
    // Small delay to ensure we're back on the home page
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (loading) {
    return (
      <BackgroundPaperShaders className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game...</p>
        </motion.div>
      </BackgroundPaperShaders>
    );
  }

  if (error || !gameState) {
    return (
      <BackgroundPaperShaders className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <p className="text-destructive text-lg">{error || "Game not found"}</p>
          <button
            onClick={handleBackToMenu}
            className="text-primary hover:underline"
          >
            Back to Menu
          </button>
        </motion.div>
      </BackgroundPaperShaders>
    );
  }

  return (
    <BackgroundPaperShaders className="min-h-screen">
      <AnimatePresence mode="wait">
        {gameState.game.status === "waiting_for_opponent" && (
          <WaitingForOpponent key="waiting" />
        )}

        {gameState.game.status === "prompt_phase" && (
          <PromptPhase
            key="prompt"
            game={gameState.game}
            playerId={gameState.yourPlayerId}
            playerNumber={gameState.yourPlayerNumber}
          />
        )}

        {(gameState.game.status === "waiting_for_ai" || gameState.game.status === "results") && (
          <ResultsPhase
            key="results"
            game={gameState.game}
            yourPlayerNumber={gameState.yourPlayerNumber}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </AnimatePresence>
    </BackgroundPaperShaders>
  );
}

