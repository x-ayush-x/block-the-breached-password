import PageHeading from "../components/PageHeading.jsx";
import Icon from "../components/Icon.jsx";
const rules = [
  [
    "Length first",
    "15–128 Unicode code points after NFC normalization. Spaces are accepted. Oversized input is rejected, never silently truncated.",
  ],
  [
    "Reject known exposure",
    "Positive HIBP matches and a small whole-value common/context blocklist prevent acceptance.",
  ],
  [
    "Support password managers",
    "Paste, autofill and show/hide controls are available.",
  ],
  [
    "No composition checklist",
    "No mandatory uppercase, digit or symbol mix. Strength is advisory, not an acceptance threshold.",
  ],
  [
    "No scheduled expiry",
    "No routine forced password changes are modelled. In a real system, evidence of compromise should trigger a change.",
  ],
  [
    "Check before acceptance",
    "Unavailable or stale checks block the demo. This is our operational choice, not a separate NIST mandate.",
  ],
];
export default function Policy() {
  return (
    <>
      <PageHeading
        eyebrow="NIST-ALIGNED PASSWORD POLICY"
        title="Better rules. Less friction."
        description="Designed to align with relevant NIST SP 800-63B-4 recommendations. This is not certification or full compliance."
      />
      <div className="policy-intro">
        <Icon name="file" size={26} />
        <div>
          <strong>Based on the final SP 800-63B-4 guidance</strong>
          <p>Reference checked September 24, 2026 · Passwords, §3.1.1</p>
        </div>
        <a
          className="button secondary"
          href="https://pages.nist.gov/800-63-4/sp800-63b/authenticators/#passwords"
          target="_blank"
          rel="noreferrer"
        >
          Read official guidance <Icon name="arrow" size={16} />
        </a>
      </div>
      <div className="policy-grid">
        {rules.map(([title, body], index) => (
          <article className="panel policy-card" key={title}>
            <span className="number-dot">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <div className="notice">
        <Icon name="info" />
        <p>
          <strong>Scope matters.</strong> This prototype models the 15-character
          single-factor minimum. NIST allows an 8-character minimum when a
          password is used only as part of MFA, and recommends allowing at least
          64 characters. Our maximum is 128.
        </p>
      </div>
      <div className="two-grid section-block">
        <section className="panel prose">
          <h2>Unicode and long input</h2>
          <p>
            The same NFC-normalized value is used for policy, strength,
            confirmation and HIBP lookup. Character counts use Unicode code
            points, not JavaScript string length.
          </p>
          <p>
            Different Unicode representations may behave differently in other
            systems. This app also uses a 4,096-code-unit precheck to avoid
            expensive processing of extreme input.
          </p>
        </section>
        <section className="panel prose">
          <h2>Beyond this prototype</h2>
          <p>
            A production identity platform needs server-side enforcement, secure
            credential storage, authenticated recovery, session security and
            login rate limiting. These are not implemented here.
          </p>
          <p>
            The small local context blocklist illustrates a mechanism; it is not
            a comprehensive production dictionary. HIBP supplies the breach
            corpus.
          </p>
        </section>
      </div>
    </>
  );
}
