import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type FormEvent,
} from "react";
import linkedinIcon from "../images/linkedin.svg";
import mailIcon from "../images/mail.svg";
import phoneIcon from "../images/phone.svg";
import valiantLogo from "../images/Valiant_logo.svg";
import "./contact-form.css";

function preventSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

type ContactFormProps = {
  onCloseComplete: () => void;
  onCloseStart: () => void;
};

export function ContactForm({ onCloseComplete, onCloseStart }: ContactFormProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const beginClose = useCallback(() => {
    if (isClosing) {
      return;
    }

    setIsClosing(true);
    onCloseStart();
  }, [isClosing, onCloseStart]);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        beginClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [beginClose]);

  const finishClose = (event: AnimationEvent<HTMLDivElement>) => {
    if (isClosing && event.target === event.currentTarget) {
      onCloseComplete();
    }
  };

  return (
    <div className={`contact-reveal ${isClosing ? "is-closing" : ""}`}>
      <div
        className="contact-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-heading"
        aria-busy={isClosing}
        onAnimationEnd={finishClose}
      >
        <section className="contact-card">
          <aside className="contact-sidebar">
            <img className="contact-brand" src={valiantLogo} alt="Valiant Media" />

            <div className="contact-sidebar-copy">
              <h2 id="contact-heading">
                Get in touch
                <br />
                with us
              </h2>

              <address className="contact-details">
                <div className="contact-detail">
                  <img className="contact-icon" src={linkedinIcon} alt="" />
                  <span>@valiantmedia</span>
                </div>
                <a className="contact-detail" href="tel:+26774271667">
                  <img className="contact-icon" src={phoneIcon} alt="" />
                  <span>+267 74271667</span>
                </a>
                <a className="contact-detail" href="mailto:info@valiantmedia.co.bw">
                  <img className="contact-icon" src={mailIcon} alt="" />
                  <span>info@valiantmedia.co.bw</span>
                </a>
              </address>
            </div>
          </aside>

          <div className="contact-form-shell">
            <form className="contact-form" onSubmit={preventSubmit}>
              <div className="contact-name-row">
                <label className="contact-field">
                  <span>First Name</span>
                  <input
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="Enter your first name…"
                    required
                  />
                </label>

                <label className="contact-field">
                  <span>Last Name</span>
                  <input
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Enter your last name…"
                    required
                  />
                </label>
              </div>

              <label className="contact-field">
                <span>Email Address</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Enter your email address"
                  required
                />
              </label>

              <label className="contact-field contact-message-field">
                <span>Project Details</span>
                <textarea
                  name="projectDetails"
                  placeholder="Tell us about your project…"
                  required
                />
              </label>

              <button className="contact-submit" type="submit">
                Start a project
              </button>
            </form>
          </div>
        </section>

        <button
          ref={closeButtonRef}
          className="contact-close"
          type="button"
          aria-label="Close contact form and return to the carousel"
          disabled={isClosing}
          onClick={beginClose}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5 19 19M19 5 5 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
