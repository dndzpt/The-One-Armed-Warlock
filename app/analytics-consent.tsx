"use client";

import { useEffect, useState } from "react";

const MEASUREMENT_ID = "G-9FQTQKMD71";
const STORAGE_KEY = "oaw-analytics-consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function initialiseAnalytics() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { anonymize_ip: true });

  if (!document.querySelector(`script[data-oaw-analytics="${MEASUREMENT_ID}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.dataset.oawAnalytics = MEASUREMENT_ID;
    document.head.appendChild(script);
  }
}

export default function AnalyticsConsent() {
  const [choice, setChoice] = useState<"accepted" | "declined" | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const savedChoice = window.localStorage.getItem(STORAGE_KEY);
    if (savedChoice === "accepted") {
      setChoice("accepted");
      initialiseAnalytics();
    } else if (savedChoice === "declined") {
      setChoice("declined");
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveChoice = (nextChoice: "accepted" | "declined") => {
    window.localStorage.setItem(STORAGE_KEY, nextChoice);
    setChoice(nextChoice);
    setShowBanner(false);

    if (nextChoice === "accepted") {
      initialiseAnalytics();
    } else if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  };

  return (
    <>
      {showBanner && (
        <section className="analytics-consent" role="dialog" aria-label="Analytics choices" aria-live="polite">
          <div>
            <p className="analytics-consent-label">A note from the ledger</p>
            <h2>May we count your visit?</h2>
            <p>We use Google Analytics to understand which parts of the Guild Hall are useful. Analytics stays off unless you accept, and we do not send account passwords or verification codes.</p>
          </div>
          <div className="analytics-consent-actions">
            <button type="button" className="analytics-accept" onClick={() => saveChoice("accepted")}>Accept analytics</button>
            <button type="button" onClick={() => saveChoice("declined")}>Decline</button>
          </div>
        </section>
      )}
      {!showBanner && choice && (
        <button type="button" className="analytics-settings" onClick={() => setShowBanner(true)}>
          Privacy choices
        </button>
      )}
    </>
  );
}
