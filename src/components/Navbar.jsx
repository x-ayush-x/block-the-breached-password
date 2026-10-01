import Icon from "./Icon.jsx";
import { NAV } from "../data/navigation.js";
export default function Navbar({ page }) {
  return (
    <aside className="sidebar">
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
        <span className="workspace-avatar">MI</span>
        <span>
          Microsoft Innovate<small>Student project · Demo workspace</small>
        </span>
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
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
        <span className="dot" /> Hackathon prototype <span>v1.4</span>
      </div>
    </aside>
  );
}
