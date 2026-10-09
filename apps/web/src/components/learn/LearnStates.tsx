/** Shared empty / error / loading chrome for LessonShell routes. */

export function LearnLoading({ label = "Loading path..." }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16"
      role="status"
      aria-live="polite"
    >
      <div className="learn-path-pulse h-14 w-14 rounded-full border-4 border-[#58cc02] bg-[#d7ffb8]" />
      <p className="font-extrabold text-[#777]">{label}</p>
    </div>
  );
}

export function LearnEmptyState({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <div className="mt-10 rounded-3xl border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] px-6 py-10 text-center">
      <p className="text-xl font-black text-[#3c3c3c]">{title}</p>
      {detail ? <p className="mt-2 font-bold text-[#777]">{detail}</p> : null}
    </div>
  );
}

export function LearnErrorState({
  message,
  offline,
  onRetry,
}: {
  message: string;
  offline?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className={`mt-4 rounded-2xl border-2 px-4 py-3 font-bold ${
        offline
          ? "border-[#ffb02e] bg-[#fff4ce] text-[#915f10]"
          : "border-[#ff4b4b] bg-[#fff0f0] text-[#ff4b4b]"
      }`}
    >
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="mt-2 underline" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}
