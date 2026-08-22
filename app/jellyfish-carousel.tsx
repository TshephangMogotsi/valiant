"use client";

import { useEffect, useState, type CSSProperties } from "react";

const IMAGES = [
  { id: "1540968221243-29f5d70540bf", alt: "Translucent jellyfish drifting in dark water" },
  { id: "1596135187959-562c650d98bc", alt: "Jellyfish illuminated beneath the ocean surface" },
  { id: "1628944682084-831f35256163", alt: "Delicate jellyfish tentacles in blue water" },
  { id: "1590013330451-3946e83e0392", alt: "Jellyfish floating through a deep blue current" },
  { id: "1590421959604-741d0eec0a2e", alt: "A luminous jellyfish against the sea" },
  { id: "1572613000712-eadc57acbecd", alt: "Jellyfish moving through clear ocean water" },
  { id: "1570097192570-4b49a6736f9f", alt: "Close view of a jellyfish underwater" },
  { id: "1620789550663-2b10e0080354", alt: "Jellyfish glowing in a dark aquarium" },
  { id: "1617775623669-20bff4ffaa5c", alt: "Soft jellyfish form suspended in water" },
  { id: "1548600916-dc8492f8e845", alt: "Jellyfish with long trailing tentacles" },
  { id: "1573824969595-a76d4365a2e6", alt: "Small jellyfish in midnight blue water" },
  { id: "1633936929709-59991b5fdd72", alt: "Jellyfish drifting through a blue seascape" },
] as const;

type CarouselStyle = CSSProperties & { "--count": number };
type CardStyle = CSSProperties & { "--index": number };

export function JellyfishCarousel() {
  const [resizing, setResizing] = useState(false);
  const [geometryVersion, setGeometryVersion] = useState(0);

  useEffect(() => {
    let settleTimer: number | undefined;
    let settleFrame: number | undefined;

    const handleResize = () => {
      setResizing(true);
      window.clearTimeout(settleTimer);

      settleTimer = window.setTimeout(() => {
        setGeometryVersion((version) => version + 1);
        settleFrame = window.requestAnimationFrame(() => {
          setResizing(false);
        });
      }, 250);
    };

    const resizeObserver = new ResizeObserver(handleResize);

    window.addEventListener("resize", handleResize, { passive: true });
    window.visualViewport?.addEventListener("resize", handleResize, {
      passive: true,
    });
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      window.clearTimeout(settleTimer);

      if (settleFrame !== undefined) {
        window.cancelAnimationFrame(settleFrame);
      }
    };
  }, []);

  return (
    <div className="carousel-wrap">
      <div
        className="scene"
        role="region"
        aria-roledescription="carousel"
        aria-label="Jellyfish photography carousel"
      >
        <div
          key={geometryVersion}
          className={`carousel ${resizing ? "is-resizing" : ""}`}
          style={{ "--count": IMAGES.length } as CarouselStyle}
        >
          {IMAGES.map((image, index) => (
            <img
              className="card"
              key={image.id}
              src={`/jellyfish/${image.id}.jpg`}
              style={{ "--index": index } as CardStyle}
              alt={image.alt}
              width="700"
              height="1000"
              loading={index < 3 ? "eager" : "lazy"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
