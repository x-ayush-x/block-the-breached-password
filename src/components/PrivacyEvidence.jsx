export default function PrivacyEvidence({ evidence }) {
  const labels = {
    requesting: "Request started; awaiting response",
    received: "Valid response received; comparison happens locally",
    failed: "Request failed; submission stays blocked",
    cancelled: "Request cancelled",
  };
  return (
    <details className="privacy-evidence">
      <summary>Inspect this check’s privacy evidence</summary>
      <p>Only the five-character hash prefix is used in the breach request.</p>
      <dl className="evidence-facts">
        <dt>Password and full hash</dt><dd>Kept local by this application</dd>
        <dt>Request method</dt><dd>GET · No request body</dd>
        <dt>Hash prefix</dt><dd className="mono" data-testid="lookup-prefix">{evidence?.prefix ?? "Run a check to inspect its prefix"}</dd>
        <dt>Request destination</dt>
        <dd className="mono evidence-url">{evidence ? `https://api.pwnedpasswords.com/range/${evidence.prefix}` : "api.pwnedpasswords.com"}</dd>
        <dt>Status</dt><dd>{evidence ? labels[evidence.status] : "No request for the current input"}</dd>
      </dl>
      <div className="evidence-checklist">
        <h3>Verify it yourself</h3>
        <ol>
          <li>Use a public demonstration input. Open Chrome’s Network panel (Mac: Command + Option + I).</li>
          <li>Filter by <code>pwnedpasswords</code>, then explicitly run Check password securely.</li>
          <li>Inspect the GET request: the range path ends in five characters, with no query string or request body.</li>
          <li>Inspect the response: candidate suffixes and counts return. The exact comparison happens in your browser.</li>
        </ol>
        <p>No password, email, full hash or local suffix belongs in the outgoing lookup. The lab’s mock checks are not live network evidence.</p>
      </div>
      <p className="fine-print">This panel describes application activity, not independent proof. In Chrome, open DevTools → Network, filter “range”, then run a check to verify the URL, headers and absence of a request body. HIBP can still see your IP address and request timing. A prefix reveals partial hash information.</p>
      <p className="fine-print">Evidence stays in page memory and clears when you change the password or leave. Avoid using real passwords during demonstrations.</p>
    </details>
  );
}
