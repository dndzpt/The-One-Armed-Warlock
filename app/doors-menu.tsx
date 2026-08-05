"use client";

import { useEffect, useId, useRef, useState } from "react";

const lockedDoors = ["Guildhall", "Library", "Music Chamber", "Gallery"];

export default function DoorsMenu() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const menuId = useId();
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
    <div className="doors-menu" ref={containerRef}>
      <button
        type="button"
        className="doors-trigger"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((current) => !current);
          setMessage("");
        }}
      >
        <span>Doors</span>
        <span className="doors-chevron" aria-hidden="true" />
      </button>
      <div className="doors-dropdown" id={menuId} hidden={!open}>
        {lockedDoors.map((door) => (
          <button
            type="button"
            className="doors-destination"
            key={door}
            onClick={() => setMessage("Guild Key not yet acquired.")}
          >
            {door}
          </button>
        ))}
        {message && <p className="doors-message" role="status">{message}</p>}
      </div>
    </div>
  );
}
