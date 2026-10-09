import { useId } from "react";

/**
 * Original x-pi bee mascot — flat Duolingo-like yellow/black buddy.
 * Matches bee-home-2 concept: round body, two thick stripes, simple smile,
 * blush cheeks, antennae with ball tips, soft translucent light-blue wings.
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
          <ellipse cx="100" cy="106" rx="58" ry="64" />
        </clipPath>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="100" cy="188" rx="42" ry="7" fill="#00000014" />

      {/* four soft translucent light-blue wings (behind body) */}
      <ellipse
        cx="44"
        cy="90"
        rx="40"
        ry="28"
        fill="#a8e0ff"
        fillOpacity="0.48"
        transform="rotate(-30 44 90)"
      />
      <ellipse
        cx="156"
        cy="90"
        rx="40"
        ry="28"
        fill="#a8e0ff"
        fillOpacity="0.48"
        transform="rotate(30 156 90)"
      />
      <ellipse
        cx="50"
        cy="112"
        rx="34"
        ry="24"
        fill="#c4eeff"
        fillOpacity="0.58"
        transform="rotate(-12 50 112)"
      />
      <ellipse
        cx="150"
        cy="112"
        rx="34"
        ry="24"
        fill="#c4eeff"
        fillOpacity="0.58"
        transform="rotate(12 150 112)"
      />

      {/* single round yellow body */}
      <ellipse cx="100" cy="106" rx="58" ry="64" fill="#ffc800" />

      {/* two thick black horizontal stripes */}
      <g clipPath={`url(#${bodyClip})`}>
        <rect x="40" y="112" width="120" height="22" fill="#1a1a1a" />
        <rect x="40" y="144" width="120" height="22" fill="#1a1a1a" />
      </g>

      {/* cute face — oval eyes, smile, soft pink blush */}
      <ellipse cx="78" cy="84" rx="6" ry="7.5" fill="#1a1a1a" />
      <ellipse cx="122" cy="84" rx="6" ry="7.5" fill="#1a1a1a" />
      <path
        d="M86 100c5 8 23 8 28 0"
        stroke="#1a1a1a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <ellipse cx="62" cy="96" rx="9" ry="6.5" fill="#ff8fa3" opacity="0.85" />
      <ellipse cx="138" cy="96" rx="9" ry="6.5" fill="#ff8fa3" opacity="0.85" />

      {/* antennae with small round tips */}
      <path
        d="M82 48c-8-20-18-26-24-26"
        stroke="#1a1a1a"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M118 48c8-20 18-26 24-26"
        stroke="#1a1a1a"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <circle cx="56" cy="20" r="6" fill="#1a1a1a" />
      <circle cx="144" cy="20" r="6" fill="#1a1a1a" />

      {/* tiny rounded feet (bee-home-2) */}
      <ellipse cx="78" cy="168" rx="6" ry="4.5" fill="#1a1a1a" />
      <ellipse cx="92" cy="170" rx="5.5" ry="4" fill="#1a1a1a" />
      <ellipse cx="108" cy="170" rx="5.5" ry="4" fill="#1a1a1a" />
      <ellipse cx="122" cy="168" rx="6" ry="4.5" fill="#1a1a1a" />
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
