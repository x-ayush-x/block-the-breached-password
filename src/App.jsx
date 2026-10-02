import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import { NAV } from "./data/navigation.js";
import Icon from "./components/Icon.jsx";
const Home = lazy(() => import("./pages/Home.jsx"));
const AccountPage = lazy(() => import("./pages/AccountPage.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const HowItWorks = lazy(() => import("./pages/HowItWorks.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const SecurityLab = lazy(() => import("./pages/SecurityLab.jsx"));
const Policy = lazy(() => import("./pages/Policy.jsx"));

import ThemeControl from "./components/ThemeControl.jsx";
import DemoGuide from "./components/DemoGuide.jsx";

const readPage = () => {
  const id = window.location.hash.slice(1);
  return NAV.some(([page]) => page === id) ? id : "home";
};
export default function App() {
  const [offline, setOffline] = useState(false);
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
    document.title = `${NAV.find(([id]) => id === page)[1]} · HELLO WORLD`;
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
    signup: <AccountPage offline={offline} key={`signup-${offline}`} onAudit={onAudit} />,
    reset: <AccountPage offline={offline} key={`reset-${offline}`} reset onAudit={onAudit} />,
    dashboard: <Dashboard offline={offline} key={`dashboard-${offline}`} onAudit={onAudit} />,
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
            <ThemeControl />
            <span className="environment-pill">DEMO ENVIRONMENT</span>
            <span className="avatar" aria-label="Demo workspace">
              HW
            </span>
          </div>
        </header>
        <main id="main-content" ref={main} tabIndex={-1}>
          <DemoGuide offline={offline} setOffline={setOffline} />
          <Suspense key={page} fallback={<p role="status">Loading page…</p>}>{pages[page]}</Suspense>
        </main>
        <footer className="site-footer">
          <span>
            <Icon name="shield" size={14} />
            HELLO WORLD
          </span>
          <span>Client-side prototype · Authentication simulated</span>
          <a href="#privacy">Privacy & limitations</a>
        </footer>
      </div>
    </div>
  );
}
