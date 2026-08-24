// groqService.js — Ultra-fast Groq LPU inference for DJ commentary and AI Crate Generation.
import { log } from "./log.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 4000;

// Curated brutal & tough fallback lines when offline or without API key
const FALLBACK_WINNER_LINES = [
  "smoked the entire lobby with demonic reflexes. The rest of you are cooked.",
  "locked it in before the snare hit. Everyone else was still buffering.",
  "just took the aux cord and threw everyone else out of the whip.",
  "is putting on an absolute clinic while y'all are playing on 500 ping.",
  "has golden ears. The rest of this lobby needs to clean the wax out.",
];

const FALLBACK_MISS_LINES = [
  "Dead silence in the room. Aux cord revoked for everybody.",
  "Zero correct? Y'all playing with broken earbuds on mute?",
  "A total brick of a round. Go wash your ears out.",
  "Not a single person knew that classic? Tragic.",
  "Disaster class. Even the algorithm is disappointed in you.",
];

const FALLBACK_STREAK_LINES = [
  "is running rampant while the rest of you donate points like charity.",
  "is on a straight-up rampage. Someone call security on them.",
  "is terrorizing this lobby. Stop embarrassing yourselves and lock in.",
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Executes a fast completion against Groq API with strict timeout & error boundaries.
 */
async function queryGroq(messages, maxTokens = 80, temperature = 0.85) {
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
 * 1. AI DJ Live Round Commentary & Brutal Roasts
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

  const systemPrompt = `You are "DJ Decibel", a ruthless, street-smart, unhinged underground DJ and MC hosting a cutthroat music trivia battle called Decibel.
Generate EXACTLY ONE brutal, punchy roast or explosive swaggering hype sentence (MAXIMUM 16 words).
Style rules:
- If someone won with fast speed: Give them aggressive, swaggering hype ("Demon reflexes", "Smoked the whole room", "Broke the sound barrier").
- If players missed or got zero: Brutally roast them with zero mercy ("Revoke their Spotify", "Ears full of cement", "Playing on mute?", "Cooked").
- If someone is on a streak: Call out the rest of the room for getting humiliated.
- Use raw street-smart music slang. NO corporate AI fluff. NO quotation marks. Be vicious, witty, and hilarious.`;

  const userContext = `Round ${round}/${totalRounds}.
Track played: "${track?.trackName}" by ${track?.artistName}.
Round outcome: ${
    winner
      ? `Fastest correct was ${winner.name} in ${winner.answerTimeSeconds}s (Streak: ${winner.streak || 1}). ${correctCount}/${results.length} players got it right.`
      : `Nobody got the answer correct (${results.length} players completely missed).`
  }
${isFinalRound ? "This was the final round of the match!" : ""}`;

  const result = await queryGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContext },
  ], 50, 0.9);

  if (result) return result.replace(/^["']|["']$/g, "");

  // Offline fallback
  if (!winner || correctCount === 0) return getRandom(FALLBACK_MISS_LINES);
  return `${winner.name} ${getRandom(FALLBACK_WINNER_LINES)}`;
}

/**
 * 2. AI Match Finale Coronation & Savage Roast
 */
export async function generateMatchVerdict({ leaderboard = [] }) {
  const champ = leaderboard[0];
  const runnerUp = leaderboard[1];
  const losers = leaderboard.slice(1);

  if (!GROQ_API_KEY || !champ) {
    if (!champ) return "Match concluded! Lobby survived.";
    return `👑 ${champ.name} ran through this lobby with ${champ.score} PTS. The rest of y'all need music lessons.`;
  }

  const systemPrompt = `You are "DJ Decibel", the unfiltered underground DJ delivering the final match verdict and roast for Decibel.
Generate a savage 1-2 sentence final coronation and brutal post-match roast (MAX 25 words).
Rules:
- Crown the champion with heavy swagger.
- Absolutely cook the runners-up and bottom of the leaderboard for getting dismantled.
- NO generic AI slop. Be raw, gritty, witty, and devastatingly funny.`;

  const userContext = `Champion: ${champ.name} (${champ.score} PTS).
Runner-Up: ${runnerUp ? `${runnerUp.name} (${runnerUp.score} PTS)` : "None"}.
Losers: ${losers.map((p) => `${p.name} (${p.score} PTS)`).join(", ")}.`;

  const result = await queryGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContext },
  ], 75, 0.95);

  if (result) return result.replace(/^["']|["']$/g, "");

  return `👑 ${champ.name} ran through this lobby with ${champ.score} PTS. The rest of y'all need music lessons.`;
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
