"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Game } from "@/types/game";
import { Button } from "@/components/ui/button";
import { containsBlockedWord } from "@/lib/utils";
import BrowserFrame from "./BrowserFrame";

interface PromptPhaseProps {
  game: Game;
  playerId: string;
  playerNumber: "player1" | "player2";
}

export default function PromptPhase({
  game,
  playerId,
  playerNumber,
}: PromptPhaseProps) {
  const [prompt, setPrompt] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(game.promptPhaseDuration);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlayer = playerNumber === "player1" ? game.player1 : game.player2;
  const hasSubmitted = currentPlayer?.prompt !== undefined;

  useEffect(() => {
    if (hasSubmitted) {
      setSubmitted(true);
      return;
    }

    if (!game.promptPhaseStartedAt) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - game.promptPhaseStartedAt!) / 1000);
      const remaining = Math.max(0, game.promptPhaseDuration - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0 && !submitted) {
        handleSubmit();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [game, hasSubmitted, submitted]);

  const handleSubmit = async () => {
    if (submitted || hasSubmitted) return;

    // Validate for blocked words
    if (containsBlockedWord(prompt, game.targetWebsite.blockedWords)) {
      setError(`Cannot mention brand names like: ${game.targetWebsite.blockedWords.join(", ")}`);
      return;
    }

    setSubmitted(true);
    setError(null);

    try {
      const response = await fetch(`/api/game/${game.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit prompt");
      }
    } catch (err) {
      console.error("Error submitting prompt:", err);
      setError("Failed to submit. Please check your connection.");
      setSubmitted(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 600) {
      setPrompt(value);
      setError(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-4 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Timer */}
        <motion.div
          className="text-center mb-6"
          animate={{
            scale: timeRemaining <= 10 && timeRemaining > 0 ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: timeRemaining <= 10 ? Infinity : 0 }}
        >
          <div className="inline-block">
            <div
              className={`text-5xl font-bold ${
                timeRemaining <= 10 ? "text-destructive" : "text-primary"
              }`}
            >
              {timeRemaining}s
            </div>
            <div className="text-sm text-muted-foreground mt-1">Time Remaining</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Target Website */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-center">Target UI</h2>
            <BrowserFrame screenshotPath={game.targetWebsite.screenshotPath} />
          </motion.div>

          {/* Right: Prompt Input */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-card/95 backdrop-blur-sm rounded-xl border shadow-xl p-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Your Prompt</h2>
                <p className="text-sm text-muted-foreground">
                  Describe the UI to recreate this app. You cannot mention brand
                  or product names.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={prompt}
                  onChange={handlePromptChange}
                  disabled={submitted || hasSubmitted}
                  placeholder="Describe the layout, colors, components, and overall design..."
                  className="w-full h-64 px-4 py-3 bg-background border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{prompt.length} / 600 characters</span>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded"
                >
                  {error}
                </motion.div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitted || hasSubmitted || prompt.trim().length === 0}
                className="w-full"
                size="lg"
              >
                {submitted || hasSubmitted
                  ? "Prompt Submitted"
                  : "Submit Prompt"}
              </Button>

              {(submitted || hasSubmitted) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-center text-muted-foreground"
                >
                  Waiting for opponent...
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

