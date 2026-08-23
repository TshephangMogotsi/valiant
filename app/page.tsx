import { useCallback, useRef, useState } from "react";
import linkedinIcon from "../images/linkedin.svg";
import mailIcon from "../images/mail.svg";
import phoneIcon from "../images/phone.svg";
import { ContactForm } from "./contact-form";
import {
  UnifiedCarousel,
  type UnifiedCarouselAnimationState,
} from "./unified-carousel";

const EMAIL_ADDRESS = "info@valiant.co.bw";
const LINKEDIN_URL = "https://www.linkedin.com/company/valiantmedia/";
const PHONE_NUMBER = "+267 74271667";

type ExpandableContactPillProps = {
  actionHref: string;
  actionLabel: string;
  className?: string;
  copyOnPillClick?: boolean;
  copyValue?: string;
  iconUrl: string;
  label: string;
  openInNewTab?: boolean;
};

function ExpandableContactPill({
  actionHref,
  actionLabel,
  className = "",
  copyOnPillClick = false,
  copyValue,
  iconUrl,
  label,
  openInNewTab = false,
}: ExpandableContactPillProps) {
  const [copied, setCopied] = useState(false);
  const copyContactValue = useCallback(async () => {
    if (!copyValue) {
      return;
    }

    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [copyValue]);

  if (copyOnPillClick && copyValue) {
    return (
      <button
        className={`home-contact-pill home-contact-pill-expandable home-contact-pill-whole-copy ${className}`.trim()}
        type="button"
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
        onClick={copyContactValue}
        onMouseLeave={() => setCopied(false)}
      >
        <span className="home-contact-pill-core">
          <span
            className="home-contact-pill-icon"
            style={{
              WebkitMaskImage: `url("${iconUrl}")`,
              maskImage: `url("${iconUrl}")`,
            }}
            aria-hidden="true"
          />
          <span>{label}</span>
        </span>

        <span className="home-contact-pill-actions" aria-hidden="true">
          <span className="home-contact-pill-action">
            {copied ? (
              <svg viewBox="0 0 16 16">
                <path d="m3.5 8.5 2.7 2.7 6.3-6.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16">
                <rect x="5.25" y="5.25" width="7.25" height="7.25" rx="1.25" />
                <path d="M10.5 5.25V4.5A1.5 1.5 0 0 0 9 3H4.5A1.5 1.5 0 0 0 3 4.5V9a1.5 1.5 0 0 0 1.5 1.5h.75" />
              </svg>
            )}
          </span>
        </span>
      </button>
    );
  }

  if (!copyValue) {
    return (
      <a
        className={`home-contact-pill home-contact-pill-expandable home-contact-pill-whole-link ${className}`.trim()}
        href={actionHref}
        aria-label={actionLabel}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noreferrer" : undefined}
      >
        <span className="home-contact-pill-core">
          <span
            className="home-contact-pill-icon"
            style={{
              WebkitMaskImage: `url("${iconUrl}")`,
              maskImage: `url("${iconUrl}")`,
            }}
            aria-hidden="true"
          />
          <span>{label}</span>
        </span>

        <span className="home-contact-pill-actions" aria-hidden="true">
          <span className="home-contact-pill-action">
            <svg viewBox="0 0 16 16">
              <path d="M5 11 11 5M6 5h5v5" />
            </svg>
          </span>
        </span>
      </a>
    );
  }

  return (
    <div
      className={`home-contact-pill home-contact-pill-expandable ${className}`.trim()}
      onMouseLeave={() => setCopied(false)}
    >
      <a
        className="home-contact-pill-core"
        href={actionHref}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noreferrer" : undefined}
      >
        <span
          className="home-contact-pill-icon"
          style={{
            WebkitMaskImage: `url("${iconUrl}")`,
            maskImage: `url("${iconUrl}")`,
          }}
          aria-hidden="true"
        />
        <span>{label}</span>
      </a>

      <span className="home-contact-pill-actions">
        {copyValue ? (
          <button
            className="home-contact-pill-action"
            type="button"
            aria-label={copied ? `${label} copied` : `Copy ${label}`}
            onClick={copyContactValue}
          >
            {copied ? (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m3.5 8.5 2.7 2.7 6.3-6.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="5.25" y="5.25" width="7.25" height="7.25" rx="1.25" />
                <path d="M10.5 5.25V4.5A1.5 1.5 0 0 0 9 3H4.5A1.5 1.5 0 0 0 3 4.5V9a1.5 1.5 0 0 0 1.5 1.5h.75" />
              </svg>
            )}
          </button>
        ) : null}
        <a
          className="home-contact-pill-action"
          href={actionHref}
          aria-label={actionLabel}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noreferrer" : undefined}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 11 11 5M6 5h5v5" />
          </svg>
        </a>
      </span>
    </div>
  );
}

export default function Home() {
  const [projectStarted, setProjectStarted] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const projectButtonRef = useRef<HTMLButtonElement>(null);
  const handleCarouselStateChange = useCallback(
    (state: UnifiedCarouselAnimationState) => {
      if (state === "complete") {
        setShowContactForm(true);
      }
    },
    [],
  );
  const startClosingProjectForm = useCallback(() => {
    setProjectStarted(false);
  }, []);
  const finishClosingProjectForm = useCallback(() => {
    setShowContactForm(false);
    projectButtonRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main className="page-shell">
      <section
        className={`hero ${projectStarted ? "is-project-started" : ""}`}
        aria-label="Jellyfish gallery"
      >
        <img className="site-logo" src="/valiant_logo.svg" alt="Valiant Media" />
        <div className="hero-copy">
          <p className="intro-copy">
            Bespoke, pixel perfect websites crafted with care,
            <br />
            built for speed and made to last.
          </p>

          <div className="project-cta">
            <button
              ref={projectButtonRef}
              className="project-button"
              type="button"
              onClick={() => setProjectStarted(true)}
            >
              Start a project
            </button>
          </div>

          <p className="outro-copy" id="start-a-project">
            Brands thrive by forging deeper connections with their audience. What we create
            <br />
            matters, but what we make possible matters more.
          </p>

          <div className="home-contact-pills" aria-label="Valiant contact details">
            <ExpandableContactPill
              actionHref={LINKEDIN_URL}
              actionLabel="Open LinkedIn profile"
              className="home-contact-pill-linkedin"
              iconUrl={linkedinIcon}
              label="@valiant"
              openInNewTab
            />
            <ExpandableContactPill
              actionHref={`mailto:${EMAIL_ADDRESS}`}
              actionLabel="Open email client"
              copyOnPillClick
              copyValue={EMAIL_ADDRESS}
              iconUrl={mailIcon}
              label={EMAIL_ADDRESS}
            />
            <ExpandableContactPill
              actionHref="tel:+26774271667"
              actionLabel="Start phone call"
              copyValue={PHONE_NUMBER}
              iconUrl={phoneIcon}
              label={PHONE_NUMBER}
            />
          </div>
        </div>
        <UnifiedCarousel
          started={projectStarted}
          onAnimationStateChange={handleCarouselStateChange}
        />
        {showContactForm ? (
          <ContactForm
            onCloseStart={startClosingProjectForm}
            onCloseComplete={finishClosingProjectForm}
          />
        ) : null}
      </section>
    </main>
  );
}
