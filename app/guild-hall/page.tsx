import type { Metadata } from "next";
import DoorsMenu from "../doors-menu";
import HearthDream from "../hearth-dream";
import MobileNavigation from "../mobile-navigation";
import PatronNavigationLink from "../patron-navigation-link";

export const metadata: Metadata = {
  title: "Hearthall | The One-Armed Warlock",
  description: "Gather around the Hearthall for news, creations, fellowship, and stories from The One-Armed Warlock.",
};

export default function Hearthall() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Hearthall home">
          <img src="/oaw-logo.png" alt="The One-Armed Warlock logo" />
          <span>The One-Armed Warlock</span>
        </a>
        <nav aria-label="Hearthall navigation">
          <a href="/">The Threshold</a>
          <a href="/tappery">The Tappery</a>
          <DoorsMenu />
          <PatronNavigationLink />
          <a href="#connect">Connect</a>
        </nav>
        <MobileNavigation items={[
          { href: "/", label: "The Threshold" },
          { href: "/tappery", label: "The Tappery" },
          { label: "Doors", doors: true },
          { href: "/patrons", label: "Join" },
          { href: "#connect", label: "Connect" },
        ]} />
      </header>

      <section className="hearthall-welcome" id="top">
        <div className="hearthall-welcome-copy">
          <p className="eyebrow">The Hearthall</p>
          <h1>Welcome to the Hearthall</h1>
          <p className="hearthall-lede">Every great inn is remembered not for its walls, but for its hearth.</p>
          <div className="hearthall-welcome-text">
            <p>It is where travelers gather after long journeys, where old friends reunite, where new stories are first imagined, and where tomorrow&apos;s adventures quietly begin.</p>
            <p>Here in the Hearthall you&apos;ll find the latest news from around <strong>The One-Armed Warlock</strong>, discover our newest creations, and catch up on all that&apos;s happening throughout the inn. Pull up a chair, take in the warmth, and stay as long as you like.</p>
            <p>There&apos;s always room for one more around the fire.</p>
          </div>
          <div className="hero-actions">
            <a className="button" href="/tappery">Visit the Tappery <span aria-hidden="true">→</span></a>
            <PatronNavigationLink className="button secondary" />
          </div>
        </div>
        <div className="hearthall-mark" aria-hidden="true"><img src="/oaw-logo.png" alt="" /><span>There is room by the fire</span></div>
      </section>

      <section className="hearthall-noticeboard" id="noticeboard">
        <div className="hearthall-section-copy">
          <p className="section-label">News from around the inn</p>
          <h2>The Noticeboard</h2>
          <p>Announcements, new creations, and the latest word from The One-Armed Warlock will be pinned here.</p>
        </div>
        <article className="hearthall-placeholder-card">
          <span>Noticeboard preparations</span>
          <h3>The first notice is being written.</h3>
          <p>Publishing tools for the master OAW account are coming soon.</p>
        </article>
      </section>

      <section className="hearthall-dream" id="hearth">
        <div className="hearthall-dream-glow" aria-hidden="true" />
        <div className="hearthall-dream-copy">
          <p className="section-label">A quiet place beside the fire</p>
          <h2>Rest by the Hearth</h2>
          <p>Settle into the warmth, close your eyes, and drift into a dream chosen by the Hearthall.</p>
          <HearthDream />
        </div>
      </section>

      <section className="connect" id="connect">
        <p className="section-label">Stay connected</p><h2>The next chapter is being written.</h2><p>Our social links, community updates, and campaign resources will live here.</p>
        <div className="link-row" aria-label="Future social links"><span>Discord</span><span>YouTube</span><span>Instagram</span></div>
      </section>

      <footer><div className="footer-brand"><img src="/oaw-logo.png" alt="" /><span>The One-Armed Warlock</span></div><p>Built for the party. Made for the story.</p><p>© {new Date().getFullYear()} The One-Armed Warlock</p></footer>
    </main>
  );
}
