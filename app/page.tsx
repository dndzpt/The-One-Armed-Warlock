const sections = [
  {
    number: "01",
    title: "The Party",
    text: "Meet the adventurers, learn their stories, and follow how the group changes over time.",
  },
  {
    number: "02",
    title: "The World",
    text: "Explore the places, factions, lore, and memorable characters that shape our campaign.",
  },
  {
    number: "03",
    title: "The Chronicle",
    text: "Catch up on past sessions, major discoveries, and the decisions that brought us here.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="The One-Armed Warlock home">
          <img src="/oaw-logo.png" alt="The One-Armed Warlock logo" />
          <span>The One-Armed Warlock</span>
        </a>
        <nav aria-label="Main navigation">
          <a className="mobile-nav-link" href="/tavern">Tavern</a>
          <a className="mobile-nav-link" href="/patrons">Join</a>
          <a href="#about">About</a>
          <a href="#explore">Explore</a>
          <a href="#connect">Connect</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">An ongoing tabletop adventure</p>
          <h1>Every great story starts around a table.</h1>
          <p className="intro">
            Welcome to The One-Armed Warlock — home to our party, our game
            world, and the tales we create together one roll at a time.
          </p>
          <div className="hero-actions">
            <a className="button" href="/tavern">Enter the tavern <span aria-hidden="true">→</span></a>
            <a className="button secondary" href="/patrons">Create an account</a>
          </div>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <img src="/oaw-logo.png" alt="" />
          <span>Est. at the table</span>
        </div>
      </section>

      <section className="about" id="about">
        <p className="section-label">Our campaign</p>
        <div>
          <h2>A shared world, built together.</h2>
          <p>
            This is the future home of everything The One-Armed Warlock:
            character stories, campaign lore, session recaps, artwork, and
            useful links for the group. The archive will grow as the adventure does.
          </p>
        </div>
      </section>

      <section className="explore" id="explore">
        <div className="section-heading">
          <p className="section-label">Explore the archive</p>
          <h2>What you’ll find here</h2>
        </div>
        <div className="cards">
          {sections.map((section) => (
            <article className="card" key={section.number}>
              <span>{section.number}</span>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
              <small>Coming soon</small>
            </article>
          ))}
        </div>
      </section>

      <section className="connect" id="connect">
        <p className="section-label">Stay connected</p>
        <h2>The next chapter is being written.</h2>
        <p>Our social links, community updates, and campaign resources will live here.</p>
        <div className="link-row" aria-label="Future social links">
          <span>Discord</span><span>YouTube</span><span>Instagram</span>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><img src="/oaw-logo.png" alt="" /><span>The One-Armed Warlock</span></div>
        <p>Built for the party. Made for the story.</p>
        <p>© {new Date().getFullYear()} The One-Armed Warlock</p>
      </footer>
    </main>
  );
}
