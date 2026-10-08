import type { QuestionType } from "../../lib/api";

export function questionTypeLabel(type: QuestionType | undefined): string {
  switch (type) {
    case "MCQ":
      return "Multiple choice";
    case "FILL_BLANK":
      return "Fill in the blank";
    case "TRANSLATE":
      return "Translate";
    case "LISTEN":
      return "Listen";
    case "MATCH":
      return "Match pairs";
    default:
      return "Question";
  }
}

export function speakText(text: string, locale = "es-ES") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}
