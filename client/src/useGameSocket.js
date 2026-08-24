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
  const seqRef = useRef(0);

  useEffect(() => {
    const expiryTimers = new Set();
    const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
      transports: ["websocket"],
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

    socket.on("chat", (m) => {
      const id = ++seqRef.current;
      setMessages((prev) => [...prev, { ...m, key: id }].slice(-60));
    });

    socket.on("reaction", (r) => {
      const key = ++seqRef.current;
      const lane = key % 5;
      setReactions((prev) => [...prev, { ...r, key, lane }]);
      const t = setTimeout(() => {
        expiryTimers.delete(t);
        setReactions((prev) => prev.filter((x) => x.key !== key));
      }, 1600);
      expiryTimers.add(t);
    });

    socket.on("playlistStatus", (status) => {
      setPlaylistStatus(status);
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
  const clearError = useCallback(() => setError(null), []);
  const clearNotice = useCallback(() => setNotice(null), []);
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
