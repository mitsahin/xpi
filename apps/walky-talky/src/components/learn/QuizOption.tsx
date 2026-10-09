import { Check, X } from "lucide-react";

type Props = {
  text: string;
  selected: boolean;
  feedback: "none" | "correct" | "wrong";
  disabled: boolean;
  onSelect: () => void;
};

export function QuizOption({ text, selected, feedback, disabled, onSelect }: Props) {
  let border = "border-gray-200 hover:border-wt-primary/50";
  let bg = "bg-white";

  if (selected && feedback === "none") {
    border = "border-wt-primary ring-2 ring-wt-primary/30";
    bg = "bg-wt-primary-soft/40";
  }
  if (feedback === "correct") {
    border = "border-wt-success";
    bg = "bg-green-50";
  }
  if (feedback === "wrong" && selected) {
    border = "border-wt-error";
    bg = "bg-red-50";
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-4 text-left font-medium transition hover:scale-[1.02] disabled:hover:scale-100 ${border} ${bg}`}
    >
      <span>{text}</span>
      {feedback === "correct" && selected && (
        <Check className="h-6 w-6 shrink-0 text-wt-success" aria-hidden />
      )}
      {feedback === "wrong" && selected && (
        <X className="h-6 w-6 shrink-0 text-wt-error" aria-hidden />
      )}
    </button>
  );
}
