import Icon from "./Icon.jsx";
import { errorMessage } from "../services/hibpService.js";
export default function BreachStatus({ breach, offline = false }) {
  const states = {
    idle: [
      "Not checked",
      "Finish entering your password, then run a secure breach check.",
      "shield",
    ],
    checking: [
      "Checking breach database securely…",
      "Only a five-character hash prefix is sent to HIBP.",
      "reset",
    ],
    breached: [
      "Compromised password",
      "This password has appeared in known data breaches and cannot be used.",
      "close",
    ],
    clear: [
      "No known breach found",
      "This does not guarantee the password is secure.",
      "check",
    ],
    error: ["Check unavailable", errorMessage(breach.code), "info"],
    expired: [
      "Check expired",
      "Please check again. Results expire after five minutes.",
      "reset",
    ],
  };
  if (offline) {
    states.checking = ['Checking local mock corpus…', 'No HIBP request. Synthetic demonstration only.', 'reset'];
    states.breached = ['Mock corpus match', 'This public fixture matches the synthetic corpus. Simulated submission is blocked.', 'close'];
    states.clear = ['No mock match', 'This is not a live breach verdict and does not establish real-world safety.', 'check'];
  }
  const [title, text, icon] = states[breach.status];
  return (
    <div
      className={`breach-status ${breach.status}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`status-icon ${breach.status === "checking" ? "spin" : ""}`}
      >
        <Icon name={icon} />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
        {breach.status === "breached" && (
          <small>
            Observed approximately {breach.count.toLocaleString()} times in {offline ? "synthetic mock data" : "HIBP data"}.
          </small>
        )}
      </div>
    </div>
  );
}
