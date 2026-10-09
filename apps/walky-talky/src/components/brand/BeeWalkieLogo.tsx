type Props = { className?: string; size?: number };

/** Original bee + walkie-talkie mascot (SVG, no external assets) */
export function BeeWalkieLogo({ className = "", size = 64 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Walkie-talkie body */}
      <rect x="38" y="28" width="28" height="44" rx="8" fill="#059669" />
      <rect x="42" y="34" width="20" height="14" rx="3" fill="#34d399" />
      <circle cx="52" cy="58" r="5" fill="#fbbf24" />
      <rect x="48" y="18" width="8" height="14" rx="2" fill="#047857" />
      {/* Antenna */}
      <path d="M52 18 L52 8" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
      <circle cx="52" cy="6" r="3" fill="#f59e0b" />
      {/* Bee body */}
      <ellipse cx="24" cy="44" rx="18" ry="16" fill="#fbbf24" />
      <path
        d="M10 44 H38"
        stroke="#1a2e1f"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M14 38 H34" stroke="#1a2e1f" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 50 H34" stroke="#1a2e1f" strokeWidth="3" strokeLinecap="round" />
      {/* Wings */}
      <ellipse cx="18" cy="32" rx="10" ry="8" fill="white" fillOpacity="0.85" />
      <ellipse cx="30" cy="30" rx="10" ry="8" fill="white" fillOpacity="0.85" />
      {/* Face */}
      <circle cx="20" cy="42" r="2" fill="#1a2e1f" />
      <circle cx="28" cy="42" r="2" fill="#1a2e1f" />
      <path d="M22 48 Q24 50 26 48" stroke="#1a2e1f" strokeWidth="1.5" fill="none" />
      {/* Stinger */}
      <path d="M6 44 L2 46 L6 48" fill="#1a2e1f" />
    </svg>
  );
}
