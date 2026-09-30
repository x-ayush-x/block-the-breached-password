import { useState } from "react";
import Icon from "./Icon.jsx";
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  describedBy,
  invalid = false,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <Icon name="lock" size={18} />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          autoCapitalize="none"
          spellCheck={false}
          required
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
        />
        <button
          className="reveal"
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          <Icon name="eye" size={18} />
        </button>
      </div>
    </div>
  );
}
