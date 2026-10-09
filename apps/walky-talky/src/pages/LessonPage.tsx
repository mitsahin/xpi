import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Headphones, ChevronRight } from "lucide-react";
import { getDefaultQuestions, PATH_NODES } from "../data/lessons";
import { ProgressBar } from "../components/ui/ProgressBar";
import { QuizOption } from "../components/learn/QuizOption";
import { Button } from "../components/ui/Button";
import { VoiceRecorder } from "../components/voice/VoiceRecorder";
import { resolveNodeStatus, useProgressStore } from "../store/progressStore";

function starsFromScore(correct: number, total: number): number {
  if (correct >= total) return 3;
  if (correct >= Math.ceil(total / 2)) return 2;
  return 1;
}

export function LessonPage() {
  const { id = "1" } = useParams();
  const navigate = useNavigate();
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const nodes = useProgressStore((s) => s.nodes);

  const status = resolveNodeStatus(id, nodes);
  const questions = useMemo(() => getDefaultQuestions(id), [id]);
  const lessonTitle = PATH_NODES.find((n) => n.id === id)?.title ?? "Ders";

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const q = questions[qIndex];
  const progress = ((qIndex + (checked ? 1 : 0)) / questions.length) * 100;

  if (status === "locked") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display text-xl font-bold">Bu frekans kilitli.</p>
        <Link to="/learn" className="mt-4 inline-block text-wt-primary">
          Yola dön
        </Link>
      </main>
    );
  }

  const handleCheck = () => {
    if (!selected || !q) return;
    setChecked(true);
    const opt = q.options.find((o) => o.id === selected);
    if (opt?.correct) setCorrectCount((c) => c + 1);
  };

  const handleContinue = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    completeLesson(id, starsFromScore(correctCount, questions.length));
    navigate("/learn", { replace: true });
  };

  const playMockAudio = () => {
    setAudioPlaying(true);
    window.setTimeout(() => setAudioPlaying(false), 1200);
  };

  if (!q) return null;

  return (
    <main className="mx-auto flex min-h-[calc(100%-4rem)] max-w-lg flex-col px-4 pb-6 pt-4">
      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold text-wt-muted">{lessonTitle}</p>
        <ProgressBar value={progress} max={100} />
      </div>

      <h1 className="font-display text-xl font-bold text-wt-ink md:text-2xl">{q.prompt}</h1>

      <button
        type="button"
        onClick={playMockAudio}
        className={`mt-6 flex w-full items-center justify-center gap-3 rounded-3xl border-2 border-dashed py-6 transition hover:scale-[1.02] ${audioPlaying ? "border-wt-accent bg-amber-50" : "border-wt-primary/40 bg-wt-primary-soft/30"}`}
      >
        <Headphones className={`h-8 w-8 text-wt-primary ${audioPlaying ? "animate-pulse" : ""}`} />
        <span className="font-display font-bold text-wt-primary-deep">
          Telsizden Dinle: «{q.audioLabel}»
        </span>
      </button>

      <div className="mt-6 flex flex-col gap-3">
        {q.options.map((opt) => {
          let feedback: "none" | "correct" | "wrong" = "none";
          if (checked) {
            if (opt.correct) feedback = "correct";
            else if (opt.id === selected) feedback = "wrong";
          }
          return (
            <QuizOption
              key={opt.id}
              text={opt.text}
              selected={selected === opt.id}
              feedback={feedback}
              disabled={checked}
              onSelect={() => !checked && setSelected(opt.id)}
            />
          );
        })}
      </div>

      <div className="mt-8">
        <VoiceRecorder compact />
      </div>

      <footer className="mt-auto pt-8">
        {!checked ? (
          <Button fullWidth disabled={!selected} onClick={handleCheck}>
            Kontrol Et
          </Button>
        ) : (
          <Button fullWidth onClick={handleContinue}>
            {qIndex < questions.length - 1 ? (
              <>
                Devam <ChevronRight className="h-5 w-5" />
              </>
            ) : (
              "Dersi Bitir"
            )}
          </Button>
        )}
      </footer>
    </main>
  );
}
