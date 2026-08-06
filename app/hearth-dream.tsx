"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hearthDreams } from "./hearth-dreams";
import { supabase } from "./lib/supabase";

const awakeningPhrases = [
  "Awaken",
  "Open your eyes",
  "Return to the firelight",
  "Wake by the Hearth",
  "Let the dream fade",
  "Stir from your slumber",
  "Return to the Hearthall",
  "Rise gently",
];

export const transportedDreamKey = "oaw-transported-hearth-dream";

type TransportedDream = {
  dream: (typeof hearthDreams)[number];
  awakeningPhrase: string;
};

function takeTransportedDream(): TransportedDream | null {
  const storedDream = window.sessionStorage.getItem(transportedDreamKey);
  if (!storedDream) return null;

  window.sessionStorage.removeItem(transportedDreamKey);
  try {
    return JSON.parse(storedDream) as TransportedDream;
  } catch {
    return null;
  }
}

function randomItem<T>(items: readonly T[]) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return items[values[0] % items.length];
}

export function HearthDreamOverlay({
  dream,
  awakeningPhrase,
  onAwaken,
  alreadyAsleep = false,
}: {
  dream: (typeof hearthDreams)[number];
  awakeningPhrase: string;
  onAwaken: () => void;
  alreadyAsleep?: boolean;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onAwaken();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onAwaken]);

  return (
    <div className={`hearth-dream-backdrop${alreadyAsleep ? " already-asleep" : ""}`} role="presentation">
      <article className="hearth-dream-dialog" role="dialog" aria-modal="true" aria-labelledby="hearth-dream-title" aria-describedby="hearth-dream-text">
        <p className="hearth-dream-whisper">You fall into a dream...</p>
        <h3 id="hearth-dream-title">{dream.title}</h3>
        <p id="hearth-dream-text">{dream.text}</p>
        <button type="button" onClick={onAwaken} autoFocus>{awakeningPhrase}</button>
      </article>
    </div>
  );
}

export default function HearthDream() {
  const searchParams = useSearchParams();
  const isArrivingFromTappery = searchParams.get("rest") === "1";
  const [dream, setDream] = useState<(typeof hearthDreams)[number] | null>(null);
  const [awakeningPhrase, setAwakeningPhrase] = useState("Awaken");
  const [handoffComplete, setHandoffComplete] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const transportedDream = takeTransportedDream();
    if (transportedDream) {
      setDream(transportedDream.dream);
      setAwakeningPhrase(transportedDream.awakeningPhrase);
    }
    setHandoffComplete(true);
  }, []);

  const closeDream = () => {
    setDream(null);
    if (isArrivingFromTappery) window.history.replaceState(null, "", "/hearthall#hearth");
    window.setTimeout(() => triggerRef.current?.focus(), 50);
  };

  const beginDream = () => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) return supabase.rpc("record_patron_nap");
    });
    setDream(randomItem(hearthDreams));
    setAwakeningPhrase(randomItem(awakeningPhrases));
  };

  return (
    <>
      <button ref={triggerRef} type="button" onClick={beginDream}>Close your eyes...</button>
      {isArrivingFromTappery && !handoffComplete ? <div className="hearth-dream-backdrop already-asleep" aria-hidden="true" /> : null}
      {dream ? <HearthDreamOverlay dream={dream} awakeningPhrase={awakeningPhrase} onAwaken={closeDream} alreadyAsleep={isArrivingFromTappery} /> : null}
    </>
  );
}
