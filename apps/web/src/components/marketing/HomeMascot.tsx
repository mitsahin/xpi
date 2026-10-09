/** Original x-pi 2D buddy for marketing home — not a Duolingo asset. */
export function HomeMascot({
  className = "",
  size = 280,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 220"
      fill="none"
      aria-hidden
      role="img"
    >
      <ellipse cx="100" cy="208" rx="48" ry="8" fill="#00000012" />
      {/* body */}
      <ellipse cx="100" cy="128" rx="72" ry="78" fill="#58cc02" />
      <ellipse cx="100" cy="128" rx="60" ry="66" fill="#89e219" />
      {/* belly */}
      <ellipse cx="100" cy="148" rx="38" ry="40" fill="#d7ffb8" />
      {/* eyes */}
      <ellipse cx="78" cy="112" rx="14" ry="18" fill="#fff" />
      <ellipse cx="122" cy="112" rx="14" ry="18" fill="#fff" />
      <circle cx="82" cy="116" r="6.5" fill="#1a1a1a" />
      <circle cx="126" cy="116" r="6.5" fill="#1a1a1a" />
      <circle cx="84" cy="114" r="2" fill="#fff" />
      <circle cx="128" cy="114" r="2" fill="#fff" />
      {/* smile */}
      <path
        d="M82 142c8 14 28 14 36 0"
        stroke="#1a1a1a"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* blush */}
      <circle cx="58" cy="134" r="9" fill="#ff8a80" opacity="0.85" />
      <circle cx="142" cy="134" r="9" fill="#ff8a80" opacity="0.85" />
      {/* antenna buds */}
      <path
        d="M70 62c6-28 22-36 30-36s24 8 30 36"
        stroke="#3d9a00"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="70" cy="58" r="8" fill="#58cc02" />
      <circle cx="130" cy="58" r="8" fill="#58cc02" />
      {/* spark */}
      <path
        d="M168 72l4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10z"
        fill="#ffc800"
      />
    </svg>
  );
}
