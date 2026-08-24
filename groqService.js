// groqService.js — Ultra-fast Groq LPU inference for DJ commentary and AI Crate Generation.
import { log } from "./log.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 4000;

// Curated witty fallback dialogue when offline or without API key
const FALLBACK_WINNER_LINES = [
  "Locked in with lightning reflexes! Can anyone catch them?",
  "Pure muscle memory on display. That was terrifyingly fast.",
  "Turned on the turbochargers for that round!",
  "Shazam wishes it could identify tracks that quickly.",
  "Flawless ears. That round was an absolute clinic.",
];

const FALLBACK_MISS_LINES = [
  "Tough cut! That one stumped the entire squad.",
  "A collective silence in the room — crates run deep!",
  "Nobody called that one. Let's see who bounces back next round.",
  "Deep cuts always humble the room. Reset and lock in!",
];

const FALLBACK_STREAK_LINES = [
  "Unstoppable momentum! The streak continues to grow.",
  "On absolute fire right now — someone throw some water on them!",
  "Heating up the leaderboard with relentless accuracy.",
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Executes a fast completion against Groq API with strict timeout & error boundaries.
 */
async function queryGroq(messages, maxTokens = 80, temperature = 0.7) {
  if (!GROQ_API_KEY) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      log.warn("Groq API error response", { status: response.status });
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || "";
    return content;
  } catch (err) {
    clearTimeout(timeoutId);
    log.warn("Groq API request failed or timed out", { error: String(err?.message || err) });
    return null;
  }
}

/**
 * 1. AI DJ Live Round Commentary
 */
export async function generateDjCommentary({ track, winner, results = [], round = 1, totalRounds = 10 }) {
  const correctCount = results.filter((r) => r.correct).length;
  const isFinalRound = round >= totalRounds;

  // If no Groq key, use smart curated arcade fallback
  if (!GROQ_API_KEY) {
    if (!winner || correctCount === 0) return getRandom(FALLBACK_MISS_LINES);
    if (winner.streak > 2) return `${winner.name} ${getRandom(FALLBACK_STREAK_LINES)}`;
    return `${winner.name} ${getRandom(FALLBACK_WINNER_LINES)}`;
  }

  const systemPrompt = `You are "DJ Decibel", the charismatic, witty, high-energy live host of a fast-paced multiplayer music trivia game called Decibel.
Generate a single, snappy, hilarious or hype commentary sentence (maximum 18 words) reacting to what just happened in the round.
Do NOT use quotation marks. Keep it punchy, playful, and fun for friends playing together.`;

  const userContext = `Round ${round}/${totalRounds}.
Track played: "${track?.trackName}" by ${track?.artistName}.
Round outcome: ${
    winner
      ? `Fastest correct was ${winner.name} in ${winner.answerTimeSeconds}s (Streak: ${winner.streak || 1}). ${correctCount}/${results.length} players got it right.`
      : `Nobody got the answer correct (${results.length} missed).`
  }
${isFinalRound ? "This was the final round of the match!" : ""}`;

  const result = await queryGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContext },
  ], 50, 0.75);

  if (result) return result.replace(/^["']|["']$/g, "");

  // Offline fallback
  if (!winner || correctCount === 0) return getRandom(FALLBACK_MISS_LINES);
  return `${winner.name} ${getRandom(FALLBACK_WINNER_LINES)}`;
}

/**
 * 2. AI Match Finale Coronation & Roast
 */
export async function generateMatchVerdict({ leaderboard = [] }) {
  const champ = leaderboard[0];
  const runnerUp = leaderboard[1];

  if (!GROQ_API_KEY || !champ) {
    if (!champ) return "Match concluded! Great battle squad.";
    return `👑 All hail ${champ.name} with ${champ.score} points! Victory belongs to the true music connoisseur.`;
  }

  const systemPrompt = `You are "DJ Decibel", the live host of music trivia game Decibel.
Generate a short 1-2 sentence final verdict and coronation roast for the match conclusion.
Crown the champion, playfully tease the runner-ups, and keep the energy electric. Max 25 words.`;

  const userContext = `Champion: ${champ.name} with ${champ.score} PTS.
Runner-Up: ${runnerUp ? `${runnerUp.name} (${runnerUp.score} PTS)` : "None"}.
Total Players: ${leaderboard.length}.`;

  const result = await queryGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContext },
  ], 75, 0.8);

  if (result) return result.replace(/^["']|["']$/g, "");

  return `👑 All hail ${champ.name} with ${champ.score} points! Victory belongs to the true music connoisseur.`;
}

/**
 * 3. Natural Language AI Vibe & Crate Generator
 */
export async function generateVibeCrate(userVibePrompt) {
  if (!userVibePrompt || typeof userVibePrompt !== "string") {
    return {
      vibeTitle: "Random Crate Mix",
      description: "A mixed crate of top hits",
      searchQueries: ["Top Hits", "Hip Hop", "Pop", "Rock"],
    };
  }

  const cleanPrompt = userVibePrompt.trim().slice(0, 150);

  if (!GROQ_API_KEY) {
    // Intelligent fallback for common prompt themes
    return {
      vibeTitle: `${cleanPrompt.slice(0, 24)} Crate`,
      description: `Curated music collection matching "${cleanPrompt}"`,
      searchQueries: [cleanPrompt, `${cleanPrompt} hits`, `${cleanPrompt} music`],
    };
  }

  const systemPrompt = `You are an expert music curator and crate-digger.
The user will give you a freeform vibe, mood, era, or genre description (e.g., "90s Tokyo midnight drift", "monsoon cafe indie", "gym rage phonk").
Respond ONLY with a valid JSON object in this exact format, with no surrounding markdown or code blocks:
{
  "vibeTitle": "Short catchy title (2-4 words)",
  "description": "1 sentence describing the aesthetic",
  "searchQueries": ["Artist or Track Search 1", "Artist or Track Search 2", "Artist or Track Search 3", "Artist or Track Search 4", "Artist or Track Search 5", "Artist or Track Search 6"]
}`;

  const rawJson = await queryGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Curate a crate for: "${cleanPrompt}"` },
  ], 200, 0.6);

  if (rawJson) {
    try {
      // Clean any potential markdown wrapper
      const jsonStr = rawJson.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(jsonStr);
      if (parsed.vibeTitle && Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0) {
        return {
          vibeTitle: String(parsed.vibeTitle).slice(0, 40),
          description: String(parsed.description || `Curated for ${cleanPrompt}`).slice(0, 100),
          searchQueries: parsed.searchQueries.map((q) => String(q).slice(0, 50)).slice(0, 8),
        };
      }
    } catch (e) {
      log.warn("Failed to parse Groq vibe JSON", { error: String(e?.message || e), raw: rawJson });
    }
  }

  return {
    vibeTitle: `${cleanPrompt.slice(0, 24)} Crate`,
    description: `Curated music collection matching "${cleanPrompt}"`,
    searchQueries: [cleanPrompt, `${cleanPrompt} hits`, `${cleanPrompt} music`],
  };
}

export default {
  generateDjCommentary,
  generateMatchVerdict,
  generateVibeCrate,
};
