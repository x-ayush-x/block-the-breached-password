export default function StrengthMeter({ strength }) {
  return (
    <section
      className={`strength level-${strength.level}`}
      aria-label="Password strength"
    >
      <div className="spread">
        <span className="small-label">GUESSABILITY ESTIMATE</span>
        <strong>{strength.label}</strong>
      </div>
      <div
        className="strength-bars"
        role="meter"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={strength.level}
        aria-valuetext={strength.label}
      >
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={n <= strength.level ? "filled" : ""} />
        ))}
      </div>
      <p>{strength.feedback}</p>
    </section>
  );
}
