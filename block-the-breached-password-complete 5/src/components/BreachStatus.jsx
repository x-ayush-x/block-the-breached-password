import Icon from "./Icon.jsx";
import { errorMessage } from "../services/hibpService.js";
export default function BreachStatus({ breach }) {
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
            Observed approximately {breach.count.toLocaleString()} times in HIBP
            data.
          </small>
        )}
      </div>
    </div>
  );
}
