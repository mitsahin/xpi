import { useId } from "react";

const ARC_DOTS = Array.from({ length: 7 }, (_, i) => {
  const t = ((130 + i * 16) * Math.PI) / 180;
  return {
    cx: +(158 + Math.cos(t) * 58).toFixed(2),
    cy: +(128 + Math.sin(t) * 58).toFixed(2),
    r: 3.6,
  };
});

function BeeShapes({ uid }: { uid: string }) {
  const clip = `${uid}-body`;
  const grad = `${uid}-grad`;
  const blur = `${uid}-blur`;

  return (
    <>
      <defs>
        <radialGradient id={grad} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#FFE78A" />
          <stop offset="58%" stopColor="#FFC93C" />
          <stop offset="100%" stopColor="#F0B429" />
        </radialGradient>
        <clipPath id={clip}>
          <ellipse cx="230" cy="148" rx="54" ry="42" />
        </clipPath>
        <filter id={blur} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>

      <ellipse
        cx="230"
        cy="196"
        rx="46"
        ry="9"
        fill="#0F1F3D"
        opacity="0.12"
        filter={`url(#${blur})`}
      />

      <ellipse
        cx="176"
        cy="128"
        rx="34"
        ry="21"
        fill="#D7F2FB"
        transform="rotate(-26 176 128)"
      />
      <ellipse
        cx="284"
        cy="128"
        rx="34"
        ry="21"
        fill="#D7F2FB"
        transform="rotate(26 284 128)"
      />
      <ellipse
        cx="170"
        cy="126"
        rx="20"
        ry="12"
        fill="#EEF9FD"
        opacity="0.85"
        transform="rotate(-26 170 126)"
      />
      <ellipse
        cx="290"
        cy="126"
        rx="20"
        ry="12"
        fill="#EEF9FD"
        opacity="0.85"
        transform="rotate(26 290 126)"
      />

      <ellipse cx="230" cy="148" rx="54" ry="42" fill={`url(#${grad})`} />
      <g clipPath={`url(#${clip})`}>
        <rect x="172" y="136" width="116" height="14" rx="3" fill="#1A1A1A" />
        <rect x="172" y="158" width="116" height="14" rx="3" fill="#1A1A1A" />
      </g>
      <circle cx="230" cy="104" r="38" fill={`url(#${grad})`} />
      <ellipse cx="216" cy="90" rx="14" ry="8" fill="#fff" opacity="0.38" />

      <ellipse cx="216" cy="102" rx="5.2" ry="6.6" fill="#1C1C1C" />
      <ellipse cx="244" cy="102" rx="5.2" ry="6.6" fill="#1C1C1C" />
      <circle cx="214.2" cy="99.4" r="1.7" fill="#fff" />
      <circle cx="242.2" cy="99.4" r="1.7" fill="#fff" />

      <circle cx="198" cy="114" r="6.5" fill="#FFB4C2" />
      <circle cx="262" cy="114" r="6.5" fill="#FFB4C2" />

      <path
        d="M218 116 Q230 126 242 116"
        stroke="#1C1C1C"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M210 74 Q192 46 176 58"
        stroke="#1C1C1C"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M250 74 Q268 46 284 58"
        stroke="#1C1C1C"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="174" cy="56" r="5" fill="#FFC93C" stroke="#1C1C1C" strokeWidth="2" />
      <circle cx="286" cy="56" r="5" fill="#FFC93C" stroke="#1C1C1C" strokeWidth="2" />

      <path
        d="M180 150 Q162 164 170 176"
        stroke="#1C1C1C"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M280 150 Q298 164 290 176"
        stroke="#1C1C1C"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="210" cy="186" rx="6" ry="4.2" fill="#1C1C1C" />
      <ellipse cx="230" cy="190" rx="6" ry="4.2" fill="#1C1C1C" />
      <ellipse cx="250" cy="186" rx="6" ry="4.2" fill="#1C1C1C" />
    </>
  );
}

export function Mascot({ variant = "hero" }: { variant?: "hero" | "logo" }) {
  const uid = useId().replace(/:/g, "");

  if (variant === "logo") {
    return (
      <svg
      width="46"
      height="44"
      viewBox="158 46 148 156"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <BeeShapes uid={uid} />
      </svg>
    );
  }

  return (
    <svg
      className="h-auto w-[min(100%,320px)] sm:w-[460px]"
      viewBox="60 28 360 198"
      fill="none"
      role="img"
      aria-label="walky talky arı maskotu"
    >
      <title>walky talky arı maskotu</title>
      {ARC_DOTS.map((dot) => (
        <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#FFC93C" />
      ))}
      <circle cx="78" cy="188" r="11" stroke="#F3D56A" strokeWidth="2.5" />
      <circle cx="400" cy="108" r="12" stroke="#F6D56A" strokeWidth="2.5" />
      <circle cx="368" cy="58" r="6" fill="#FFC93C" />
      <circle cx="412" cy="78" r="3.6" fill="#FFC93C" />
      <circle cx="196" cy="42" r="4" fill="#FFC93C" />
      <g className="mascot-float">
        <BeeShapes uid={`${uid}-hero`} />
      </g>
    </svg>
  );
}
