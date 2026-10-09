function DotGrid() {
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden>
      {Array.from({ length: 16 }, (_, i) => (
        <circle
          key={i}
          cx={(i % 4) * 20 + 8}
          cy={Math.floor(i / 4) * 20 + 8}
          r="3.4"
          fill="#FFC93C"
        />
      ))}
    </svg>
  );
}

export function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg
        className="absolute bottom-0 left-0 h-44 w-[70%] sm:h-64 sm:w-[48%]"
        viewBox="0 0 460 240"
        preserveAspectRatio="none"
      >
        <path
          fill="#FFF3C4"
          d="M0 240V150C30 118 70 168 130 150C200 128 180 70 110 92C50 110 20 78 0 96V240Z"
        />
      </svg>
      <svg
        className="absolute bottom-0 right-0 h-44 w-[70%] sm:h-64 sm:w-[48%]"
        viewBox="0 0 460 240"
        preserveAspectRatio="none"
      >
        <path
          fill="#FFF3C4"
          d="M460 240V150C430 118 390 168 330 150C260 128 280 70 350 92C410 110 440 78 460 96V240Z"
        />
      </svg>
      <div className="absolute bottom-6 left-4 scale-75 opacity-95 sm:bottom-14 sm:left-14 sm:scale-100">
        <DotGrid />
      </div>
      <div className="absolute bottom-6 right-4 scale-75 opacity-95 sm:bottom-14 sm:right-14 sm:scale-100">
        <DotGrid />
      </div>
    </div>
  );
}
