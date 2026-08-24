// useGameSocket — single source of truth for all game state, fed only by the
// server over Socket.IO.

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SESSION_KEY = "snippet.session";
function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
function saveSession(s) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* storage blocked */
  }
}
function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function useGameSocket() {
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [state, setState] = useState(null); // latest public state snapshot
  const [reveal, setReveal] = useState(null); // last round reveal (answer + deltas)
  const [gameOver, setGameOver] = useState(null); // final leaderboard
  const [loading, setLoading] = useState(null); // { message } while server is busy
  const [error, setError] = useState(null); // transient error message
  const [roundMeta, setRoundMeta] = useState(null); // { questionValue, maxSpeedBonus, roundIndex }
  const [countdown, setCountdown] = useState(null); // { seconds, round } during the 3-2-1
  const [notice, setNotice] = useState(null); // transient bottom toast
  const [messages, setMessages] = useState([]); // room chat log
  const [reactions, setReactions] = useState([]); // ephemeral floated call-outs
  const [playlistStatus, setPlaylistStatus] = useState(null); // { loading, error, name, tracksCount }
  const [vibeStatus, setVibeStatus] = useState(null); // { loading, error, ready, vibeTitle, description, tracksCount }
  const [fiftyFiftyResult, setFiftyFiftyResult] = useState(null); // { eliminated: string[] } — server-safe 50:50
  const seqRef = useRef(0);

  useEffect(() => {
    const expiryTimers = new Set();
    const rawUrl = import.meta.env.VITE_SOCKET_URL || "";
    const isLocalhost = rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1");
    const targetUrl =
      window.location.hostname.includes("vercel.app")
        ? (!rawUrl || isLocalhost ? "https://decibel-4crh.onrender.com" : rawUrl)
        : (rawUrl || window.location.origin);

    const socket = io(targetUrl, {
      transports: ["polling", "websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setMyId(socket.id);
      const s = loadSession();
      if (s && s.code && s.token) socket.emit("rejoin", { code: s.code, token: s.token });
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("roomJoined", ({ code, id, token }) => {
      setMyId(id);
      setRoomCode(code);
      if (token) saveSession({ code, token });
    });

    socket.on("rejoinFailed", () => clearSession());

    socket.on("state", (s) => {
      setState(s);
      setLoading(null);
      if (s.phase === "ROUND_PLAYING") {
        setReveal(null);
        setCountdown(null);
      }
      if (s.phase !== "GAME_OVER") setGameOver(null);
    });

    socket.on("reveal", (r) => setReveal(r));

    socket.on("roundStart", (data) => {
      setRoundMeta(data);
      setCountdown(null);
    });

    socket.on("countdown", (d) => {
      setCountdown(d || { seconds: 3 });
      setLoading(null);
    });

    socket.on("fiftyFiftyResult", (d) => {
      if (d && Array.isArray(d.eliminated)) setFiftyFiftyResult(d);
    });

    socket.on("chat", (m) => {
      const msgId = ++seqRef.current;
      setMessages((prev) => [
        ...prev,
        {
          key: msgId,
          playerId: m.id,
          playerName: m.name || "Guest",
          text: m.text,
          ts: m.ts,
        },
      ].slice(-60));
    });

    socket.on("reaction", (r) => {
      const key = ++seqRef.current;
      const lane = key % 5;
      const x = 15 + Math.random() * 70;
      const y = 40 + Math.random() * 40;
      setReactions((prev) => [...prev, { ...r, key, lane, x, y }]);
      const t = setTimeout(() => {
        expiryTimers.delete(t);
        setReactions((prev) => prev.filter((x) => x.key !== key));
      }, 1600);
      expiryTimers.add(t);
    });

    socket.on("playlistStatus", (status) => {
      setPlaylistStatus(status);
    });

    socket.on("vibeStatus", (status) => {
      setVibeStatus(status);
    });

    socket.on("playerLeft", (d) =>
      setNotice(d?.held ? `${d?.name || "A player"} dropped — can rejoin` : `${d?.name || "A player"} left`)
    );
    socket.on("newHost", (d) => setNotice(`${d?.name || "Someone"} is now host`));
    socket.on("waitingForPlayers", () => setNotice("Waiting for more players…"));
    socket.on("notice", (d) => setNotice(d?.message || d?.text));

    socket.on("gameOver", (g) => setGameOver(g));
    socket.on("loading", (l) => setLoading(l && l.message ? l : { message: "Loading…" }));
    socket.on("errorMsg", (e) => {
      setError((e && e.message) || "Something went wrong.");
      setLoading(null);
    });

    return () => {
      for (const t of expiryTimers) clearTimeout(t);
      expiryTimers.clear();
      socket.close();
    };
  }, []);

  const createRoom = useCallback(
    (name, idToken) => socketRef.current?.emit("createRoom", { name, idToken }),
    []
  );
  const joinRoom = useCallback(
    (code, name, idToken) => socketRef.current?.emit("joinRoom", { code, name, idToken }),
    []
  );
  const quickPlay = useCallback(
    (name, idToken) => socketRef.current?.emit("quickPlay", { name, idToken }),
    []
  );
  const start = useCallback((settings) => socketRef.current?.emit("startGame", settings || {}), []);
  const guess = useCallback((option) => socketRef.current?.emit("guess", { option }), []);
  const restart = useCallback(() => socketRef.current?.emit("restart"), []);
  const sendChat = useCallback((text) => socketRef.current?.emit("chat", { text }), []);
  const sendReaction = useCallback((token) => socketRef.current?.emit("react", { token }), []);
  const setCustomPlaylist = useCallback(
    (url) => socketRef.current?.emit("setCustomPlaylist", { url }),
    []
  );
  const generateAiVibe = useCallback(
    (prompt) => socketRef.current?.emit("generateAiVibe", { prompt }),
    []
  );
  const clearError = useCallback(() => setError(null), []);
  const clearNotice = useCallback(() => setNotice(null), []);
  const clearFiftyFifty = useCallback(() => setFiftyFiftyResult(null), []);
  const requestFiftyFifty = useCallback(() => socketRef.current?.emit("fiftyFifty"), []);
  const leaveRoom = useCallback(() => {
    clearSession();
    socketRef.current?.disconnect();
    setRoomCode(null);
    setState(null);
    setReveal(null);
    setGameOver(null);
    setMessages([]);
    setReactions([]);
    setCountdown(null);
    setRoundMeta(null);
    setPlaylistStatus(null);
    setVibeStatus(null);
    setFiftyFiftyResult(null);
    socketRef.current?.connect();
  }, []);

  return {
    connected,
    myId,
    state,
    reveal,
    gameOver,
    loading,
    error,
    roundMeta,
    countdown,
    notice,
    messages,
    reactions,
    roomCode,
    playlistStatus,
    setPlaylistStatus,
    setCustomPlaylist,
    vibeStatus,
    setVibeStatus,
    generateAiVibe,
    fiftyFiftyResult,
    clearFiftyFifty,
    requestFiftyFifty,
    createRoom,
    joinRoom,
    quickPlay,
    start,
    guess,
    restart,
    sendChat,
    sendReaction,
    clearError,
    clearNotice,
    leaveRoom,
  };
}

export default useGameSocket;
