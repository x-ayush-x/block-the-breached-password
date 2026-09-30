import { useEffect, useRef, useState } from "react";
import { checkBreachedPassword } from "../services/hibpService.js";
import { securityDecision, validatePassword } from "../utils/passwordPolicy.js";

const unchecked = () => ({ status: "idle", count: 0 });
export default function usePasswordSecurity(onAudit) {
  const [evidence, setEvidence] = useState(null);
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimer = useRef(null);
  const [password, setPassword] = useState("");
  const [breach, setBreach] = useState(unchecked);
  const current = useRef("");
  const result = useRef(unchecked());
  const revision = useRef(0);
  const active = useRef(null);
  const expiry = useRef(null);
  const lastStart = useRef(0);

  const publish = (value) => {
    result.current = value;
    setBreach(value);
  };
  function changePassword(value) {
    revision.current += 1;
    active.current?.abort();
    active.current = null;
    clearTimeout(expiry.current);
    current.current = value;
    setPassword(value);
    publish(unchecked());
    setEvidence(null);
  }
  useEffect(
    () => () => {
      revision.current += 1;
      active.current?.abort();
      clearTimeout(expiry.current);
      clearTimeout(cooldownTimer.current);
      current.current = "";
    },
    [],
  );

  async function check() {
    // Guards rapid double-clicks, even before React renders a disabled button.
    if (
      active.current ||
      Date.now() - lastStart.current < 750 ||
      !current.current
    )
      return;
    lastStart.current = Date.now();
    setCooldown(true);
    cooldownTimer.current = setTimeout(() => setCooldown(false), 750);
    const id = ++revision.current;
    const controller = new AbortController();
    active.current = controller;
    clearTimeout(expiry.current);
    publish({ status: "checking", count: 0 });
    setEvidence(null);
    try {
      const checked = await checkBreachedPassword(current.current, {
        signal: controller.signal,
        onLookup: (event) => {
          if (id === revision.current) setEvidence(event);
        },
      });
      if (id !== revision.current) return;
      onAudit?.(
        "Breach check",
        checked.breached ? "Compromised" : "No known match",
      );
      publish({
        status: checked.breached ? "breached" : "clear",
        count: checked.count,
        checkedAt: new Date().toISOString(),
      });
      expiry.current = setTimeout(
        () => {
          if (id === revision.current) publish({ status: "expired", count: 0 });
        },
        5 * 60 * 1000,
      );
    } catch (error) {
      if (id !== revision.current || error.name === "AbortError") return;
      onAudit?.("Breach check", "Unavailable");
      publish({ status: "error", count: 0, code: error.code });
    } finally {
      if (id === revision.current) active.current = null;
    }
  }
  // The submit handler reads the current refs, so it cannot trust stale UI state.
  function decisionNow(email) {
    return securityDecision(
      validatePassword(current.current, email),
      result.current,
    );
  }
  return { password, breach, evidence, cooldown, changePassword, check, decisionNow };
}
