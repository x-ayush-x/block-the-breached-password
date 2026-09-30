import { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import { NAV } from "./data/navigation.js";
import Icon from "./components/Icon.jsx";
import Home from "./pages/Home.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Privacy from "./pages/Privacy.jsx";
import SecurityLab from "./pages/SecurityLab.jsx";
import Policy from "./pages/Policy.jsx";

const readPage = () => {
  const id = window.location.hash.slice(1);
  return NAV.some(([page]) => page === id) ? id : "home";
};
export default function App() {
  const [page, setPage] = useState(readPage);
  const [audit, setAudit] = useState([]);
  const main = useRef(null);
  useEffect(() => {
    const navigate = () => {
      setPage(readPage());
      window.scrollTo(0, 0);
      main.current?.focus();
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  useEffect(() => {
    document.title = `${NAV.find(([id]) => id === page)[1]} · Block the Breached Password`;
  }, [page]);
  function onAudit(action, outcome) {
    // Only fixed event labels are passed by the UI. Never include form contents.
    setAudit((events) =>
      [
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          action,
          outcome,
        },
        ...events,
      ].slice(0, 50),
    );
  }
  const pages = {
    home: <Home />,
    signup: <AccountPage key="signup" onAudit={onAudit} />,
    reset: <AccountPage key="reset" reset onAudit={onAudit} />,
    dashboard: <Dashboard onAudit={onAudit} />,
    architecture: <HowItWorks />,
    privacy: <Privacy audit={audit} />,
    policy: <Policy />,
    lab: <SecurityLab />,
  };
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <Navbar page={page} />
      <div className="main-shell">
        <header className="topbar">
          <div>
            <span>Workspace</span>
            <span className="slash">/</span>
            <strong>{NAV.find(([id]) => id === page)[1]}</strong>
          </div>
          <div className="topbar-right">
            <span className="environment-pill">DEMO ENVIRONMENT</span>
            <span className="avatar" aria-label="Demo workspace">
              MI
            </span>
          </div>
        </header>
        <main id="main-content" ref={main} tabIndex={-1}>
          {pages[page]}
        </main>
        <footer className="site-footer">
          <span>
            <Icon name="shield" size={14} />
            Block the Breached Password
          </span>
          <span>Client-side prototype · Authentication simulated</span>
          <a href="#privacy">Privacy & limitations</a>
        </footer>
      </div>
    </div>
  );
}
