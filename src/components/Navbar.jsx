import Icon from "./Icon.jsx";
import { NAV } from "../data/navigation.js";
import { useRef, useState } from "react";
export default function Navbar({ page }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useRef(null);
  return (
    <aside className="sidebar" onKeyDown={event => {
      if (event.key === "Escape" && expanded) {
        setExpanded(false);
        toggle.current?.focus();
      }
    }}>
      <a href="#home" className="brand">
        <span className="brand-icon">
          <Icon size={25} />
        </span>
        <span>
          <strong>HELLO WORLD</strong>
          <small>Block the Breached Password</small>
        </span>
      </a>
      <div className="workspace">
        <span className="workspace-avatar">HW</span>
        <span>
          Microsoft Innovate<small>Student project · Demo workspace</small>
        </span>
      </div>
      <p className="nav-label">WORKSPACE</p>
      <button ref={toggle} className="mobile-nav-toggle" aria-expanded={expanded} aria-controls="workspace-navigation" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Close navigation" : "Explore pages"}<span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <nav id="workspace-navigation" className={expanded ? "expanded" : ""} aria-label="Main navigation">
        {NAV.map(([id, label, icon]) => (
          <a
            key={id}
            href={`#${id}`}
            className={page === id ? "nav-item active" : "nav-item"}
            aria-current={page === id ? "page" : undefined}
          >
            <Icon name={icon} size={19} />
            {label}
            {page === id && <span className="nav-dot" />}
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Icon name="lock" size={18} />
        <p>
          Privacy by design
          <small>
            No credential database.
            <br />
            No analytics. No backend.
          </small>
        </p>
      </div>
      <div className="sidebar-version">
        <span className="dot" /> Hackathon prototype <span>v1.8</span>
      </div>
    </aside>
  );
}
