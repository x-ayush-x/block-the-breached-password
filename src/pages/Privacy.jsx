import PageHeading from "../components/PageHeading.jsx";
import Icon from "../components/Icon.jsx";
export default function Privacy({ audit }) {
  return (
    <>
      <PageHeading
        eyebrow="PRIVACY & VERIFICATION"
        title="Don’t take our word for it."
        description="Inspect the request. Read the implementation. Understand the limits."
      />
      <div className="privacy-cards">
        {[
          ["lock", "Actual password", "••••••••••••", "STAYS LOCAL", "local"],
          [
            "file",
            "Full SHA-1 hash",
            "••••••••••••••••",
            "STAYS LOCAL",
            "local",
          ],
          [
            "arrow",
            "Five-character prefix",
            "A1B2C",
            "SENT TO HIBP",
            "outbound",
          ],
          [
            "reset",
            "HIBP response",
            "Suffix candidates",
            "RETURNED TO CLIENT",
            "local",
          ],
        ].map(([icon, title, value, badge, tone]) => (
          <article className={`privacy-card ${tone}`} key={title}>
            <Icon name={icon} />
            <h3>{title}</h3>
            <code>{value}</code>
            <span className="tag">{badge}</span>
          </article>
        ))}
      </div>
      <p className="fine-print">
        Illustrative values only. This page never shows your actual password,
        full hash or suffix.
      </p>
      <div className="two-grid section-block">
        <section className="panel prose">
          <span className="eyebrow">REPRODUCIBLE DEMO</span>
          <h2>Verify in Chrome DevTools</h2>
          <ol className="numbered-list">
            <li>
              Open <a href="#signup">Sign up</a> and load a public breached
              demo.
            </li>
            <li>
              Press <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>I</kbd> on Mac. Select{" "}
              <strong>Network</strong>.
            </li>
            <li>
              Clear the network list. Filter by{" "}
              <code>api.pwnedpasswords.com</code>.
            </li>
            <li>
              Click <strong>Check password securely</strong>.
            </li>
            <li>
              Inspect the GET request: <code>/range/</code> followed by exactly
              five hex characters. There is no request body or password query
              parameter.
            </li>
            <li>
              Check the <code>Add-Padding: true</code> header, then inspect the
              suffix-and-count response. An OPTIONS preflight may also appear.
            </li>
            <li>
              Edit the password. The previous result immediately becomes
              invalid.
            </li>
          </ol>
          <p className="fine-print">
            Network inspection is evidence for the observed run, not a universal
            proof against a compromised browser or modified code.
          </p>
        </section>
        <section className="request-panel">
          <div className="spread">
            <span className="small-label">ILLUSTRATIVE NETWORK REQUEST</span>
            <span className="tag">GET</span>
          </div>
          <code>
            https://api.pwnedpasswords.com
            <br />
            /range/<mark>A1B2C</mark>
          </code>
          <div className="request-line">
            <span>Request body</span>
            <strong>None</strong>
          </div>
          <div className="request-line">
            <span>Password or full hash</span>
            <strong>Not included</strong>
          </div>
          <div className="request-line">
            <span>Cookies & credentials</span>
            <strong>Omitted</strong>
          </div>
          <div className="request-line">
            <span>Referrer</span>
            <strong>Omitted</strong>
          </div>
          <div className="request-line">
            <span>Response padding</span>
            <strong>Requested</strong>
          </div>
          <p>
            HTTPS protects the connection. The service still receives the
            prefix, IP address, timing and normal browser metadata.
          </p>
        </section>
      </div>
      <section className="panel prose">
        <h2>What this prototype can—and cannot—claim</h2>
        <div className="two-grid">
          <div>
            <h3>Implemented protections</h3>
            <ul>
              <li>
                No application password storage, analytics or credential
                logging.
              </li>
              <li>
                Explicit checks, cancellation, stale-response protection and
                timeouts.
              </li>
              <li>Unknown checks block simulated submissions.</li>
              <li>Input references are cleared on success and page unmount.</li>
            </ul>
          </div>
          <div>
            <h3>Honest boundaries</h3>
            <ul>
              <li>
                JavaScript memory cannot be reliably wiped. Extensions and
                DevTools may inspect it.
              </li>
              <li>
                Your own password manager may save input independently of this
                app.
              </li>
              <li>
                Client-side checks can be bypassed by modifying the client.
                There is no production authentication.
              </li>
              <li>
                No-match results describe this dataset at check time, not future
                safety.
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="panel results-panel">
        <div className="section-header">
          <div>
            <h2>Session activity</h2>
            <p className="muted">
              Up to 50 non-sensitive demo events, held in memory. Reload clears
              them.
            </p>
          </div>
          <span className="tag">NOT A DURABLE AUDIT LOG</span>
        </div>
        {audit.length ? (
          <div className="table-scroll" tabIndex={0} role="region" aria-label="Session activity table">
            <table>
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>ACTION</th>
                  <th>OUTCOME</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((event) => (
                  <tr key={event.id}>
                    <td>{new Date(event.at).toLocaleTimeString()}</td>
                    <td>{event.action}</td>
                    <td>{event.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Icon name="file" size={28} />
            <p>
              Complete a simulation or run a dataset analysis to record an
              event.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
