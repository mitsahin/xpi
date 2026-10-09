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
 * Soft Walky Talky bee from the bee-home-2 splash:
 * round yellow body with a top highlight, three thick black stripes,
 * blush, light-blue wings, yellow antenna tips, white eye highlights.
 */
export function BeeMascot({
  className = "",
  size = 200,
  title = "Walky Talky bee",
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
  const gradId = `bee-grad-${clipId}`;
  const leftRot = -16 - wingPhase;
  const rightRot = 16 + wingPhase;

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
        <radialGradient id={gradId} cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fff4b0" />
          <stop offset="46%" stopColor="#fed432" />
          <stop offset="100%" stopColor="#f0bc20" />
        </radialGradient>
        <clipPath id={bodyClip}>
          <circle cx="100" cy="108" r="56" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="184" rx="32" ry="6" fill="#1a1a1a" opacity="0.08" />

      <g transform={`rotate(${leftRot} 72 102)`}>
        <ellipse cx="40" cy="88" rx="34" ry="22" fill="#d4f1fa" fillOpacity="0.95" />
        <ellipse cx="52" cy="108" rx="28" ry="16" fill="#c9ebf6" fillOpacity="0.8" />
      </g>
      <g transform={`rotate(${rightRot} 128 102)`}>
        <ellipse cx="160" cy="88" rx="34" ry="22" fill="#d4f1fa" fillOpacity="0.95" />
        <ellipse cx="148" cy="108" rx="28" ry="16" fill="#c9ebf6" fillOpacity="0.8" />
      </g>

      <circle cx="100" cy="108" r="56" fill={`url(#${gradId})`} />
      <ellipse cx="84" cy="82" rx="16" ry="10" fill="#fff" opacity="0.32" />

      <g clipPath={`url(#${bodyClip})`}>
        <rect x="42" y="116" width="116" height="12" fill="#1c1c1a" />
        <rect x="42" y="134" width="116" height="12" fill="#1c1c1a" />
        <rect x="42" y="152" width="116" height="12" fill="#1c1c1a" />
      </g>

      <ellipse cx="84" cy="96" rx="6.6" ry="8.2" fill="#1c1c1a" />
      <ellipse cx="116" cy="96" rx="6.6" ry="8.2" fill="#1c1c1a" />
      <circle cx="81.6" cy="93" r="2.2" fill="#fff" />
      <circle cx="113.6" cy="93" r="2.2" fill="#fff" />

      <path
        d="M90 110c3.5 6.5 16.5 6.5 20 0"
        stroke="#1c1c1a"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <ellipse cx="66" cy="106" rx="7" ry="5.2" fill="#fa8e8c" opacity="0.9" />
      <ellipse cx="134" cy="106" rx="7" ry="5.2" fill="#fa8e8c" opacity="0.9" />

      <path
        d="M88 58c-3-14-10-22-16-24"
        stroke="#1c1c1a"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M112 58c3-14 10-22 16-24"
        stroke="#1c1c1a"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="70" cy="32" r="5.6" fill="#fed432" />
      <circle cx="130" cy="32" r="5.6" fill="#fed432" />

      <path
        d="M58 132c-10 8-16 16-14 24"
        stroke="#1c1c1a"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M66 148c-8 8-10 16-6 20"
        stroke="#1c1c1a"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M142 132c10 8 16 16 14 24"
        stroke="#1c1c1a"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M134 148c8 8 10 16 6 20"
        stroke="#1c1c1a"
        strokeWidth="3.2"
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
