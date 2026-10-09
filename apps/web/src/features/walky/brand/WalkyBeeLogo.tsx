type Props = {
  className?: string;
  size?: number;
  animated?: boolean;
};

/** Original Walky Talky mascot: friendly bee holding a retro walkie-talkie. */
export function WalkyBeeLogo({ className, size = 120, animated = false }: Props) {
  const id = "walky-bee";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Walky Talky arı mascotu"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="60" y1="40" x2="140" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE566" />
          <stop offset="1" stopColor="#F5C518" />
        </linearGradient>
        <linearGradient id={`${id}-radio`} x1="118" y1="88" x2="168" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2BB673" />
          <stop offset="1" stopColor="#0F8A4B" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0f2918" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Wings */}
      <g className={animated ? "walky-wing-left" : undefined} style={{ transformOrigin: "70px 78px" }}>
        <ellipse cx="52" cy="78" rx="28" ry="18" fill="#E8F7FF" stroke="#7EB8D4" strokeWidth="3" opacity="0.95" />
      </g>
      <g className={animated ? "walky-wing-right" : undefined} style={{ transformOrigin: "128px 78px" }}>
        <ellipse cx="128" cy="72" rx="26" ry="16" fill="#E8F7FF" stroke="#7EB8D4" strokeWidth="3" opacity="0.9" />
      </g>

      <g filter={`url(#${id}-soft)`}>
        {/* Body */}
        <ellipse cx="92" cy="108" rx="42" ry="50" fill={`url(#${id}-body)`} stroke="#1A2E22" strokeWidth="4" />
        {/* Stripes */}
        <path d="M54 96 H130" stroke="#1A2E22" strokeWidth="8" strokeLinecap="round" />
        <path d="M56 118 H128" stroke="#1A2E22" strokeWidth="8" strokeLinecap="round" />
        {/* Head */}
        <circle cx="92" cy="58" r="28" fill={`url(#${id}-body)`} stroke="#1A2E22" strokeWidth="4" />
        {/* Antennae */}
        <path d="M78 36 C74 22 66 16 58 14" stroke="#1A2E22" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M106 36 C110 22 118 16 126 14" stroke="#1A2E22" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="58" cy="14" r="5" fill="#FF8A3D" stroke="#1A2E22" strokeWidth="2" />
        <circle cx="126" cy="14" r="5" fill="#FF8A3D" stroke="#1A2E22" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="82" cy="56" r="7" fill="#1A2E22" />
        <circle cx="102" cy="56" r="7" fill="#1A2E22" />
        <circle cx="84" cy="54" r="2.2" fill="#fff" />
        <circle cx="104" cy="54" r="2.2" fill="#fff" />
        {/* Smile */}
        <path d="M84 68 Q92 74 100 68" stroke="#1A2E22" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Walkie-talkie in right hand/side */}
        <g transform="translate(118, 86)">
          <rect x="0" y="12" width="36" height="52" rx="8" fill={`url(#${id}-radio)`} stroke="#1A2E22" strokeWidth="3.5" />
          <rect x="8" y="0" width="8" height="16" rx="3" fill="#FFB020" stroke="#1A2E22" strokeWidth="2.5" />
          <circle cx="12" cy="0" r="4" fill="#FF6B2C" stroke="#1A2E22" strokeWidth="2" />
          <rect x="8" y="22" width="20" height="12" rx="3" fill="#C8FFE0" stroke="#1A2E22" strokeWidth="2" />
          <circle cx="12" cy="48" r="4" fill="#FFB020" stroke="#1A2E22" strokeWidth="2" />
          <circle cx="24" cy="48" r="4" fill="#FF6B2C" stroke="#1A2E22" strokeWidth="2" />
          {/* Signal arcs */}
          <path
            d="M38 20 C46 28 46 40 38 48"
            stroke="#FFB020"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
            className={animated ? "walky-signal" : undefined}
          />
        </g>

        {/* Arm holding radio */}
        <path
          d="M118 112 C128 108 132 100 136 96"
          stroke="#1A2E22"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
