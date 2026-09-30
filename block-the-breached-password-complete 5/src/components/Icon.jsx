const paths = {
  shield: "M12 3 4 6v6c0 4 3 7 8 9 5-2 8-5 8-9V6l-8-3Z M8 12l3 3 5-6",
  home: "m3 10 9-7 9 7 M5 9v12h5v-7h4v7h5V9",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M4 21v-3a8 8 0 0 1 16 0v3",
  reset: "M3 10a9 9 0 1 1 2 9 M3 4v6h6 M12 7v5l3 2",
  chart: "M4 3v17h17 M9 16v-5 M14 16V7 M19 16V4",
  flow: "M8 4H3v5h5V4Z M21 15h-5v5h5v-5Z M21 4h-5v5h5V4Z M8 6h8 M6 9v8h10",
  lock: "M6 10h12v11H6V10Z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3",
  file: "M14 3H5v18h14V8l-5-5Z M14 3v5h5 M8 12h8 M8 16h6",
  arrow: "M4 12h16 M14 6l6 6-6 6",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12 M6 18 18 6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  info: "M12 8h.01 M12 11v6 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  globe:
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z M2 12h20 M12 2c5 6 5 14 0 20-5-6-5-14 0-20Z",
  download: "M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5",
  bolt: "m13 2-9 12h7l-1 8 10-13h-7l1-7Z",
};
export default function Icon({ name = "shield", size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name] ?? paths.shield} />
    </svg>
  );
}
