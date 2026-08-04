"use client";

import { useEffect, useState } from "react";

const thresholdImages = Array.from(
  { length: 13 },
  (_, index) => `/threshold/door-${index + 1}.webp`,
);

function randomImageIndex() {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] % thresholdImages.length;
}

export default function ThresholdGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedImage(thresholdImages[randomImageIndex()]);
  }, []);

  return (
    <figure className="threshold-gallery">
      <div className="threshold-frame">
        <div className="threshold-frame-inner">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="A mysterious doorway opening into the warmly lit One-Armed Warlock"
            />
          ) : (
            <span className="threshold-image-loading" aria-hidden="true" />
          )}
        </div>
      </div>
      <figcaption>The door is never where you left it.</figcaption>
    </figure>
  );
}
