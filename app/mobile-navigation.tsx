"use client";

import { useEffect, useRef, useState } from "react";

type NavigationItem = {
  href: string;
  label: string;
};

export default function MobileNavigation({
  items,
  theme = "guild",
}: {
  items: NavigationItem[];
  theme?: "guild" | "tavern";
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  return (
    <div className={`mobile-navigation mobile-navigation-${theme}`} ref={containerRef}>
      <button
        type="button"
        className="mobile-navigation-trigger"
        aria-expanded={open}
        aria-controls={`mobile-${theme}-navigation`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>Navigation</span>
        <span className="mobile-navigation-chevron" aria-hidden="true">⌄</span>
      </button>
      <nav
        id={`mobile-${theme}-navigation`}
        className="mobile-navigation-panel"
        aria-label={`${theme === "tavern" ? "Tavern" : "Main"} mobile navigation`}
        hidden={!open}
      >
        {items.map((item) => (
          <a key={`${item.href}-${item.label}`} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
