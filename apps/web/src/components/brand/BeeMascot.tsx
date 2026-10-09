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
 * Original x-pi bee mascot — flat Duolingo-like yellow/black buddy.
 * Matches bee-home-2 concept: round body, two thick stripes, simple smile,
 * blush cheeks, antennae with yellow ball tips, soft translucent light-blue wings.
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
  const leftRot = -30 - wingPhase;
  const rightRot = 30 + wingPhase;
  const leftFrontRot = -12 - wingPhase * 0.7;
  const rightFrontRot = 12 + wingPhase * 0.7;

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

      <ellipse cx="100" cy="188" rx="42" ry="7" fill="#00000014" />

      <ellipse
        cx="44"
        cy="90"
        rx="40"
        ry="28"
        fill="#a8e0ff"
        fillOpacity="0.48"
        transform={`rotate(${leftRot} 44 90)`}
      />
      <ellipse
        cx="156"
        cy="90"
        rx="40"
        ry="28"
        fill="#a8e0ff"
        fillOpacity="0.48"
        transform={`rotate(${rightRot} 156 90)`}
      />
      <ellipse
        cx="50"
        cy="112"
        rx="34"
        ry="24"
        fill="#c4eeff"
        fillOpacity="0.58"
        transform={`rotate(${leftFrontRot} 50 112)`}
      />
      <ellipse
        cx="150"
        cy="112"
        rx="34"
        ry="24"
        fill="#c4eeff"
        fillOpacity="0.58"
        transform={`rotate(${rightFrontRot} 150 112)`}
      />

      <ellipse cx="100" cy="106" rx="58" ry="64" fill="#ffc800" />

      <g clipPath={`url(#${bodyClip})`}>
        <rect x="40" y="112" width="120" height="22" fill="#1a1a1a" />
        <rect x="40" y="144" width="120" height="22" fill="#1a1a1a" />
      </g>

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
      <circle
        cx="56"
        cy="20"
        r="6.5"
        fill="#ffc800"
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      <circle
        cx="144"
        cy="20"
        r="6.5"
        fill="#ffc800"
        stroke="#1a1a1a"
        strokeWidth="2"
      />

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
