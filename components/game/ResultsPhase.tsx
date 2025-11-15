"use client";

import { motion } from "framer-motion";
import { Game } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BrowserFrame from "./BrowserFrame";
import UIPreview from "./UIPreview";

interface ResultsPhaseProps {
  game: Game;
  yourPlayerNumber: "player1" | "player2";
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export default function ResultsPhase({
  game,
  yourPlayerNumber,
  onPlayAgain,
  onBackToMenu,
}: ResultsPhaseProps) {
  const isWaitingForAI = game.status === "waiting_for_ai";
  const yourResult = yourPlayerNumber === "player1" ? game.player1.result : game.player2?.result;
  const opponentResult = yourPlayerNumber === "player1" ? game.player2?.result : game.player1.result;
  
  const didYouWin = game.winner === yourPlayerNumber;
  const isTie = game.winner === "tie";

  if (isWaitingForAI) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-16 h-16 mx-auto"
          >
            <div className="w-full h-full rounded-full border-4 border-primary border-t-transparent"></div>
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Synthesizing vibes...</h2>
            <p className="text-muted-foreground">
              AI is generating and evaluating your UIs
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-4 lg:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Winner Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          {isTie ? (
            <div className="inline-block px-8 py-4 bg-secondary/50 backdrop-blur-sm rounded-xl border">
              <h1 className="text-3xl font-bold">It&apos;s a Tie! 🤝</h1>
              <p className="text-muted-foreground mt-2">Both prompts captured the vibe equally well</p>
            </div>
          ) : didYouWin ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-block px-8 py-4 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/50"
            >
              <h1 className="text-4xl font-bold text-primary">You Win! 🎉</h1>
              <p className="text-muted-foreground mt-2">Your prompt captured the vibe perfectly</p>
            </motion.div>
          ) : (
            <div className="inline-block px-8 py-4 bg-secondary/50 backdrop-blur-sm rounded-xl border">
              <h1 className="text-3xl font-bold">You Lost This Round</h1>
              <p className="text-muted-foreground mt-2">Better luck next time!</p>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Target */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-center">Target UI</h2>
            <BrowserFrame screenshotPath={game.targetWebsite.screenshotPath} />
          </motion.div>

          {/* Middle & Right: Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Your Result */}
            <Card className={`backdrop-blur-sm bg-card/95 ${didYouWin && !isTie ? 'border-primary/50 shadow-primary/20' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>You {didYouWin && !isTie && '👑'}</span>
                  <span className="text-2xl font-bold text-primary">
                    {yourResult?.score ?? 0}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Your Prompt</h4>
                  <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded">
                    {game[yourPlayerNumber]?.prompt || "(empty)"}
                  </p>
                </div>

                {yourResult && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">AI Commentary</h4>
                      <p className="text-sm text-muted-foreground italic">
                        {yourResult.commentary}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Generated UI</h4>
                      <UIPreview html={yourResult.htmlString} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Opponent Result */}
            <Card className={`backdrop-blur-sm bg-card/95 ${!didYouWin && !isTie ? 'border-primary/50 shadow-primary/20' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Opponent {!didYouWin && !isTie && '👑'}</span>
                  <span className="text-2xl font-bold text-primary">
                    {opponentResult?.score ?? 0}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Their Prompt</h4>
                  <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded">
                    {yourPlayerNumber === "player1"
                      ? game.player2?.prompt || "(empty)"
                      : game.player1.prompt || "(empty)"}
                  </p>
                </div>

                {opponentResult && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">AI Commentary</h4>
                      <p className="text-sm text-muted-foreground italic">
                        {opponentResult.commentary}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Generated UI</h4>
                      <UIPreview html={opponentResult.htmlString} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4"
        >
          <Button onClick={onPlayAgain} size="lg">
            Play Again
          </Button>
          <Button onClick={onBackToMenu} variant="outline" size="lg">
            Back to Menu
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

