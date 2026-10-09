import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { awardXp, completeSkill } from "../store";

const BARS = 24;

export function VoiceNote() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0.15));
  const [done, setDone] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const animRef = useRef<number | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAll() {
    if (animRef.current != null) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      try {
        mediaRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    mediaRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setListening(false);
    setLevels(Array(BARS).fill(0.15));
  }

  function pulseWave() {
    const tick = () => {
      setLevels(
        Array.from({ length: BARS }, () => 0.2 + Math.random() * 0.8)
      );
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }

  async function startListening() {
    if (listening) return;
    setTranscript("");
    setDone(false);
    setListening(true);
    pulseWave();

    // MediaRecorder mock (capture if permitted; ignore failures)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (typeof MediaRecorder !== "undefined") {
        const rec = new MediaRecorder(stream);
        mediaRef.current = rec;
        rec.start();
      }
    } catch {
      /* mock continues without mic permission */
    }

    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (SR) {
      const rec = new SR();
      recognitionRef.current = rec;
      rec.lang = "en-US";
      rec.interimResults = true;
      rec.continuous = true;
      rec.onresult = (ev: SpeechRecognitionEvent) => {
        let text = "";
        for (let i = 0; i < ev.results.length; i++) {
          text += ev.results[i][0].transcript;
        }
        setTranscript(text.trim());
      };
      rec.onerror = () => {
        /* keep mock UI alive */
      };
      try {
        rec.start();
      } catch {
        /* already started */
      }
    } else {
      // Fallback mock transcript after a short delay
      window.setTimeout(() => {
        setTranscript("Hello, this is my Walky Talky practice.");
      }, 1200);
    }
  }

  function stopListening() {
    if (!listening) return;
    const finalText =
      transcript.trim() || "Hello, this is my Walky Talky practice.";
    stopAll();
    setTranscript(finalText);
    if (!done) {
      setDone(true);
      awardXp(15);
      completeSkill("radio", 20);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-xl flex-col px-4 pb-8 pt-6 md:px-6">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-walky)] text-3xl font-extrabold text-[#143528]">
          Sesli Not
        </h1>
        <p className="mt-2 text-sm font-semibold text-[#5a7a68]">
          Basılı tut — telsize konuş, dalgayı izle
        </p>
      </div>

      <div className="mt-10 flex flex-1 flex-col items-center justify-center">
        <div className="flex h-24 w-full max-w-md items-end justify-center gap-1 rounded-[24px] bg-white px-4 py-4 shadow-[0_5px_0_rgba(20,53,40,0.06)]">
          {levels.map((lvl, i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-full bg-[#2BB673] sm:w-2"
              animate={{ height: `${Math.max(8, lvl * 72)}px` }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{ opacity: 0.55 + (i % 5) * 0.08 }}
            />
          ))}
        </div>

        <button
          type="button"
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onMouseLeave={() => listening && stopListening()}
          onTouchStart={(e) => {
            e.preventDefault();
            startListening();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopListening();
          }}
          className={[
            "mt-10 flex size-28 items-center justify-center rounded-full text-white shadow-[0_8px_0_#0F8A4B] transition-transform select-none",
            listening
              ? "scale-110 bg-[#FF6B2C] shadow-[0_8px_0_#c44a14]"
              : "bg-[#2BB673] hover:scale-105",
          ].join(" ")}
          aria-pressed={listening}
          aria-label={listening ? "Bırak ve kaydı bitir" : "Bas konuş"}
        >
          {listening ? <Square className="size-10 fill-white" /> : <Mic className="size-12" />}
        </button>
        <p className="mt-4 text-lg font-extrabold text-[#143528]">
          {listening ? "Dinleniyor…" : "Bas Konuş"}
        </p>

        {(transcript || done) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 w-full rounded-[22px] border-2 border-[#d8ebe0] bg-[#E8FFF2] px-5 py-4 text-left"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#0F8A4B]">
              Transkript (mock)
            </p>
            <p className="mt-1 font-semibold text-[#143528]">
              {transcript || "…"}
            </p>
            {done && (
              <p className="mt-2 text-sm font-extrabold text-[#FF6B2C]">
                +XP kaydedildi · Telsiz Sohbeti tamamlandı
              </p>
            )}
          </motion.div>
        )}
      </div>

      <Link
        to="/app"
        className="mt-6 inline-flex justify-center rounded-[22px] border-2 border-[#d8ebe0] bg-white py-3.5 text-base font-extrabold text-[#143528] transition-transform hover:scale-105"
      >
        Yola Dön
      </Link>
    </div>
  );
}

/* Minimal Web Speech typings for browsers that expose them */
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}
