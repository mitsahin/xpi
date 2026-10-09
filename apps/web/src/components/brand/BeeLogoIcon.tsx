import { useId } from "react";

/**
 * Compact tilted bee for header/logo lockup only (~36–44px).
 * Two-stripe chibi body, light-blue wings — distinct from full BeeMascot hero art.
 */
export function BeeLogoIcon({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  const clipId = useId().replace(/:/g, "");
  const gradId = `bee-logo-grad-${clipId}`;
  const bodyClip = `bee-logo-body-${clipId}`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-hidden
    >
      <defs>
        <radialGradient id={gradId} cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff4b0" />
          <stop offset="50%" stopColor="#fed432" />
          <stop offset="100%" stopColor="#f0bc20" />
        </radialGradient>
        <clipPath id={bodyClip}>
          <circle cx="24" cy="26" r="13.5" />
        </clipPath>
      </defs>

      <g transform="rotate(17 24 24)">
        <ellipse cx="11" cy="22" rx="9" ry="6" fill="#d4f1fa" fillOpacity="0.95" />
        <ellipse cx="37" cy="22" rx="9" ry="6" fill="#d4f1fa" fillOpacity="0.95" />

        <circle cx="24" cy="26" r="13.5" fill={`url(#${gradId})`} />
        <ellipse cx="20" cy="21" rx="4" ry="2.5" fill="#fff" opacity="0.35" />

        <g clipPath={`url(#${bodyClip})`}>
          <rect x="10" y="28" width="28" height="3.5" fill="#1c1c1a" />
          <rect x="10" y="34" width="28" height="3.5" fill="#1c1c1a" />
        </g>

        <ellipse cx="19" cy="24" rx="2.4" ry="3" fill="#1c1c1a" />
        <ellipse cx="29" cy="24" rx="2.4" ry="3" fill="#1c1c1a" />
        <circle cx="18.2" cy="23" r="0.85" fill="#fff" />
        <circle cx="28.2" cy="23" r="0.85" fill="#fff" />

        <path
          d="M21.5 28.5c1.2 2.2 4.8 2.2 6 0"
          stroke="#1c1c1a"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <ellipse cx="15.5" cy="26.5" rx="2.2" ry="1.6" fill="#fa8e8c" opacity="0.88" />
        <ellipse cx="32.5" cy="26.5" rx="2.2" ry="1.6" fill="#fa8e8c" opacity="0.88" />

        <path
          d="M20 14.5c-1-4.5-3.2-7-5.2-7.5"
          stroke="#1c1c1a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M28 14.5c1-4.5 3.2-7 5.2-7.5"
          stroke="#1c1c1a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="14.2" cy="6.8" r="2" fill="#fed432" />
        <circle cx="33.8" cy="6.8" r="2" fill="#fed432" />
      </g>

      <circle cx="42" cy="8" r="1.4" fill="#f0c44a" opacity="0.85" />
      <circle cx="6" cy="38" r="1.1" fill="#f0c44a" opacity="0.7" />
    </svg>
  );
}
