import Link from "next/link";

export default function Threshold() {
  return (
    <main className="threshold-page">
      <header className="threshold-header">
        <Link className="brand" href="/" aria-label="The One-Armed Warlock threshold">
          <img src="/oaw-logo.png" alt="The One-Armed Warlock logo" />
          <span>The One-Armed Warlock</span>
        </Link>
        <nav className="threshold-navigation" aria-label="Choose your destination">
          <Link href="/" aria-current="page">The Threshold</Link>
          <Link href="/guild-hall">Guild Hall</Link>
          <Link href="/tavern">Tavern</Link>
        </nav>
      </header>

      <section className="threshold-welcome" aria-labelledby="threshold-title">
        <div className="threshold-copy">
          <p className="eyebrow">The Threshold</p>
          <h1 id="threshold-title">Welcome, traveler.</h1>
          <div className="threshold-rule" aria-hidden="true"><span /></div>
          <div className="threshold-text">
            <p>
              The One-Armed Warlock is a gathering place for creators,
              storytellers, artists, and adventurers united by a shared passion
              for building worlds, crafting unforgettable experiences, and
              celebrating the spirit of imagination.
            </p>
            <p>
              Beyond this threshold lie two paths. The <strong>Guild Hall</strong> is
              home to our projects, chronicles, and creations, where new ideas are
              forged and shared. The <strong>Tavern</strong> offers a place to rest by
              the hearth, enjoy a drink with fellow Patrons, and become part of our
              growing community.
            </p>
            <p>
              Whether you have come seeking inspiration, fellowship, or simply a
              quiet place to linger for a while, you are warmly welcomed. Pull up a
              chair—the fire is lit, the mugs are full, and your place has been
              waiting for you.
            </p>
          </div>
        </div>
        <div className="threshold-mark" aria-hidden="true">
          <img src="/oaw-logo.png" alt="" />
          <p>Two paths await</p>
        </div>
      </section>
    </main>
  );
}
