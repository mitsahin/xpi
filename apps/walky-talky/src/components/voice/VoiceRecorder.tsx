import { useCallback, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "../ui/Button";

type Props = {
  compact?: boolean;
  onRecorded?: () => void;
};

export function VoiceRecorder({ compact, onRecorded }: Props) {
  const [recording, setRecording] = useState(false);
  const [hasClip, setHasClip] = useState(false);

  const toggle = useCallback(() => {
    if (recording) {
      setRecording(false);
      setHasClip(true);
      onRecorded?.();
      return;
    }
    setRecording(true);
    setHasClip(false);
  }, [recording, onRecorded]);

  return (
    <div
      className={`flex flex-col items-center gap-4 ${compact ? "" : "rounded-3xl border border-emerald-100 bg-wt-card p-6 shadow-sm"}`}
    >
      {!compact && (
        <p className="text-center text-sm text-wt-muted">
          Mikrofon simülasyonu — gerçek kayıt gerekmez. Basılı tut ve konuş!
        </p>
      )}

      <div className="flex h-16 items-end justify-center gap-1.5">
        {(recording ? [1, 2, 3, 4, 5] : hasClip ? [0.6, 0.8, 0.5, 0.7, 0.4] : [0.3, 0.3, 0.3, 0.3, 0.3]).map(
          (h, i) => (
            <div
              key={i}
              className={`w-2 rounded-full bg-wt-primary ${recording ? "wt-wave-bar" : ""}`}
              style={{ height: `${typeof h === "number" ? h * 48 : 48}px`, opacity: recording || hasClip ? 1 : 0.35 }}
            />
          ),
        )}
      </div>

      <Button
        variant={recording ? "danger" : "secondary"}
        onMouseDown={() => !recording && setRecording(true)}
        onMouseUp={() => recording && toggle()}
        onMouseLeave={() => recording && toggle()}
        onTouchStart={(e) => {
          e.preventDefault();
          if (!recording) setRecording(true);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          if (recording) toggle();
        }}
        onClick={toggle}
        aria-pressed={recording}
      >
        {recording ? (
          <>
            <Square className="h-5 w-5" aria-hidden /> Bırak
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" aria-hidden /> Bas Konuş
          </>
        )}
      </Button>

      {hasClip && !recording && (
        <p className="text-sm font-semibold text-wt-primary">Frekans kaydedildi! (+5 XP)</p>
      )}
    </div>
  );
}
