import Icon from "./Icon.jsx";
export default function DashboardCards({ summary, hasRun, mockMode = false }) {
  const cards = [
    [
      "ACCOUNTS TESTED",
      hasRun ? summary.tested : "—",
      `${summary.total} demonstration accounts in this run`,
      "user",
      "",
    ],
    [
      mockMode ? "MOCK MATCHES" : "BREACHED PASSWORDS",
      hasRun ? summary.breached : "—",
      mockMode ? "Matches in the synthetic corpus only" : "Known matches in HIBP data",
      "shield",
      "danger",
    ],
    [
      mockMode ? "NO MOCK MATCH" : "NOT FOUND IN BREACH DATA",
      hasRun ? summary.clear : "—",
      "No known match; not a safety guarantee",
      "check",
      "safe",
    ],
    [
      mockMode ? "SYNTHETIC MATCH RATE" : "BREACH EXPOSURE RATE",
      summary.percentage === null ? "—" : `${summary.percentage}%`,
      "Of successfully checked accounts",
      "chart",
      "",
    ],
  ];
  return (
    <div className="metrics-grid">
      {cards.map(([label, value, note, icon, tone]) => (
        <div className={`metric-card ${tone}`} key={label}>
          <div className="spread">
            <span className="small-label">{label}</span>
            <Icon name={icon} size={18} />
          </div>
          <strong>{value}</strong>
          <p>{note}</p>
        </div>
      ))}
    </div>
  );
}
