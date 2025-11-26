import { GoogleGenAI } from "@google/genai";
import { GameResult } from "../types";

const initGenAI = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMatchCommentary = async (result: GameResult): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "Commentary system offline. (Check API Key)";

  try {
    const prompt = `
      You are an excited, high-energy fighting game announcer for a 3v3 'King of Fighters' style tournament.
      A match just ended.
      
      Winning Team: ${result.winner}
      Winning Members: ${result.winningTeamNames.join(', ')}
      Loser: ${result.loser}
      Total Remaining Health (Winner): ${result.winnerHealth}
      Match Duration: ${result.duration} seconds.

      Write a short, hype commentary (2 sentences max).
      Highlight if it was a "Reverse Sweep" (if health is low), a "Perfect Victory" (if health is high), or a "Time Out".
      Mention one of the winning characters by name if possible.
      Use arcade slang (K.O., Super Special Move, Combo).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "INCREDIBLE TEAM BATTLE!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "THE SATELLITE FEED IS INTERRUPTED! BUT THE CROWD GOES WILD!";
  }
};
