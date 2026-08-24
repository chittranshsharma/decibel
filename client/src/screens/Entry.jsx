// Entry: sign in (Google or guest), create or join a room.
import { useCallback, useEffect, useRef, useState } from "react";
import { EYEBROW, PANEL, BTN_AMBER, BTN_GHOST } from "../ui";

export function EntryScreen({ onCreate, onJoin, onQuick, onHome, googleUser }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const [name, setName] = useState(() => googleUser?.name || "");
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return (new URLSearchParams(window.location.search).get("room") || "").toUpperCase().slice(0, 4);
  });
  const [googleCred, setGoogleCred] = useState(() => googleUser ? { name: googleUser.name, idToken: googleUser.idToken } : null);
  const onSignIn = useCallback((c) => setGoogleCred(c), []);

  const identityName = googleCred ? googleCred.name : (name.trim() || googleUser?.name || "");
  const idToken = googleCred ? googleCred.idToken : googleUser?.idToken;
  const canPlay = identityName.length > 0;

  return (
    <div className="mx-auto w-full max-w-md animate-rise space-y-6">
      {onHome && (
        <button
          type="button"
          onClick={onHome}
          className={`${EYEBROW} inline-flex min-h-11 items-center text-dim hover:text-white`}
        >
          ‹ Home Hub
        </button>
      )}

      <div className="space-y-1">
        <p className={EYEBROW}>Multiplayer Access</p>
        <h2 className="font-geist text-3xl font-bold tracking-[-1px] text-white">
          Enter the Room
        </h2>
        <p className="font-geist text-xs text-[#8f8f8f]">
          Choose your handle, host a private match, curate AI vibe crates, or quick-match.
        </p>
      </div>

      <div className={`${PANEL} p-6 space-y-5`}>
        {clientId &&
          (googleCred ? (
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="min-w-0 truncate font-geist text-xs text-bone">
                Signed in as <span className="font-semibold text-[#50e3c2]">{googleCred.name}</span>
              </span>
              <button
                type="button"
                onClick={() => setGoogleCred(null)}
                className="font-console text-[10px] uppercase tracking-wider text-dim hover:text-white"
              >
                Switch
              </button>
            </div>
          ) : (
            <GoogleSignIn clientId={clientId} onSignIn={onSignIn} />
          ))}

        {!googleCred && (
          <div className="space-y-1.5">
            <label className={EYEBROW}>Player Handle</label>
            <div className="relative">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="ENTER YOUR NICKNAME"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-4 py-3 font-geist text-sm uppercase tracking-wider text-white placeholder:text-dim/50 focus:border-[#50e3c2] focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => canPlay && onCreate(identityName, idToken)}
            disabled={!canPlay}
            className={`${BTN_AMBER} w-full`}
          >
            Create Private Room ▶
          </button>

          <button
            type="button"
            onClick={() => canPlay && onQuick(identityName, idToken)}
            disabled={!canPlay}
            className={`${BTN_GHOST} w-full text-center`}
          >
            Quick Play (Public Match)
          </button>
        </div>

        <div className="border-t border-white/5 pt-4 space-y-2">
          <p className={EYEBROW}>Join with Room Code</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
              placeholder="CODE"
              className="w-28 rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 text-center font-console text-base uppercase tracking-[0.25em] text-white placeholder:text-dim/40 focus:border-[#50e3c2] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => canPlay && code && onJoin(code, identityName, idToken)}
              disabled={!canPlay || !code}
              className={`${BTN_GHOST} flex-1`}
            >
              Join Room →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleSignIn({ clientId, onSignIn }) {
  const divRef = useRef(null);

  useEffect(() => {
    if (!clientId) return;
    const g = window.google;
    if (!g?.accounts?.id) return;

    g.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        try {
          const payload = JSON.parse(atob(res.credential.split(".")[1]));
          onSignIn({ name: payload.name || "Player", idToken: res.credential });
        } catch {
          // ignore
        }
      },
    });

    if (divRef.current) {
      g.accounts.id.renderButton(divRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        width: 320,
      });
    }
  }, [clientId, onSignIn]);

  return <div ref={divRef} className="flex justify-center" />;
}

export default EntryScreen;
