import { NextRequest, NextResponse } from "next/server";
import { gameStore } from "@/lib/game-store";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitizeHtml } from "@/lib/utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function evaluatePrompts(
  targetDescription: string,
  targetName: string,
  prompt1: string,
  prompt2: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Generate HTML for player 1
  const player1HtmlPrompt = `You are a web UI generator. Generate HTML that recreates the UI based on the user's description.

Target UI Description: ${targetDescription}
Target UI Name (for reference only, not to be shown): ${targetName}

User's Prompt: ${prompt1}

Generate clean, semantic HTML using Tailwind CSS utility classes for styling. 
Do NOT include script tags, inline JavaScript, event handlers, or external network calls.
Wrap your HTML output between START-UI and END-UI markers.

START-UI
[Your HTML here]
END-UI`;

  const player1Response = await model.generateContent(player1HtmlPrompt);
  const player1Text = player1Response.response.text();
  const player1Html = extractHtml(player1Text);

  // Generate HTML for player 2
  const player2HtmlPrompt = `You are a web UI generator. Generate HTML that recreates the UI based on the user's description.

Target UI Description: ${targetDescription}
Target UI Name (for reference only, not to be shown): ${targetName}

User's Prompt: ${prompt2}

Generate clean, semantic HTML using Tailwind CSS utility classes for styling. 
Do NOT include script tags, inline JavaScript, event handlers, or external network calls.
Wrap your HTML output between START-UI and END-UI markers.

START-UI
[Your HTML here]
END-UI`;

  const player2Response = await model.generateContent(player2HtmlPrompt);
  const player2Text = player2Response.response.text();
  const player2Html = extractHtml(player2Text);

  // Evaluate both prompts
  const evaluationPrompt = `You are a UI design judge. Evaluate how well each player's prompt captures the essence of the target UI.

Target UI: ${targetName}
Target Description: ${targetDescription}

Player 1's Prompt: "${prompt1}"
Player 2's Prompt: "${prompt2}"

Rate each prompt on a scale of 0-100 based on:
- Layout accuracy
- Visual design capture
- Completeness of description
- Understanding of UI patterns

Respond ONLY with valid JSON in this exact format:
{
  "player1": {
    "score": [0-100],
    "commentary": "Brief explanation (1-2 sentences)"
  },
  "player2": {
    "score": [0-100],
    "commentary": "Brief explanation (1-2 sentences)"
  },
  "winner": "player1" or "player2" or "tie"
}`;

  const evaluationResponse = await model.generateContent(evaluationPrompt);
  const evaluationText = evaluationResponse.response.text();
  const evaluation = parseEvaluation(evaluationText);

  return {
    player1: {
      htmlString: sanitizeHtml(player1Html),
      score: evaluation.player1.score,
      commentary: evaluation.player1.commentary,
    },
    player2: {
      htmlString: sanitizeHtml(player2Html),
      score: evaluation.player2.score,
      commentary: evaluation.player2.commentary,
    },
    winner: evaluation.winner,
  };
}

function extractHtml(text: string): string {
  const startMarker = "START-UI";
  const endMarker = "END-UI";
  
  const startIndex = text.indexOf(startMarker);
  const endIndex = text.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    return text.substring(startIndex + startMarker.length, endIndex).trim();
  }
  
  // Fallback: try to extract HTML between code blocks
  const codeBlockMatch = text.match(/```html\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  return text.trim();
}

function parseEvaluation(text: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch (e) {
    console.error("Failed to parse evaluation:", e);
  }
  
  // Fallback
  return {
    player1: { score: 50, commentary: "Unable to evaluate" },
    player2: { score: 50, commentary: "Unable to evaluate" },
    winner: "tie",
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { playerId, prompt, _autoEvaluate } = await request.json();

    if (!playerId || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }


    const game = gameStore.getGame(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    let updatedGame = game;
    
    // Only submit the prompt if this isn't just an auto-evaluate trigger
    if (!_autoEvaluate) {
      const submitted = gameStore.submitPrompt(gameId, playerId, prompt);
      
      if (!submitted) {
        return NextResponse.json(
          { error: "Failed to submit prompt" },
          { status: 400 }
        );
      }
      
      updatedGame = submitted;
    }

    // If both players have submitted, trigger AI evaluation
    if (
      updatedGame.status === "waiting_for_ai" &&
      updatedGame.player1.prompt !== undefined &&
      updatedGame.player2?.prompt !== undefined
    ) {
      // Run AI evaluation asynchronously but wait for it
      try {
        console.log(`Starting AI evaluation for game ${gameId}...`);
        
        const results = await evaluatePrompts(
          updatedGame.targetWebsite.description,
          updatedGame.targetWebsite.name,
          updatedGame.player1.prompt,
          updatedGame.player2.prompt
        );

        console.log(`AI evaluation completed for game ${gameId}`);

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
        
        console.log(`Results stored for game ${gameId}, winner: ${results.winner}`);
      } catch (aiError) {
        console.error("AI evaluation error:", aiError);
        console.error("Error details:", JSON.stringify(aiError, null, 2));
        
        // Store error results so players aren't stuck in waiting state
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
        
        console.log(`Error results stored for game ${gameId}`);
      }
    }

    const finalGame = gameStore.getGame(gameId);
    return NextResponse.json({ game: finalGame });
  } catch (error) {
    console.error("Submit prompt error:", error);
    return NextResponse.json(
      { error: "Failed to submit prompt" },
      { status: 500 }
    );
  }
}

