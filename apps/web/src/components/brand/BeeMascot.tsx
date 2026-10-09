import { useId } from "react";

/**
 * Original x-pi bee mascot — flat Duolingo-like yellow/black buddy.
 * Matches bee-home-2 concept: round body, two thick stripes, simple smile,
 * antennae with ball tips, soft translucent light-blue wings.
 */
export function BeeMascot({
  className = "",
  size = 200,
  title = "x-pi bee",
}: {
  className?: string;
  size?: number;
  title?: string;
}) {
  const clipId = useId().replace(/:/g, "");
  const bodyClip = `bee-body-${clipId}`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      role="img"
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}

      <defs>
        <clipPath id={bodyClip}>
          <ellipse cx="100" cy="108" rx="56" ry="62" />
        </clipPath>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="100" cy="186" rx="40" ry="7" fill="#00000012" />

      {/* four soft translucent light-blue wings (behind body) */}
      <ellipse
        cx="46"
        cy="92"
        rx="38"
        ry="26"
        fill="#b5e6ff"
        fillOpacity="0.42"
        transform="rotate(-28 46 92)"
      />
      <ellipse
        cx="154"
        cy="92"
        rx="38"
        ry="26"
        fill="#b5e6ff"
        fillOpacity="0.42"
        transform="rotate(28 154 92)"
      />
      <ellipse
        cx="52"
        cy="112"
        rx="32"
        ry="22"
        fill="#c8f0ff"
        fillOpacity="0.55"
        transform="rotate(-14 52 112)"
      />
      <ellipse
        cx="148"
        cy="112"
        rx="32"
        ry="22"
        fill="#c8f0ff"
        fillOpacity="0.55"
        transform="rotate(14 148 112)"
      />

      {/* single round yellow body */}
      <ellipse cx="100" cy="108" rx="56" ry="62" fill="#ffc800" />

      {/* two thick black horizontal stripes */}
      <g clipPath={`url(#${bodyClip})`}>
        <rect x="42" y="114" width="116" height="20" fill="#1a1a1a" />
        <rect x="42" y="144" width="116" height="20" fill="#1a1a1a" />
      </g>

      {/* cute face — simple eyes + smile + soft blush */}
      <circle cx="80" cy="88" r="6.5" fill="#1a1a1a" />
      <circle cx="120" cy="88" r="6.5" fill="#1a1a1a" />
      <path
        d="M86 104c5.5 9 22.5 9 28 0"
        stroke="#1a1a1a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="64" cy="100" r="7.5" fill="#ff9aa2" opacity="0.7" />
      <circle cx="136" cy="100" r="7.5" fill="#ff9aa2" opacity="0.7" />

      {/* antennae with small round tips */}
      <path
        d="M84 52c-7-20-16-26-22-26"
        stroke="#1a1a1a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M116 52c7-20 16-26 22-26"
        stroke="#1a1a1a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="60" cy="24" r="5.5" fill="#1a1a1a" />
      <circle cx="140" cy="24" r="5.5" fill="#1a1a1a" />

      {/* tiny stinger */}
      <path d="M100 168l-5.5 11h11L100 168z" fill="#1a1a1a" />
    </svg>
  );
}

/** Compact bee for learn-path decoration. */
export function BeeMascotMini({
  className = "",
  size = 72,
}: {
  className?: string;
  size?: number;
}) {
  return <BeeMascot className={className} size={size} title="" />;
}
