import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { UnifiedCarousel } from "./unified-carousel";
import "./unified-carousel-preview.css";

function UnifiedCarouselPreview() {
  const compactFrame = new URLSearchParams(window.location.search).get("frame") === "compact";
  const [started, setStarted] = useState(false);

  return (
    <main className={`unified-preview-shell ${compactFrame ? "is-compact" : ""}`}>
      <section className="unified-preview-frame">
        <header className="unified-preview-label">
          <span>Unified carousel</span>
          <strong>{compactFrame ? "Compact viewport" : "Isolated geometry preview"}</strong>
        </header>
        <button
          className="unified-preview-trigger"
          type="button"
          onClick={() => setStarted((current) => !current)}
        >
          {started ? "Reverse sequence" : "Run sequence"}
        </button>
        <UnifiedCarousel started={started} />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UnifiedCarouselPreview />
  </StrictMode>,
);
