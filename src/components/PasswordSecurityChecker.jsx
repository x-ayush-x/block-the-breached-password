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
      <p className="fine-print">Strength is advice about guessability. It is not a submission rule and never overrides a breach match.</p>
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
      <details className="check-processing">
        <summary>See actual processing stages</summary>
        <p>{security.offline ? "Local mock transport — no HIBP request" : "Live HIBP transport"}. These stages come from the checker, not a simulated progress timer.</p>
        {!security.stages.length && <p>Stages appear when you select “Check password securely”.</p>}
        <ol aria-live="polite" aria-relevant="additions">{security.stages.map((stage, i) => <li key={i}>{stage}</li>)}</ol>
      </details>
      {security.offline && <p role="status"><strong>OFFLINE DEMONSTRATION — synthetic mock corpus, no HIBP requests. “Not found” below means no mock match only.</strong></p>}
      <BreachStatus breach={breach} offline={security.offline} />
      {!security.offline && <PrivacyEvidence evidence={security.evidence} />}
    </>
  );
}
