import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type LessonSessionState } from "../lib/api";
import { useAppStore } from "../store";

export function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);
  const setStreak = useAppStore((s) => s.setStreak);
  const [session, setSession] = useState<LessonSessionState | null>(null);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [expected, setExpected] = useState<string>("");
  const [done, setDone] = useState<{
    xpEarned: number;
    leveledUp?: boolean;
    newLevel?: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [nextSession, setNextSession] = useState<LessonSessionState | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!lessonId) return;
    api
      .startLesson(lessonId)
      .then((r) => {
        setSession(r.session);
        startedAt.current = Date.now();
      })
      .catch((e) => setError(e.message));
  }, [lessonId]);

  async function submit(answer: string) {
    if (!session?.question || busy || feedback) return;
    setBusy(true);
    try {
      const result = await api.answer(session.sessionId, {
        questionId: session.question.id,
        answer,
        responseMs: Date.now() - startedAt.current,
      });
      setFeedback(result.correct ? "correct" : "wrong");
      if (!result.correct && result.expected) {
        setExpected(
          Array.isArray(result.expected) ? result.expected[0] : result.expected
        );
      }
      if (result.sessionComplete) {
        setDone({
          xpEarned: result.xpEarned || 0,
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
        });
        if (result.streak) setStreak(result.streak);
        const stats = await api.stats();
        setUser(stats.user);
        setStreak(stats.streak);
      } else if (result.session) {
        setSession((prev) =>
          prev ? { ...prev, heartsRemaining: result.heartsRemaining } : prev
        );
        setNextSession(result.session);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function continueNext() {
    if (done) {
      navigate("/learn");
      return;
    }
    if (nextSession) {
      setSession(nextSession);
      setNextSession(null);
      setSelected("");
      setFeedback(null);
      setExpected("");
      startedAt.current = Date.now();
    }
  }

  function onFill(e: FormEvent) {
    e.preventDefault();
    submit(selected);
  }

  if (error) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6">
        <p className="font-bold text-[#ff4b4b]">{error}</p>
        <Link className="font-extrabold text-[#1cb0f6]" to="/learn">
          Back
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-full items-center justify-center font-extrabold text-[#777]">
        Loading lesson...
      </div>
    );
  }

  const progress =
    ((session.currentIndex + (feedback ? 1 : 0)) / Math.max(1, session.totalQuestions)) *
    100;
  const q = session.question;

  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to="/learn" className="text-2xl font-black text-[#777]">
          ×
        </Link>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-[#e5e5e5]">
          <div
            className="h-full rounded-full bg-[#58cc02] transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <div className="font-extrabold text-[#ff4b4b]">❤ {session.heartsRemaining}</div>
      </div>

      {done ? (
        <div className="animate-pop flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl font-black text-[#58cc02]">Lesson complete!</div>
          <p className="mt-3 text-xl font-extrabold">+{done.xpEarned} XP</p>
          {done.leveledUp && (
            <p className="mt-2 font-black text-[#1cb0f6]">Level up → {done.newLevel}</p>
          )}
          <button
            onClick={() => navigate("/learn")}
            className="mt-8 w-full max-w-sm rounded-2xl bg-[#58cc02] py-4 text-lg font-black uppercase text-white shadow-[0_4px_0_#46a302]"
          >
            Continue
          </button>
        </div>
      ) : (
        <>
          <div className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
            <p className="text-sm font-extrabold uppercase tracking-wide text-[#afafaf]">
              {q?.type === "MCQ" ? "Multiple choice" : "Fill in the blank"}
            </p>
            <h2 className="mt-2 text-2xl font-black leading-snug">{q?.prompt}</h2>
            {q?.hint && (
              <p className="mt-2 text-sm font-bold text-[#1cb0f6]">Hint: {q.hint}</p>
            )}

            {q?.type === "MCQ" && (
              <div className="mt-8 grid gap-3">
                {q.options?.map((opt) => (
                  <button
                    key={opt}
                    disabled={!!feedback}
                    onClick={() => {
                      setSelected(opt);
                      submit(opt);
                    }}
                    className={`rounded-2xl border-2 border-b-4 px-4 py-4 text-left text-lg font-extrabold transition ${
                      selected === opt && feedback === "correct"
                        ? "border-[#58cc02] bg-[#d7ffb8]"
                        : selected === opt && feedback === "wrong"
                          ? "border-[#ff4b4b] bg-[#ffdfe0]"
                          : "border-[#e5e5e5] hover:bg-[#f7f7f7]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q?.type === "FILL_BLANK" && (
              <form onSubmit={onFill} className="mt-8 space-y-4">
                <input
                  autoFocus
                  disabled={!!feedback}
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[#e5e5e5] px-4 py-4 text-xl font-extrabold outline-none focus:border-[#1cb0f6]"
                  placeholder="Type your answer"
                />
                {!feedback && (
                  <button
                    disabled={!selected.trim() || busy}
                    className="w-full rounded-2xl bg-[#58cc02] py-4 text-lg font-black uppercase text-white shadow-[0_4px_0_#46a302] disabled:opacity-50"
                  >
                    Check
                  </button>
                )}
              </form>
            )}
          </div>

          {feedback && (
            <div
              className={`animate-pop border-t-2 px-4 py-5 ${
                feedback === "correct"
                  ? "border-[#58cc02] bg-[#d7ffb8]"
                  : "border-[#ff4b4b] bg-[#ffdfe0]"
              }`}
            >
              <div className="mx-auto max-w-lg">
                <p className="text-xl font-black">
                  {feedback === "correct" ? "Nice!" : `Correct answer: ${expected}`}
                </p>
                <button
                  onClick={continueNext}
                  className={`mt-3 w-full rounded-2xl py-4 text-lg font-black uppercase text-white ${
                    feedback === "correct"
                      ? "bg-[#58cc02] shadow-[0_4px_0_#46a302]"
                      : "bg-[#ff4b4b] shadow-[0_4px_0_#ea2b2b]"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
