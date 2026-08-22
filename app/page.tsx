import { JellyfishCarousel } from "./jellyfish-carousel";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero" aria-label="Jellyfish gallery">
        <img className="site-logo" src="/valiant_logo.svg" alt="Valiant Media" />
        <div className="hero-copy">
          <p className="intro-copy">
            We develop the approved design into fast, responsive,<br />
            hand-written code, pixel-faithful and built to last
          </p>

          <div className="project-cta">
            <a className="project-button" href="#start-a-project">
              Start a project
            </a>
          </div>

          <p className="outro-copy" id="start-a-project">
            Brands thrive by forging deeper connections with their audience. What we create
            <br />
            matters – but what we make possible matters more.
          </p>
        </div>
        <JellyfishCarousel />
      </section>
    </main>
  );
}
