"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function WaitingForOpponent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="backdrop-blur-sm bg-card/95 w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
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
              <h2 className="text-2xl font-semibold">Finding Opponent...</h2>
              <p className="text-muted-foreground">
                Waiting for another player to join
              </p>
            </div>

            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-sm text-muted-foreground"
            >
              This should only take a moment
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

