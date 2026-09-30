import { useState } from "react";
import PageHeading from "../components/PageHeading.jsx";
import PasswordSecurityChecker from "../components/PasswordSecurityChecker.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import Icon from "../components/Icon.jsx";
import usePasswordSecurity from "../hooks/usePasswordSecurity.js";
import {
  normalizePassword,
  securityDecision,
  validatePassword,
  POLICY,
} from "../utils/passwordPolicy.js";
import { BREACHED_DEMO, generateDemoPassword } from "../data/demoAccounts.js";

export default function AccountPage({ reset = false, onAudit }) {
  const security = usePasswordSecurity(onAudit);
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [notice, setNotice] = useState("");
  const policy = validatePassword(security.password, email);
  const decision = securityDecision(policy, security.breach);
  const matches =
    security.password.length <= POLICY.rawInputLimit &&
    confirm.length <= POLICY.rawInputLimit &&
    normalizePassword(confirm) === normalizePassword(security.password);
  const emailOK =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  const ready = decision.allowed && (reset ? matches : emailOK);
  function loadDemo(kind) {
    try {
      security.changePassword(
        kind === "breached" ? BREACHED_DEMO : generateDemoPassword(),
      );
      setConfirm("");
      if (!reset && !email) setEmail("judge@example.test");
      setNotice(
        kind === "breached"
          ? "Public test fixture loaded. Run the breach check to see its result."
          : "Fresh random demonstration password loaded. Check it before continuing.",
      );
    } catch {
      setNotice(
        "Random generation is unavailable in this browser. Use Chrome on localhost or HTTPS.",
      );
    }
  }
  function submit(event) {
    event.preventDefault();
    const currentDecision = security.decisionNow(email);
    if (!currentDecision.allowed || (reset ? !matches : !emailOK)) {
      onAudit(reset ? "Reset blocked" : "Signup blocked", "Rejected");
      setNotice(
        "Submission blocked. Complete all checks for the current password.",
      );
      return;
    }
    onAudit(reset ? "Reset simulation" : "Signup simulation", "Accepted");
    security.changePassword("");
    setConfirm("");
    setEmail("");
    setNotice("");
    setSuccess(true);
  }
  return (
    <>
      <PageHeading
        eyebrow="PASSWORD POLICY GATE"
        title={
          reset ? "Reset with confidence." : "Start with a better password."
        }
        description={
          reset
            ? "The same security checks, every time a password changes."
            : "Check strength and breach exposure before a password is accepted."
        }
      >
        <span className="pill">
          <span className="dot" /> Live HIBP lookup
        </span>
      </PageHeading>
      <div className="account-grid">
        <section className="panel account-panel">
          <div className="panel-heading">
            <span className="feature-icon">
              <Icon name={reset ? "reset" : "user"} />
            </span>
            <div>
              <h2>{reset ? "Reset password" : "Create an account"}</h2>
              <p>Demonstration only · No account is stored</p>
            </div>
          </div>
          {success ? (
            <div className="success-panel" role="status">
              <span className="success-symbol">
                <Icon name="check" size={32} />
              </span>
              <h2>
                {reset
                  ? "Password reset simulated"
                  : "Account creation simulated"}
              </h2>
              <p>
                The password passed this prototype’s checks. Input fields have
                been cleared. No account or credential was created or saved.
              </p>
              <button
                className="button primary"
                onClick={() => setSuccess(false)}
              >
                Try another demonstration <Icon name="arrow" size={17} />
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              {!reset && (
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    maxLength={254}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="judge@example.test"
                    required
                  />
                  <small>
                    Used locally for context-aware password feedback. Never sent
                    to HIBP.
                  </small>
                </div>
              )}
              <PasswordSecurityChecker
                security={security}
                email={email}
                reset={reset}
              />
              {reset && (
                <>
                  <PasswordInput
                    id="confirm-password"
                    label="Confirm password"
                    value={confirm}
                    onChange={setConfirm}
                    describedBy="confirm-help"
                    invalid={!!confirm && !matches}
                  />
                  <p
                    id="confirm-help"
                    className={`field-help ${confirm && !matches ? "error-text" : ""}`}
                  >
                    {confirm
                      ? matches
                        ? "Passwords match."
                        : "Passwords do not match."
                      : "Re-enter the same password. Use the eye button above if you loaded a random demo."}
                  </p>
                </>
              )}
              <div className="decision-note">
                <Icon name={decision.allowed ? "check" : "info"} size={16} />
                <p>{decision.reason}</p>
              </div>
              <button
                type="submit"
                className="button primary full"
                disabled={!ready}
              >
                {reset
                  ? "Simulate password reset"
                  : "Simulate account creation"}
                <Icon name="arrow" size={17} />
              </button>
              <p className="form-disclaimer">
                Prototype only. No login session, reset email or persistent
                account is created.
              </p>
              {notice && (
                <p className="inline-notice" role="status">
                  {notice}
                </p>
              )}
            </form>
          )}
        </section>
        <aside className="account-aside">
          <section className="demo-card">
            <span className="tag">JUDGE-FRIENDLY DEMO</span>
            <h2>See both sides of the gate.</h2>
            <p>
              Load a public breached example or generate a fresh random test
              password. Neither is a real user credential.
            </p>
            <button
              className="button secondary full"
              onClick={() => {
                setSuccess(false);
                loadDemo("breached");
              }}
            >
              <Icon name="info" size={17} />
              Load breached demo
            </button>
            <button
              className="button secondary full"
              onClick={() => {
                setSuccess(false);
                loadDemo("random");
              }}
            >
              <Icon name="bolt" size={17} />
              Generate random demo
            </button>
            <small>
              Generated values are not guaranteed to be absent from breach data.
              The live check decides.
            </small>
          </section>
          <section className="aside-explainer">
            <h3>Two different questions.</h3>
            <div>
              <span className="number-dot">1</span>
              <p>
                <strong>Is it easy to guess?</strong>Strength feedback estimates
                predictable patterns.
              </p>
            </div>
            <div>
              <span className="number-dot">2</span>
              <p>
                <strong>Has it been exposed?</strong>HIBP checks for a known
                breach match.
              </p>
            </div>
            <div className="mini-warning">
              A “Strong” estimate never overrides a breach match.
            </div>
          </section>
          <a className="privacy-link" href="#privacy">
            <Icon name="lock" size={20} />
            <span>
              What leaves your browser?
              <small>Inspect the privacy model and network proof.</small>
            </span>
            <Icon name="arrow" size={17} />
          </a>
        </aside>
      </div>
    </>
  );
}
