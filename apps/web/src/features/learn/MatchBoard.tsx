import { useMemo, useState } from "react";

type Props = {
  left: string[];
  right: string[];
  disabled?: boolean;
  onSubmit: (pairs: Record<string, string>) => void;
};

/** Simple tap-to-pair matcher for MATCH questions. */
export function MatchBoard({ left, right, disabled, onSubmit }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});

  const usedRight = useMemo(() => new Set(Object.values(pairs)), [pairs]);
  const complete = left.every((l) => pairs[l]);

  function pickLeft(item: string) {
    if (disabled || pairs[item]) return;
    setSelectedLeft(item);
  }

  function pickRight(item: string) {
    if (disabled || !selectedLeft || usedRight.has(item)) return;
    const next = { ...pairs, [selectedLeft]: item };
    setPairs(next);
    setSelectedLeft(null);
  }

  function reset() {
    setPairs({});
    setSelectedLeft(null);
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {left.map((item) => (
            <button
              key={item}
              type="button"
              disabled={disabled || !!pairs[item]}
              onClick={() => pickLeft(item)}
              className={`w-full rounded-2xl border-2 border-b-4 px-3 py-3 text-left font-extrabold ${
                selectedLeft === item
                  ? "border-[#1cb0f6] bg-[#ddf4ff]"
                  : pairs[item]
                    ? "border-[#58cc02] bg-[#d7ffb8] opacity-80"
                    : "border-[#e5e5e5]"
              }`}
            >
              {item}
              {pairs[item] ? (
                <span className="mt-1 block text-xs font-bold text-[#777]">
                  → {pairs[item]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((item) => (
            <button
              key={item}
              type="button"
              disabled={disabled || usedRight.has(item)}
              onClick={() => pickRight(item)}
              className={`w-full rounded-2xl border-2 border-b-4 px-3 py-3 text-left font-extrabold ${
                usedRight.has(item)
                  ? "border-[#e5e5e5] bg-[#f7f7f7] opacity-50"
                  : "border-[#e5e5e5]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="flex-1 rounded-2xl border-2 border-[#e5e5e5] py-3 font-black uppercase text-[#777]"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={!complete}
            onClick={() => onSubmit(pairs)}
            className="flex-1 rounded-2xl bg-[#58cc02] py-3 font-black uppercase text-white shadow-[0_4px_0_#46a302] disabled:opacity-50"
          >
            Check
          </button>
        </div>
      )}
    </div>
  );
}
