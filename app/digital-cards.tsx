import { useMemo, useState } from "react";
import brandLogo from "../images/Valiant_logo.svg";

type Profile = {
  slug: string;
  name: string;
  role: string;
  organisation: string;
  phone?: string;
  email?: string;
  address?: string[];
  initials: string;
  accent: string;
  photo?: string;
  portraitScale?: string;
  portraitOffset?: string;
  status?: "ready" | "pending";
};

const morwadiPhoto = "/morwadi-mosenki-portrait-extended.png";

const profiles: Profile[] = [
  {
    slug: "morwadi-mosenki",
    name: "Morwadi Mosenki",
    role: "Head - Events and Protocol",
    organisation: "Emma Boko Trust",
    phone: "+267 74 190 234",
    email: "morwadi1969@gmail.com",
    address: ["P.O. Box 445, Gaborone", "Plot 53689, Golf Estate", "Phakalane"],
    initials: "MM",
    accent: "#d4962f",
    photo: morwadiPhoto,
    portraitScale: "1.6",
    portraitOffset: "7%",
  },
  {
    slug: "gomotsang-yvonne-dennison",
    name: "Gomotsang Yvonne Dennison",
    role: "Head - Finance and Resource mobilisation",
    organisation: "Emma Boko Trust",
    phone: "+267 72 77 0670",
    email: "vonkiecoach@gmail.com",
    address: ["P.O. Box 445, Gaborone", "Plot 53689, Golf Estate", "Phakalane"],
    initials: "GYD",
    accent: "#df674c",
    photo: "/gomotsang-dennison-portrait.png",
    portraitScale: "1.4",
    portraitOffset: "14%",
  },
];

function Icon({ name }: { name: "phone" | "mail" | "box" | "pin" | "copy" | "share" }) {
  const common = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8 };
  if (name === "phone") return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M6.6 3.8 9 3.2l1.8 4.7-2 1.6a15.6 15.6 0 0 0 5.7 5.7l1.6-2 4.7 1.8-.6 2.4c-.3 1.3-1.6 2.2-3 2A16.8 16.8 0 0 1 4.6 6.8c-.2-1.4.7-2.7 2-3Z" /></svg>;
  if (name === "mail") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="3.2" y="5.2" width="17.6" height="13.6" rx="2" /><path {...common} d="m4.4 7 7.6 5.8L19.6 7" /></svg>;
  if (name === "box") return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M3 9a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9H3zM8 18v-5h8v5M10 6V3h4" /></svg>;
  if (name === "pin") return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M19.1 10.1c0 5-7.1 10.1-7.1 10.1s-7.1-5.1-7.1-10.1a7.1 7.1 0 1 1 14.2 0Z" /><circle {...common} cx="12" cy="10.1" r="2.25" /></svg>;
  if (name === "copy") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="8" y="8" width="11" height="11" rx="1.5" /><path {...common} d="M16 8V5.8A1.8 1.8 0 0 0 14.2 4H5.8A1.8 1.8 0 0 0 4 5.8v8.4A1.8 1.8 0 0 0 5.8 16H8" /></svg>;
  if (name === "share") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle {...common} cx="18" cy="5" r="2.5" /><circle {...common} cx="6" cy="12" r="2.5" /><circle {...common} cx="18" cy="19" r="2.5" /><path {...common} d="m8.2 10.8 7.6-4.3M8.2 13.2l7.6 4.3" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="8" y="8" width="11" height="11" rx="1.5" /><path {...common} d="M16 8V5.8A1.8 1.8 0 0 0 14.2 4H5.8A1.8 1.8 0 0 0 4 5.8v8.4A1.8 1.8 0 0 0 5.8 16H8" /></svg>;
}

function ProfileCard({ profile }: { profile: Profile }) {
  const [copied, setCopied] = useState(false);
  const [copiedDetail, setCopiedDetail] = useState<"phone" | "email" | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const allDetails = [profile.phone, profile.email, ...(profile.address ?? [])].filter(Boolean).join("\n");

  const showCopyNotice = (message: string) => {
    setCopyNotice(message);
    window.setTimeout(() => setCopyNotice(null), 2200);
  };

  const copyDetails = async () => {
    if (!allDetails) return;
    await navigator.clipboard?.writeText(allDetails);
    setCopied(true);
    showCopyNotice("Contact details copied");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const copyDetail = async (value: string | undefined, detail: "phone" | "email") => {
    if (!value) return;
    await navigator.clipboard?.writeText(value);
    setCopiedDetail(detail);
    showCopyNotice(detail === "phone" ? "Phone number copied" : "Email address copied");
    window.setTimeout(() => setCopiedDetail(null), 1800);
  };

  const shareContact = async () => {
    const text = `${profile.name}\n${profile.role}, ${profile.organisation}\n${allDetails}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `${profile.name} – ${profile.organisation}`, text, url: window.location.href });
        return;
      }

      await navigator.clipboard?.writeText(window.location.href);
      setShared(true);
      showCopyNotice("Card link copied");
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // Closing a share sheet should leave the card unchanged.
    }
  };

  return <article className="digital-profile" aria-label={`${profile.name} business card`}>
    <div className="digital-identity" style={{ "--profile-accent": profile.accent, "--portrait-scale": profile.portraitScale ?? "1.6", "--portrait-offset": profile.portraitOffset ?? "7%" } as React.CSSProperties}>
      <div className="digital-portrait" aria-label={profile.status === "pending" ? "Profile awaiting details" : `${profile.name} initials`}>
        {profile.photo ? <span className="digital-photo-frame"><img src={profile.photo} alt={`Portrait of ${profile.name}`} /></span> : <>
          <span>{profile.initials}</span>
          <span className="digital-portrait-note">{profile.status === "pending" ? "PROFILE" : "VALIANT"}</span>
        </>}
      </div>
      <div className="digital-nameplate">
        <p className="digital-role">{profile.role}</p>
        <h1>{profile.name}</h1>
        <p className="digital-organisation">{profile.organisation}</p>
      </div>
    </div>
    <section className="digital-details">
      {profile.status === "pending" ? <p className="digital-pending">This card is ready for the second person’s name, contact details, and approved photo.</p> : <>
        <div className="digital-actions">
          <button className="digital-copy" type="button" onClick={copyDetails}>
            {copied ? "Copied!" : "Copy"} <Icon name="copy" />
          </button>
          <button className="digital-share" type="button" onClick={shareContact}>
            {shared ? "Link copied!" : "Share"} <Icon name="share" />
          </button>
        </div>
        <div className="digital-contact-list">
          {profile.phone ? <button className="digital-copyable-detail" type="button" aria-label={copiedDetail === "phone" ? "Phone number copied" : "Copy phone number"} onClick={() => copyDetail(profile.phone, "phone")}><span className="digital-contact-icon"><span className="digital-detail-icon"><Icon name="phone" /></span><span className="digital-detail-copy"><Icon name="copy" /></span></span><span>{profile.phone}</span><span className="digital-mobile-copy-hint">Copy</span></button> : null}
          {profile.email ? <button className="digital-copyable-detail" type="button" aria-label={copiedDetail === "email" ? "Email address copied" : "Copy email address"} onClick={() => copyDetail(profile.email, "email")}><span className="digital-contact-icon"><span className="digital-detail-icon"><Icon name="mail" /></span><span className="digital-detail-copy"><Icon name="copy" /></span></span><span>{profile.email}</span><span className="digital-mobile-copy-hint">Copy</span></button> : null}
          {profile.address?.[0] ? <div><span className="digital-contact-icon"><Icon name="box" /></span><span>{profile.address[0]}</span></div> : null}
          {profile.address?.slice(1).length ? <div><span className="digital-contact-icon"><Icon name="pin" /></span><span>{profile.address.slice(1).map((line) => <span key={line}>{line}</span>)}</span></div> : null}
        </div>
      </>}
    </section>
    {copyNotice ? <div className="digital-snackbar" role="status">{copyNotice}</div> : null}
  </article>;
}

export function DigitalCards() {
  const selectedProfile = useMemo(() => {
    const slug = window.location.pathname.split("/").filter(Boolean).at(-1);
    return profiles.find((profile) => profile.slug === slug);
  }, []);
  const profilesToShow = selectedProfile ? [selectedProfile] : profiles;

  return <main className="digital-cards-page">
    <header className="digital-header"><img src={brandLogo} alt="Valiant" /></header>
    <div className={`digital-cards-grid ${profilesToShow.length === 1 ? "digital-cards-grid-single" : ""}`}>
      {profilesToShow.map((profile) => <ProfileCard key={profile.slug} profile={profile} />)}
    </div>
  </main>;
}
