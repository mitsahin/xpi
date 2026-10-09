/** Simple original 2D SVG buddy — not a Duolingo asset. */
export function PathMascot({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      width="96"
      height="96"
      aria-hidden
      role="img"
    >
      <ellipse cx="60" cy="108" rx="28" ry="6" fill="#00000014" />
      <circle cx="60" cy="58" r="38" fill="#58cc02" />
      <circle cx="60" cy="58" r="32" fill="#89e219" />
      <ellipse cx="46" cy="54" rx="7" ry="9" fill="#fff" />
      <ellipse cx="74" cy="54" rx="7" ry="9" fill="#fff" />
      <circle cx="48" cy="56" r="3.2" fill="#1a1a1a" />
      <circle cx="76" cy="56" r="3.2" fill="#1a1a1a" />
      <path
        d="M48 72c6 8 18 8 24 0"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="38" cy="68" r="5" fill="#ff8a80" opacity="0.85" />
      <circle cx="82" cy="68" r="5" fill="#ff8a80" opacity="0.85" />
      <path
        d="M42 28c4-14 14-18 18-18s14 4 18 18"
        fill="none"
        stroke="#3d9a00"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
