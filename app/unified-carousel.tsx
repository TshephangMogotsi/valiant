import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { JELLYFISH_IMAGES, jellyfishImageUrl } from "./jellyfish-images";
import { createUnifiedCarouselGeometry } from "./unified-carousel-geometry";
import "./unified-carousel.css";

const ORBIT_DURATION_SECONDS = 32;
const REVERSE_PLAYBACK_RATE = 1;
const TAU = Math.PI * 2;
const DEFAULT_SIZE = { width: 1440, height: 800 };
const STANDARD_TIMELINE = {
  stop: 70,
  blackEnd: 350,
  mergeStart: 280,
  mergeEnd: 800,
  expandStart: 720,
  expandEnd: 1650,
} as const;
const REDUCED_TIMELINE = {
  stop: 0,
  blackEnd: 90,
  mergeStart: 70,
  mergeEnd: 170,
  expandStart: 150,
  expandEnd: 320,
} as const;

type Size = typeof DEFAULT_SIZE;
export type UnifiedCarouselAnimationState =
  | "idle"
  | "blackening"
  | "merging"
  | "expanding"
  | "complete"
  | "contracting"
  | "separating"
  | "restoring";

type CarouselFrame = {
  blackProgress: number;
  expandProgress: number;
  mergeProgress: number;
  orbitPhase: number;
  sequenceProgress: number;
};

type UnifiedCarouselProps = {
  onAnimationStateChange?: (state: UnifiedCarouselAnimationState) => void;
  started?: boolean;
};

type StageStyle = CSSProperties & {
  "--unified-edge-fade-opacity": number;
};

const INITIAL_FRAME: CarouselFrame = {
  blackProgress: 0,
  expandProgress: 0,
  mergeProgress: 0,
  orbitPhase: 0,
  sequenceProgress: 0,
};

function clampProgress(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
}

function timelineProgress(elapsed: number, start: number, end: number) {
  return clampProgress((elapsed - start) / Math.max(end - start, 1));
}

function createFrame(
  sequenceProgress: number,
  orbitPhase: number,
  timeline: typeof STANDARD_TIMELINE | typeof REDUCED_TIMELINE,
): CarouselFrame {
  const elapsed = sequenceProgress * timeline.expandEnd;

  return {
    blackProgress: easeInOutCubic(timelineProgress(elapsed, 0, timeline.blackEnd)),
    mergeProgress: easeInOutCubic(
      timelineProgress(elapsed, timeline.mergeStart, timeline.mergeEnd),
    ),
    expandProgress: easeInOutCubic(
      timelineProgress(elapsed, timeline.expandStart, timeline.expandEnd),
    ),
    orbitPhase,
    sequenceProgress,
  };
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

function useElementSize(elementRef: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState<Size>(DEFAULT_SIZE);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const updateSize = (width: number, height: number) => {
      if (width <= 0 || height <= 0) {
        return;
      }

      setSize((currentSize) => {
        if (
          Math.abs(currentSize.width - width) < 0.5 &&
          Math.abs(currentSize.height - height) < 0.5
        ) {
          return currentSize;
        }

        return { width, height };
      });
    };

    const bounds = element.getBoundingClientRect();
    updateSize(bounds.width, bounds.height);

    const resizeObserver = new ResizeObserver(([entry]) => {
      updateSize(entry.contentRect.width, entry.contentRect.height);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [elementRef]);

  return size;
}

function useCarouselFrame(started: boolean, reducedMotion: boolean) {
  const [frame, setFrame] = useState<CarouselFrame>(INITIAL_FRAME);
  const phaseRef = useRef(0);
  const sequenceProgressRef = useRef(0);

  useEffect(() => {
    let animationFrame = 0;
    let previousTime = performance.now();
    const timeline = reducedMotion ? REDUCED_TIMELINE : STANDARD_TIMELINE;
    const orbitSpeed = TAU / ORBIT_DURATION_SECONDS;
    const sequenceDurationSeconds = timeline.expandEnd / 1000;

    const animate = (currentTime: number) => {
      const elapsedSeconds = Math.min((currentTime - previousTime) / 1000, 0.064);
      previousTime = currentTime;
      const direction = started ? 1 : -1;
      const playbackRate = started ? 1 : REVERSE_PLAYBACK_RATE;
      const nextSequenceProgress = clampProgress(
        sequenceProgressRef.current +
          (direction * elapsedSeconds * playbackRate) / sequenceDurationSeconds,
      );
      sequenceProgressRef.current = nextSequenceProgress;

      if (!reducedMotion) {
        if (!started && nextSequenceProgress === 0) {
          phaseRef.current = (phaseRef.current + elapsedSeconds * orbitSpeed) % TAU;
        } else if (started && timeline.stop > 0) {
          const stopProgress = clampProgress(
            (nextSequenceProgress * timeline.expandEnd) / timeline.stop,
          );
          const velocityScale = (1 - stopProgress) ** 2;
          phaseRef.current =
            (phaseRef.current + elapsedSeconds * orbitSpeed * velocityScale) % TAU;
        }
      }

      setFrame(createFrame(nextSequenceProgress, phaseRef.current, timeline));

      const forwardComplete = started && nextSequenceProgress === 1;
      const reverseComplete =
        !started && nextSequenceProgress === 0 && reducedMotion;

      if (forwardComplete || reverseComplete) {
        return;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [reducedMotion, started]);

  return frame;
}

function getAnimationState(
  started: boolean,
  frame: CarouselFrame,
): UnifiedCarouselAnimationState {
  if (frame.sequenceProgress === 0) {
    return "idle";
  }

  if (started) {
    if (frame.blackProgress < 1) {
      return "blackening";
    }

    if (frame.mergeProgress < 1) {
      return "merging";
    }

    if (frame.expandProgress < 1) {
      return "expanding";
    }

    return "complete";
  }

  if (frame.expandProgress > 0) {
    return "contracting";
  }

  if (frame.mergeProgress > 0) {
    return "separating";
  }

  return "restoring";
}

export function UnifiedCarousel({
  onAnimationStateChange,
  started = false,
}: UnifiedCarouselProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(stageRef);
  const reducedMotion = useReducedMotion();
  const frame = useCarouselFrame(started, reducedMotion);
  const instanceId = useId().replaceAll(":", "");
  const shadowId = `${instanceId}-panel-shadow`;
  const animationState = getAnimationState(started, frame);
  const geometry = useMemo(
    () =>
      createUnifiedCarouselGeometry({
        expandProgress: frame.expandProgress,
        height: size.height,
        mergeProgress: frame.mergeProgress,
        orbitPhase: frame.orbitPhase,
        width: size.width,
      }),
    [frame.expandProgress, frame.mergeProgress, frame.orbitPhase, size.height, size.width],
  );
  const stageStyle = {
    "--unified-edge-fade-opacity": 1 - frame.expandProgress,
  } as StageStyle;

  useEffect(() => {
    onAnimationStateChange?.(animationState);
  }, [animationState, onAnimationStateChange]);

  return (
    <div
      ref={stageRef}
      className="unified-carousel-stage"
      style={stageStyle}
      role="region"
      aria-roledescription="carousel"
      aria-label="Jellyfish photography carousel"
      aria-busy={animationState !== "idle" && animationState !== "complete"}
      data-animation-state={animationState}
      data-sequence-progress={frame.sequenceProgress.toFixed(3)}
    >
      <svg
        className="unified-carousel-surface"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={shadowId} x="-35%" y="-35%" width="170%" height="185%">
            <feDropShadow
              dx="0"
              dy="18"
              stdDeviation="24"
              floodColor="#142d28"
              floodOpacity={0.18 * (1 - frame.mergeProgress)}
            />
          </filter>
          {geometry.panels.map((panel) => {
            const image = JELLYFISH_IMAGES[panel.imageIndex];

            return (
              <clipPath id={`${instanceId}-clip-${image.id}`} key={image.id}>
                <path d={panel.path} />
              </clipPath>
            );
          })}
        </defs>

        <g filter={`url(#${shadowId})`}>
          {geometry.panels.map((panel) => {
            const image = JELLYFISH_IMAGES[panel.imageIndex];
            const clipId = `${instanceId}-clip-${image.id}`;

            return (
              <g className="unified-carousel-panel" key={image.id}>
                <path
                  className="unified-carousel-panel-base"
                  d={panel.path}
                  stroke="#000"
                  strokeWidth={frame.mergeProgress * 1.5}
                  vectorEffect="non-scaling-stroke"
                />
                <image
                  className="unified-carousel-panel-image"
                  href={jellyfishImageUrl(image.id)}
                  x={panel.bounds.x}
                  y={panel.bounds.y}
                  width={panel.bounds.width}
                  height={panel.bounds.height}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${clipId})`}
                  opacity={1 - frame.blackProgress}
                />
                <path
                  className="unified-carousel-panel-edge"
                  d={panel.path}
                  opacity={1 - frame.blackProgress}
                />
              </g>
            );
          })}
        </g>
      </svg>

      <ol className="unified-carousel-descriptions">
        {JELLYFISH_IMAGES.map((image) => (
          <li key={image.id}>{image.alt}</li>
        ))}
      </ol>
    </div>
  );
}
