"use client";

import { useEffect, useRef, useState } from "react";
import { hearthDreams } from "./hearth-dreams";

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

function randomItem<T>(items: readonly T[]) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return items[values[0] % items.length];
}

export function HearthDreamOverlay({
  dream,
  awakeningPhrase,
  onAwaken,
}: {
  dream: (typeof hearthDreams)[number];
  awakeningPhrase: string;
  onAwaken: () => void;
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
    <div className="hearth-dream-backdrop" role="presentation">
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
  const [dream, setDream] = useState<(typeof hearthDreams)[number] | null>(null);
  const [awakeningPhrase, setAwakeningPhrase] = useState("Awaken");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeDream = () => {
    setDream(null);
    window.setTimeout(() => triggerRef.current?.focus(), 50);
  };

  const beginDream = () => {
    setDream(randomItem(hearthDreams));
    setAwakeningPhrase(randomItem(awakeningPhrases));
  };

  return (
    <>
      <button ref={triggerRef} type="button" onClick={beginDream}>Close your eyes...</button>
      {dream ? <HearthDreamOverlay dream={dream} awakeningPhrase={awakeningPhrase} onAwaken={closeDream} /> : null}
    </>
  );
}
