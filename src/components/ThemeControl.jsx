import { useEffect, useState } from "react";

// Appearance only, held in memory. No credentials or preferences go into storage.
export default function ThemeControl() {
  const [theme, setTheme] = useState("system");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return <label className="theme-control">
    <span>Appearance</span>
    <select aria-label="Color theme" value={theme} onChange={event => setTheme(event.target.value)}>
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>;
}
