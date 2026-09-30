import Icon from "../components/Icon.jsx";
import SecurityFlow from "../components/SecurityFlow.jsx";
export default function Home() {
  return (
    <>
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-rule" /> PREVENT BEFORE YOU PROTECT
          </p>
          <h1>
            A better password.
            <br />A smaller
            <br />
            <span>attack surface.</span>
          </h1>
          <p className="hero-description">
            Stop compromised passwords before they become your next security
            incident.
          </p>
          <div className="hero-actions">
            <a href="#signup" className="button primary">
              Try password checker <Icon name="arrow" size={18} />
            </a>
            <a href="#dashboard" className="text-link">
              View security dashboard <Icon name="arrow" size={16} />
            </a>
          </div>
          <div className="hero-trust">
            <Icon name="lock" size={15} /> Your password stays in your browser.
          </div>
          <p className="fine-print">
            Simulated signup and reset. Use demonstration passwords.
          </p>
        </div>
        <SecurityFlow compact />
      </section>
      <div className="fact-strip">
        <div>
          <strong>05</strong>
          <span>
            Hash characters sent
            <br />
            to the breach service
          </span>
        </div>
        <div>
          <strong>00</strong>
          <span>
            User passwords stored
            <br />
            by this application
          </span>
        </div>
        <div>
          <strong>100%</strong>
          <span>
            Local hash generation
            <br />
            and exact matching
          </span>
        </div>
      </div>
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">THE SECURITY WORKFLOW</p>
            <h2>Three layers. One clear decision.</h2>
          </div>
          <a className="text-link" href="#architecture">
            Explore the architecture <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="three-grid">
          {[
            [
              "01",
              "bolt",
              "Understand strength",
              "Recognize common words, patterns and repetitions. Get useful feedback beyond character checklists.",
            ],
            [
              "02",
              "shield",
              "Check for exposure",
              "Look up a partial hash with HIBP. Compare the returned candidates locally, without sharing the password.",
            ],
            [
              "03",
              "lock",
              "Block compromised choices",
              "A known breach always blocks the simulated signup or reset. Unavailable checks keep the gate closed.",
            ],
          ].map(([n, icon, title, body]) => (
            <article className="feature-card" key={n}>
              <div className="spread">
                <span className="feature-icon">
                  <Icon name={icon} />
                </span>
                <span className="card-number">{n}</span>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bottom-banner">
        <div>
          <Icon name="file" size={27} />
          <div>
            <h3>Built around better password guidance</h3>
            <p>
              Length, blocklists and password managers. No arbitrary symbol
              requirements.
            </p>
          </div>
        </div>
        <a href="#policy" className="button secondary">
          Read our policy <Icon name="arrow" size={16} />
        </a>
      </section>
    </>
  );
}
