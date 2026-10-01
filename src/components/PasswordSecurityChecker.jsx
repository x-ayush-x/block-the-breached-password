import { useMemo } from "react";
import PasswordInput from "./PasswordInput.jsx";
import StrengthMeter from "./StrengthMeter.jsx";
import BreachStatus from "./BreachStatus.jsx";
import PrivacyEvidence from "./PrivacyEvidence.jsx";
import Icon from "./Icon.jsx";
import { evaluateStrength } from "../utils/passwordStrength.js";
import { validatePassword, POLICY } from "../utils/passwordPolicy.js";

export default function PasswordSecurityChecker({
  security,
  email = "",
  reset = false,
}) {
  const { password, breach, changePassword, check } = security;
  const policy = validatePassword(password, email);
  const strength = useMemo(
    () => evaluateStrength(password, email),
    [password, email],
  );
  const canCheck =
    password.length > 0 &&
    password.length <= POLICY.rawInputLimit &&
    policy.length <= POLICY.maxLength &&
    !security.cooldown &&
    breach.status !== "checking";
  return (
    <>
      <PasswordInput
        id="new-password"
        label={reset ? "New password" : "Password"}
        value={password}
        onChange={changePassword}
        describedBy="password-guidance"
        invalid={!!password && !policy.valid}
      />
      <div id="password-guidance" className="password-guidance">
        <span>15–128 characters · Paste is welcome</span>
        <span>{policy.length ?? "Too many"} characters</span>
      </div>
      <StrengthMeter strength={strength} />
      <div className="rule-list">
        <p className={policy.lengthOK ? "met" : ""}>
          <Icon name={policy.lengthOK ? "check" : "info"} size={15} />
          At least 15 characters, at most 128
        </p>
        <p className={password && !policy.blocked ? "met" : ""}>
          <Icon
            name={password && !policy.blocked ? "check" : "info"}
            size={15}
          />
          Not a common or account-related whole password
        </p>
      </div>
      <button
        type="button"
        className="button secondary check-button"
        disabled={!canCheck}
        onClick={check}
      >
        <Icon name="shield" size={17} />
        {breach.status === "checking" ? "Checking…" : "Check password securely"}
        <Icon name="arrow" size={17} />
      </button>
      {breach.status === "checking" && <button type="button" className="button secondary" onClick={security.cancel}>Cancel check</button>}
      <section className="decision-breakdown" aria-label="Live decision breakdown">
        <h3>Live decision breakdown</h3>
        <ul>
          <li>Length: {policy.lengthOK ? "Pass" : "Blocked — use 15–128 characters"}</li>
          <li>Common/account-related values: {!password ? "Awaiting input" : policy.blocked ? "Blocked — choose a different whole value" : "Pass — local list only"}</li>
          <li>Strength: {strength.label} — advisory; never overrides a breach match.</li>
          <li>Breach: {breach.status}{security.offline ? " (MOCK ONLY)" : " (live HIBP)"}</li>
        </ul>
        <p>Processing stages · {security.offline ? "local mock transport" : "live transport"}</p>
        <ol aria-live="polite" aria-relevant="additions">{security.stages.map((stage, i) => <li key={i}>{stage}</li>)}</ol>
        {breach.status === "error" && <p role="status">Check failed. Submission remains blocked.</p>}
      </section>
      {security.offline && <p role="status"><strong>OFFLINE DEMONSTRATION — synthetic mock corpus, no HIBP requests. “Not found” below means no mock match only.</strong></p>}
      <BreachStatus breach={breach} offline={security.offline} />
      {!security.offline && <PrivacyEvidence evidence={security.evidence} />}
    </>
  );
}
