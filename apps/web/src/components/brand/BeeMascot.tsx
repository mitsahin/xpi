import {
  useId,
  useState,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

/**
 * Original x-pi bee mascot — flat chibi matching bee-home-2 reference:
 * round yellow body, THREE thick black stripes, tiny black legs,
 * small translucent light-blue wings, black antennae with yellow tips,
 * simple black dot eyes + curved smile.
 */
export function BeeMascot({
  className = "",
  size = 200,
  title = "x-pi bee",
  wingPhase = 0,
}: {
  className?: string;
  size?: number;
  title?: string;
  /** Wing flap angle offset in degrees. */
  wingPhase?: number;
}) {
  const clipId = useId().replace(/:/g, "");
  const bodyClip = `bee-body-${clipId}`;
  const leftRot = -28 - wingPhase;
  const rightRot = 28 + wingPhase;

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
          <circle cx="100" cy="108" r="62" />
        </clipPath>
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="100" cy="186" rx="38" ry="6.5" fill="#00000014" />

      {/* small translucent light-blue wings (paired, overlapping) */}
      <ellipse
        cx="46"
        cy="96"
        rx="26"
        ry="17"
        fill="#b8e8ff"
        fillOpacity="0.5"
        transform={`rotate(${leftRot} 46 96)`}
      />
      <ellipse
        cx="52"
        cy="108"
        rx="22"
        ry="14"
        fill="#c8f0ff"
        fillOpacity="0.58"
        transform={`rotate(${leftRot + 8} 52 108)`}
      />
      <ellipse
        cx="154"
        cy="96"
        rx="26"
        ry="17"
        fill="#b8e8ff"
        fillOpacity="0.5"
        transform={`rotate(${rightRot} 154 96)`}
      />
      <ellipse
        cx="148"
        cy="108"
        rx="22"
        ry="14"
        fill="#c8f0ff"
        fillOpacity="0.58"
        transform={`rotate(${rightRot - 8} 148 108)`}
      />

      {/* round yellow body */}
      <circle cx="100" cy="108" r="62" fill="#ffc800" />

      {/* THREE thick black horizontal stripes */}
      <g clipPath={`url(#${bodyClip})`}>
        <rect x="36" y="106" width="128" height="15" fill="#1a1a1a" />
        <rect x="36" y="128" width="128" height="15" fill="#1a1a1a" />
        <rect x="36" y="150" width="128" height="15" fill="#1a1a1a" />
      </g>

      {/* simple black dot eyes */}
      <circle cx="80" cy="86" r="5.2" fill="#1a1a1a" />
      <circle cx="120" cy="86" r="5.2" fill="#1a1a1a" />

      {/* curved smile */}
      <path
        d="M88 100c4 6.5 20 6.5 24 0"
        stroke="#1a1a1a"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* soft blush */}
      <circle cx="68" cy="98" r="6.5" fill="#ff9aab" opacity="0.72" />
      <circle cx="132" cy="98" r="6.5" fill="#ff9aab" opacity="0.72" />

      {/* black antennae with YELLOW circular tips */}
      <path
        d="M84 52c-6-16-14-22-20-22"
        stroke="#1a1a1a"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M116 52c6-16 14-22 20-22"
        stroke="#1a1a1a"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <circle cx="62" cy="28" r="6.5" fill="#ffc800" />
      <circle cx="138" cy="28" r="6.5" fill="#ffc800" />

      {/* tiny black legs (nub-like) */}
      <ellipse cx="78" cy="174" rx="3.2" ry="5" fill="#1a1a1a" />
      <ellipse cx="92" cy="176" rx="3" ry="4.5" fill="#1a1a1a" />
      <ellipse cx="108" cy="176" rx="3" ry="4.5" fill="#1a1a1a" />
      <ellipse cx="122" cy="174" rx="3.2" ry="5" fill="#1a1a1a" />
    </svg>
  );
}

/** Compact bee-head mark for top-left logo (not full body). */
export function BeeLogoMark({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <circle cx="20" cy="24" r="12" fill="#ffc800" />
      <path
        d="M14 14c-3-8-6-10-9-10"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M26 14c3-8 6-10 9-10"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="5" cy="4" r="3.2" fill="#ffc800" />
      <circle cx="35" cy="4" r="3.2" fill="#ffc800" />
      <circle cx="16" cy="22" r="2.2" fill="#1a1a1a" />
      <circle cx="24" cy="22" r="2.2" fill="#1a1a1a" />
      <path
        d="M17 27c1.5 2.5 4.5 2.5 6 0"
        stroke="#1a1a1a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
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

/**
 * Interactive hero bee — wing flap on click/tap, hover (desktop), and keyboard.
 * Accessible as a button; respects prefers-reduced-motion.
 */
export function InteractiveBeeMascot({
  size = 220,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [wingPhase, setWingPhase] = useState(0);
  const [bobbing, setBobbing] = useState(false);
  const hoverStop = useRef<ReturnType<typeof animate> | null>(null);
  const flapStop = useRef<ReturnType<typeof animate> | null>(null);
  const hovering = useRef(false);

  useEffect(() => {
    return () => {
      hoverStop.current?.stop();
      flapStop.current?.stop();
    };
  }, []);

  const startHoverFlap = useCallback(() => {
    if (reduceMotion) return;
    hoverStop.current?.stop();
    hoverStop.current = animate(0, 1, {
      duration: 0.7,
      repeat: Infinity,
      ease: "easeInOut",
      onUpdate: (t) => {
        if (!hovering.current) return;
        setWingPhase(Math.sin(t * Math.PI * 2) * 14);
      },
    });
  }, [reduceMotion]);

  const stopHoverFlap = useCallback(() => {
    hoverStop.current?.stop();
    hoverStop.current = null;
    if (!flapStop.current) setWingPhase(0);
  }, []);

  const triggerFlap = useCallback(() => {
    if (reduceMotion) return;
    hoverStop.current?.stop();
    flapStop.current?.stop();
    setBobbing(true);
    flapStop.current = animate(0, 1, {
      duration: 0.5,
      ease: "easeInOut",
      onUpdate: (t) => {
        setWingPhase(Math.sin(t * Math.PI * 4) * 28);
      },
      onComplete: () => {
        flapStop.current = null;
        setWingPhase(0);
        setBobbing(false);
        if (hovering.current) startHoverFlap();
      },
    });
  }, [reduceMotion, startHoverFlap]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerFlap();
      }
    },
    [triggerFlap],
  );

  return (
    <motion.button
      type="button"
      className={`interactive-bee touch-manipulation cursor-pointer rounded-full border-0 bg-transparent p-1 outline-none focus-visible:ring-4 focus-visible:ring-[#ffc800]/55 ${className}`}
      aria-label="Arıyı hareket ettir"
      onClick={triggerFlap}
      onKeyDown={onKeyDown}
      onHoverStart={() => {
        hovering.current = true;
        if (!flapStop.current) startHoverFlap();
      }}
      onHoverEnd={() => {
        hovering.current = false;
        stopHoverFlap();
      }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      animate={
        reduceMotion || !bobbing
          ? { y: 0, rotate: 0 }
          : { y: [0, -10, 0, -6, 0], rotate: [0, -3, 3, -2, 0] }
      }
      transition={
        bobbing ? { duration: 0.5, ease: "easeInOut" } : { duration: 0.2 }
      }
    >
      <BeeMascot size={size} title="" wingPhase={wingPhase} />
    </motion.button>
  );
}
