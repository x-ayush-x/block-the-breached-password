import PageHeading from "../components/PageHeading.jsx";
import SecurityFlow from "../components/SecurityFlow.jsx";
import Icon from "../components/Icon.jsx";
const steps = [
  [
    "Enter a password",
    "Input exists temporarily in the browser. NFC normalization makes equivalent Unicode representations consistent.",
  ],
  [
    "Hash locally",
    "Web Crypto produces a 40-character SHA-1 lookup hash. No hashing server is involved.",
  ],
  [
    "Split the hash",
    "The first five hexadecimal characters form a prefix. The other 35 characters stay local.",
  ],
  [
    "Request a candidate set",
    "Only that prefix is sent to HIBP over HTTPS, with response padding requested.",
  ],
  [
    "Match locally",
    "The browser searches the returned suffixes for an exact match. Zero-count padding is ignored.",
  ],
  [
    "Apply the policy gate",
    "A positive match is rejected. A valid no-match result can proceed only if the remaining rules pass.",
  ],
];
export default function HowItWorks() {
  return (
    <>
      <PageHeading
        eyebrow="SECURITY ARCHITECTURE"
        title="A small prefix. A clear boundary."
        description="Follow a password through the system, without revealing the password itself."
      />
      <div className="architecture-grid">
        <SecurityFlow />
        <section className="steps">
          {steps.map(([title, body], index) => (
            <div className="step" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">SEPARATE SIGNALS</p>
            <h2>Strength is not breach status.</h2>
          </div>
        </div>
        <div className="decision-diagram">
          <div className="decision-source">
            <Icon name="lock" />
            Password
            <br />
            <small>Stays in the browser</small>
          </div>
          <div className="decision-branches">
            <div>
              <Icon name="bolt" />
              <span>
                <strong>Strength engine</strong>
                <small>Advisory guessability estimate</small>
              </span>
            </div>
            <div>
              <Icon name="shield" />
              <span>
                <strong>Breach + policy engines</strong>
                <small>Known exposure and eligibility</small>
              </span>
            </div>
          </div>
          <div className="decision-outcome">
            <Icon name="check" />
            <strong>Combined decision</strong>
            <small>Accept or reject the simulation</small>
          </div>
        </div>
      </section>
      <div className="two-grid">
        <article className="panel prose">
          <h2>What does k-anonymity mean here?</h2>
          <p>
            A prefix describes a group of possible hashes. HIBP returns
            candidates from that group; our browser privately identifies whether
            there is a match.
          </p>
          <p>
            The number of candidates varies. This is not a fixed-k guarantee or
            a zero-knowledge protocol. A prefix still leaks some information,
            and HIBP sees connection metadata.
          </p>
        </article>
        <article className="panel prose">
          <h2>Why use SHA-1?</h2>
          <p>
            It is the lookup format supported by this HIBP range endpoint. It is
            not used to encrypt or store a password, and hashing is not
            reversible encryption.
          </p>
          <p>
            Production password storage would need a separate, salted,
            deliberately expensive password-hashing design, such as Argon2id.
            This prototype stores no credentials.
          </p>
        </article>
      </div>
      <p className="source-note">
        Technical reference:{" "}
        <a
          href="https://haveibeenpwned.com/API/v3#PwnedPasswords"
          target="_blank"
          rel="noreferrer"
        >
          Official HIBP API documentation <Icon name="arrow" size={13} />
        </a>
      </p>
    </>
  );
}
