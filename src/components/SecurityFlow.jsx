import Icon from "./Icon.jsx";
export default function SecurityFlow({ compact = false }) {
  return (
    <div className={`security-flow ${compact ? "compact" : ""}`}>
      <div className="flow-top">
        <span>
          <span className="dot" /> PRIVACY BOUNDARY
        </span>
        <span>k-anonymity</span>
      </div>
      <div className="flow-browser">
        <div className="flow-title">
          <Icon name="lock" size={17} /> Your browser <span>LOCAL</span>
        </div>
        <div className="flow-secret">
          <small>PASSWORD INPUT</small>
          <span>••••••••••••••••</span>
          <em>Stays in memory</em>
        </div>
        <div className="flow-local-step">
          <span className="vertical-line" />
          <span>SHA-1 · generated locally</span>
        </div>
        <div className="hash-split">
          <div>
            <small>PREFIX · 5 CHARACTERS</small>
            <strong>A1B2C</strong>
          </div>
          <div>
            <small>REMAINING 35 CHARACTERS</small>
            <strong>••••••••••••</strong>
            <span>Stays local</span>
          </div>
        </div>
      </div>
      <div className="flow-transit">
        <span>Only the prefix crosses the boundary</span>
        <Icon name="arrow" />
        <code>GET /range/A1B2C</code>
      </div>
      <div className="flow-remote">
        <Icon name="globe" />
        <div>
          <strong>HIBP Pwned Passwords</strong>
          <small>Returns a padded set of candidate suffixes</small>
        </div>
        <span className="tag">HTTPS</span>
      </div>
      <div className="flow-return">
        <Icon name="reset" size={16} /> Exact matching happens back in your
        browser.
      </div>
      <p className="flow-caption">
        Illustration only · All hash values shown are fictional.
      </p>
    </div>
  );
}
