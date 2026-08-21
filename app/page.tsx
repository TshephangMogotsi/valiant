import { JellyfishCarousel } from "./jellyfish-carousel";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Pelagia home">
          <span className="brand-mark" aria-hidden="true" />
          PELAGIA
        </a>
        <p className="edition">DEEP SEA ARCHIVE · 01</p>
      </header>

      <section className="hero" id="top" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">A study in motion</p>
          <h1 id="page-title">
            Life beneath
            <span>the surface.</span>
          </h1>
          <p className="intro">
            A revolving collection of the ocean&rsquo;s most otherworldly
            drifters, suspended in a continuous current.
          </p>
        </div>

        <JellyfishCarousel />

        <div className="scroll-note" aria-hidden="true">
          <span />
          DRIFT TO EXPLORE
        </div>
      </section>
    </main>
  );
}
