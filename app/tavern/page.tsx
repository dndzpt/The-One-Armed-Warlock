import type { Metadata } from "next";
import Link from "next/link";
import MobileNavigation from "../mobile-navigation";
import PatronNavigationLink from "../patron-navigation-link";
import DrinkPurchaseButton from "./drink-purchase-button";
import "./tavern.css";

export const metadata: Metadata = {
  title: "The Tavern | The One-Armed Warlock",
  description: "Step inside The One-Armed Warlock, meet Hearthmother Yerma, and browse the first pours on the tavern menu.",
};

const drinks = [
  { mark: "IA", name: "Ironroot Ale", kind: "Dark ale", price: 3, description: "A deep, malty pour with toasted grain, black treacle, and a smoky finish." },
  { mark: "MH", name: "Maha’s Honey Mead", kind: "Spiced mead", price: 5, description: "Golden honey warmed with cinnamon, orange peel, and a closely guarded secret.", featured: true },
  { mark: "MC", name: "Moondrop Cider", kind: "Orchard cider", price: 4, description: "Crisp silver apples, elderflower, and just enough sparkle to invite another cup." },
  { mark: "YR", name: "Yerma’s Reserve", kind: "House spirit", price: 8, description: "A smooth amber spirit from the locked shelf. Yerma decides when it is served." },
];

const drinkIds = { IA: 1, MH: 2, MC: 3, YR: 4 } as const;

export default function TavernPage() {
  return (
    <main className="tavern-page">
      <header className="tavern-header">
        <Link className="tavern-brand" href="/" aria-label="The One-Armed Warlock home">
          <img src="/oaw-logo.png" alt="The One-Armed Warlock logo" />
          <span>The One-Armed Warlock</span>
        </Link>
        <nav aria-label="Tavern navigation">
          <Link href="/">Guild Hall</Link><a href="#menu">The Bar</a><a href="#noticeboard">Noticeboard</a><PatronNavigationLink /><a href="#connect">Connect</a>
        </nav>
        <MobileNavigation theme="tavern" items={[
          { href: "/", label: "Guild Hall" },
          { href: "#menu", label: "The Bar" },
          { href: "#noticeboard", label: "Noticeboard" },
          { href: "/patrons", label: "Join" },
          { href: "#connect", label: "Connect" },
        ]} />
      </header>

      <section className="tavern-hero" id="welcome">
        <img className="yerma-image" src="/yerma-tavern.webp" alt="Yerma, Hearthmother of The One-Armed Warlock, standing behind the candlelit bar" />
        <div className="tavern-shade" />
        <div className="tavern-hero-copy">
          <p className="tavern-kicker">Ale • Stories • Shelter</p>
          <h1>Pull up a chair.<br />Yerma kept the fire lit.</h1>
          <p>Beyond the oak door waits a warm hearth, a full bar, and a room where every traveller’s tale is worth the telling.</p>
          <div className="tavern-actions"><a className="tavern-button" href="#menu">See what’s pouring <span aria-hidden="true">↓</span></a><PatronNavigationLink className="tavern-button patron-button" signedOutLabel="Join the Patron Ledger" /></div>
        </div>
        <div className="yerma-card"><span>Hearthmother</span><strong>Yerma</strong><p>“Coin on the bar, trouble at the door, and we’ll get along famously.”</p></div>
      </section>

      <section className="tavern-welcome">
        <p className="tavern-label">The house rules</p>
        <div><h2>All roads are welcome here.</h2><p>The One-Armed Warlock is a meeting place for adventurers, wanderers, chroniclers, and the merely thirsty. The menu is open to every visitor. Those ready to stay awhile may now add their name to the <Link href="/patrons">Patron Ledger</Link>.</p></div>
        <ul aria-label="Tavern house rules"><li><span>01</span> Respect the house</li><li><span>02</span> Share the table</li><li><span>03</span> Leave a better tale</li></ul>
      </section>

      <section className="tavern-menu" id="menu">
        <div className="tavern-section-heading"><div><p className="tavern-label">From behind the bar</p><h2>Tonight’s pours</h2></div><p>Our opening menu — names, stories, and prices may deepen as the cellar grows.</p></div>
        <div className="drink-grid">
          {drinks.map((drink) => (
            <article className={`drink-card${drink.featured ? " featured" : ""}`} key={drink.name}>
              {drink.featured && <span className="featured-ribbon">Yerma recommends</span>}
              <div className="drink-mark" aria-hidden="true">{drink.mark}</div><p className="drink-kind">{drink.kind}</p><h3>{drink.name}</h3><p className="drink-description">{drink.description}</p>
              <div className="drink-footer"><span><strong>{drink.price}</strong> Copper Coins</span></div>
              <DrinkPurchaseButton drinkId={drinkIds[drink.mark as keyof typeof drinkIds]} drinkName={drink.name} />
            </article>
          ))}
        </div>
      </section>

      <section className="tavern-noticeboard" id="noticeboard">
        <div className="notice-copy"><p className="tavern-label">Pinned by the hearth</p><h2>The Tavern Noticeboard</h2><p>Jobs, rumours, community gatherings, and rewards will soon find their way here. For now, consider this an empty hook waiting for its first notice.</p></div>
        <div className="notice-paper" aria-label="Noticeboard preview"><span>Notice No. 001</span><strong>Patrons wanted</strong><p>The ledger opens soon. First round stories are already being gathered.</p><small>— YERMA</small></div>
      </section>

      <section className="tavern-connect" id="connect">
        <p className="tavern-label">Beyond the tavern door</p>
        <h2>Follow the next tale.</h2>
        <p>Community updates, new stories, and adventures from The One-Armed Warlock will gather here.</p>
        <div className="tavern-socials" aria-label="Future social links"><span>Discord</span><span>YouTube</span><span>Instagram</span></div>
      </section>

      <footer className="tavern-footer"><div className="tavern-footer-brand"><img src="/oaw-logo.png" alt="" /><span>The One-Armed Warlock</span></div><p>The hearth is warm. The door is open.</p><Link href="/">Return to the Guild Hall ↑</Link></footer>
    </main>
  );
}
