import Link from "next/link";
import ThresholdGallery from "./threshold-gallery";

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
        </nav>
      </header>

      <section className="threshold-welcome" aria-labelledby="threshold-title">
        <div className="threshold-copy">
          <p className="eyebrow">The Threshold</p>
          <h1 id="threshold-title">Welcome, traveler.</h1>
          <div className="threshold-rule" aria-hidden="true"><span /></div>
          <div className="threshold-text">
            <p>
              Legends tell of an impossible doorway that appears where it is
              least expected. Beyond its weathered stone frame lies not another
              road, but a warm hearth, good company, and a place where every
              story is welcome.
            </p>
            <p>
              The One-Armed Warlock was inspired by that simple idea.
            </p>
            <p>
              We are a community of tabletop roleplaying enthusiasts,
              worldbuilders, artists, and storytellers dedicated to creating
              immersive fantasy experiences and sharing them with others. From
              original game systems and digital tools to artwork, lore, music,
              and adventures, everything we build begins with a love of
              imagination and a desire to bring people together.
            </p>
            <p>
              Beyond this threshold you&apos;ll find <strong>Hearthall</strong>, the
              heart of our community, where the latest news, chronicles, and
              creations are shared. Wander over to <strong>the Tappery</strong>, meet
              Hearthmother Yerma, enjoy a drink, and become part of our growing
              fellowship.
            </p>
            <p>
              Those who linger a little longer may discover that The One-Armed
              Warlock holds more than first meets the eye. Hidden doors,
              forgotten halls, and new adventures await those willing to
              explore.
            </p>
            <p>
              Whether you&apos;ve come to explore the world of Occura, discover
              hidden legends, find inspiration for your next adventure, or
              simply relax by the fire for a while, you&apos;re among friends.
            </p>
            <p>
              The fire is lit. The mugs are full. Welcome!
            </p>
          </div>
          <nav className="threshold-paths" aria-label="Continue beyond the Threshold">
            <Link href="/hearthall">Enter Hearthall</Link>
            <Link href="/tappery">Visit the Tappery</Link>
          </nav>
        </div>
        <ThresholdGallery />
      </section>
    </main>
  );
}
