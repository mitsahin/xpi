import { useEffect, useState } from "react";
import { api, type QuestionType } from "../lib/api";
import { BottomNav } from "../components/BottomNav";
import { TopStats } from "../components/TopStats";

type Review = {
  cardId: string;
  prompt: string;
  type: QuestionType;
  options?: string[] | null;
  hint?: string | null;
};

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    api
      .reviews()
      .then((r) => setReviews(r.reviews))
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
  }, []);

  const current = reviews[0];

  async function submit(value?: string) {
    if (!current || busy) return;
    const payload = value ?? answer;
    if (!String(payload).trim()) return;
    setBusy(true);
    setMsg("");
    try {
      const result = await api.answerReview(current.cardId, { answer: payload });
      setMsg(
        result.correct
          ? `Correct! +${result.xpEarned || 0} XP`
          : `Not quite — ${Array.isArray(result.expected) ? result.expected[0] : result.expected}`
      );
      setAnswer("");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full bg-white pb-24">
      <TopStats />
      <main className="mx-auto max-w-lg px-4 py-6">
        <h1 className="text-2xl font-black">Reviews</h1>
        <p className="mt-1 font-bold text-[#777]">Due SRS cards from your lessons.</p>
        {error && <p className="mt-4 font-bold text-[#ff4b4b]">{error}</p>}
        {msg && <p className="mt-4 font-extrabold text-[#58cc02]">{msg}</p>}
        {!current ? (
          <p className="mt-10 font-extrabold text-[#777]">No reviews due. Nice work!</p>
        ) : (
          <div className="mt-8">
            <p className="text-sm font-extrabold uppercase text-[#afafaf]">{current.type}</p>
            <h2 className="mt-2 text-2xl font-black">{current.prompt}</h2>
            {current.hint && (
              <p className="mt-2 text-sm font-bold text-[#1cb0f6]">Hint: {current.hint}</p>
            )}
            {current.type === "MCQ" && current.options ? (
              <div className="mt-6 grid gap-3">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    disabled={busy}
                    onClick={() => submit(opt)}
                    className="rounded-2xl border-2 border-b-4 border-[#e5e5e5] px-4 py-4 text-left font-extrabold"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                <input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[#e5e5e5] px-4 py-4 text-xl font-extrabold outline-none focus:border-[#1cb0f6]"
                  placeholder="Your answer"
                />
                <button
                  disabled={!answer.trim() || busy}
                  onClick={submit}
                  className="w-full rounded-2xl bg-[#58cc02] py-4 font-black uppercase text-white shadow-[0_4px_0_#46a302] disabled:opacity-50"
                >
                  Check
                </button>
              </div>
            )}
            <p className="mt-4 text-sm font-bold text-[#777]">
              {reviews.length} card{reviews.length === 1 ? "" : "s"} remaining
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
