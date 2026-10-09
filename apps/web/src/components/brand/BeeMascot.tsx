/** Original x-pi bee mascot — cute yellow/black 2D SVG (not Duo owl). */
export function BeeMascot({
  className = "",
  size = 200,
  title = "x-pi bee",
}: {
  className?: string;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* soft ground shadow */}
      <ellipse cx="100" cy="186" rx="42" ry="8" fill="#00000010" />

      {/* back wings */}
      <ellipse
        cx="52"
        cy="88"
        rx="34"
        ry="22"
        fill="#b8e4ff"
        fillOpacity="0.55"
        transform="rotate(-18 52 88)"
      />
      <ellipse
        cx="148"
        cy="88"
        rx="34"
        ry="22"
        fill="#b8e4ff"
        fillOpacity="0.55"
        transform="rotate(18 148 88)"
      />

      {/* body */}
      <ellipse cx="100" cy="112" rx="48" ry="54" fill="#ffc800" />
      {/* stripes */}
      <path
        d="M58 96h84a40 40 0 0 1-4 14H62a40 40 0 0 1-4-14z"
        fill="#1a1a1a"
      />
      <path
        d="M60 120h80a48 48 0 0 1-6 16H66a48 48 0 0 1-6-16z"
        fill="#1a1a1a"
      />
      {/* belly highlight */}
      <ellipse cx="100" cy="148" rx="22" ry="14" fill="#ffe566" opacity="0.85" />

      {/* head */}
      <circle cx="100" cy="62" r="32" fill="#ffc800" />
      {/* eyes */}
      <circle cx="88" cy="62" r="5.5" fill="#1a1a1a" />
      <circle cx="112" cy="62" r="5.5" fill="#1a1a1a" />
      <circle cx="89.5" cy="60.5" r="1.6" fill="#fff" />
      <circle cx="113.5" cy="60.5" r="1.6" fill="#fff" />
      {/* smile */}
      <path
        d="M90 74c4 6 16 6 20 0"
        stroke="#1a1a1a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* cheeks */}
      <circle cx="76" cy="72" r="5" fill="#ff8a80" opacity="0.9" />
      <circle cx="124" cy="72" r="5" fill="#ff8a80" opacity="0.9" />

      {/* antennae */}
      <path
        d="M88 38c-4-14-10-18-14-18"
        stroke="#1a1a1a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M112 38c4-14 10-18 14-18"
        stroke="#1a1a1a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="72" cy="18" r="5" fill="#1a1a1a" />
      <circle cx="128" cy="18" r="5" fill="#1a1a1a" />

      {/* front wings (slightly opaque) */}
      <ellipse
        cx="58"
        cy="96"
        rx="28"
        ry="16"
        fill="#d9f0ff"
        fillOpacity="0.75"
        transform="rotate(-12 58 96)"
      />
      <ellipse
        cx="142"
        cy="96"
        rx="28"
        ry="16"
        fill="#d9f0ff"
        fillOpacity="0.75"
        transform="rotate(12 142 96)"
      />

      {/* tiny stinger */}
      <path d="M100 164l-5 10h10l-5-10z" fill="#1a1a1a" />
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
