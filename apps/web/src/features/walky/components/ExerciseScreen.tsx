import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Volume2, X } from "lucide-react";
import { exercisesForSkill, SKILLS } from "../data";
import { awardXp, completeSkill } from "../store";

type Props = {
  skillId: string;
};

export function ExerciseScreen({ skillId }: Props) {
  const navigate = useNavigate();
  const exercises = useMemo(() => exercisesForSkill(skillId), [skillId]);
  const skill = SKILLS.find((s) => s.id === skillId);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  if (!skill || exercises.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-extrabold text-[#143528]">Bu ders bulunamadı.</p>
        <Link to="/app" className="mt-4 inline-block text-[#2BB673] font-bold underline">
          Yola dön
        </Link>
      </div>
    );
  }

  const ex = exercises[index];
  const progress = ((index + (checked ? 1 : 0)) / exercises.length) * 100;
  const isCorrect = selected === ex.correctIndex;
  const done = index >= exercises.length - 1 && checked;

  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(ex.audioLabel);
    u.lang = "en-US";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  function onCheck() {
    if (selected == null || checked) return;
    setChecked(true);
    if (selected === ex.correctIndex) {
      setCorrectCount((c) => c + 1);
      awardXp(10);
    }
  }

  function onContinue() {
    if (!checked) return;
    if (index < exercises.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    const xpBonus = correctCount + (isCorrect ? 1 : 0) >= exercises.length ? 25 : 15;
    completeSkill(skillId, xpBonus);
    navigate("/app", { replace: false });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-xl flex-col px-4 pb-6 pt-4 md:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/app"
          className="rounded-full p-2 text-[#5a7a68] transition-transform hover:scale-105 hover:bg-white"
          aria-label="Kapat"
        >
          <X className="size-6" />
        </Link>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-[#d8ebe0]">
          <motion.div
            className="h-full rounded-full bg-[#2BB673]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <p className="text-sm font-bold uppercase tracking-wide text-[#5a7a68]">
        {skill.title}
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-walky)] text-2xl font-extrabold text-[#143528] md:text-3xl">
        {ex.promptTr}
      </h1>

      <button
        type="button"
        onClick={speak}
        className="mt-6 inline-flex w-fit items-center gap-2 rounded-[22px] border-2 border-[#2BB673] bg-white px-5 py-3 text-base font-extrabold text-[#0F8A4B] shadow-[0_4px_0_#b8e0c8] transition-transform hover:scale-105 active:translate-y-0.5"
      >
        <Volume2 className="size-5" />
        Telsizden Dinle
      </button>

      <div className="mt-8 grid gap-3">
        {ex.options.map((opt, i) => {
          let style =
            "border-[#d8ebe0] bg-white hover:scale-[1.02] hover:border-[#2BB673]";
          if (checked) {
            if (i === ex.correctIndex)
              style = "border-[#2BB673] bg-[#E8FFF2] text-[#0F8A4B]";
            else if (i === selected)
              style = "border-[#ff4b4b] bg-[#ffe5e5] text-[#b91c1c]";
            else style = "border-[#e5ebe7] bg-[#f7f9f8] opacity-60";
          } else if (selected === i) {
            style = "border-[#1CB0F6] bg-[#E8F4FF] scale-[1.02]";
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={checked}
              onClick={() => setSelected(i)}
              className={`rounded-[22px] border-2 px-4 py-4 text-left text-base font-extrabold text-[#143528] shadow-[0_3px_0_rgba(20,53,40,0.06)] transition-transform ${style}`}
            >
              <span className="mr-3 inline-flex size-7 items-center justify-center rounded-full bg-[#f0f5f2] text-sm text-[#5a7a68]">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-3 flex items-center gap-2 rounded-[20px] px-4 py-3 text-sm font-extrabold ${
                isCorrect
                  ? "bg-[#E8FFF2] text-[#0F8A4B]"
                  : "bg-[#ffe5e5] text-[#b91c1c]"
              }`}
            >
              {isCorrect ? (
                <>
                  <Check className="size-5" /> Doğru! +10 XP
                </>
              ) : (
                <>
                  <X className="size-5" /> Yanlış — doğru: {ex.options[ex.correctIndex]}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!checked ? (
          <button
            type="button"
            disabled={selected == null}
            onClick={onCheck}
            className="w-full rounded-[22px] bg-[#2BB673] py-4 text-lg font-extrabold text-white shadow-[0_5px_0_#0F8A4B] transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:bg-[#b8cfc2] disabled:shadow-none"
          >
            Kontrol Et
          </button>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-[22px] bg-[#FFB020] py-4 text-lg font-extrabold text-[#143528] shadow-[0_5px_0_#d4920a] transition-transform hover:scale-105"
          >
            {done ? "Yola Dön (+XP)" : "Devam"}
          </button>
        )}
      </div>
    </div>
  );
}
