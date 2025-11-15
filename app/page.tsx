"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BackgroundPaperShaders } from "@/components/ui/background-paper-shaders";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const router = useRouter();

  const handleFindGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/matchmaking", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to find game");
      }

      const data = await response.json();
      
      // Store player info in sessionStorage
      sessionStorage.setItem("playerId", data.playerId);
      sessionStorage.setItem("playerNumber", data.playerNumber);
      
      // Navigate to game
      router.push(`/game/${data.gameId}`);
    } catch (error) {
      console.error("Error finding game:", error);
      alert("Failed to find a game. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <BackgroundPaperShaders className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Competitive Vibecoding
              </CardTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CardDescription className="text-base">
                Battle to recreate the best UI with AI
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                onClick={handleFindGame}
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? "Finding Game..." : "Find Game"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <button
                onClick={() => setShowRules(!showRules)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center underline-offset-2 hover:underline"
              >
                How it works
              </button>
            </motion.div>

            {showRules && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-muted-foreground space-y-2 border-t border-border pt-4"
              >
                <p>
                  <strong className="text-foreground">1.</strong> You&apos;ll see a screenshot of a well-known app.
                </p>
                <p>
                  <strong className="text-foreground">2.</strong> Write a prompt describing how to recreate the UI (no brand names!).
                </p>
                <p>
                  <strong className="text-foreground">3.</strong> AI generates HTML based on your prompt.
                </p>
                <p>
                  <strong className="text-foreground">4.</strong> The best recreation wins!
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </BackgroundPaperShaders>
  );
}

