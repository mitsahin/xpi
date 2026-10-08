import type { QuestionPayload } from "@x-pi/shared";
import type { Prisma } from "@prisma/client";

type QuestionRow = {
  id: string;
  type: QuestionPayload["type"];
  prompt: string;
  optionsJson: Prisma.JsonValue;
  hint: string | null;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Map DB question row → client payload (no answers leaked). */
export function toQuestionPayload(q: QuestionRow): QuestionPayload {
  const raw = q.optionsJson as Record<string, unknown> | string[] | null;

  if (q.type === "MATCH" && raw && !Array.isArray(raw)) {
    const left = Array.isArray(raw.left) ? (raw.left as string[]) : [];
    const right = Array.isArray(raw.right) ? (raw.right as string[]) : [];
    return {
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      pairs: { left, right: shuffle(right) },
      hint: q.hint,
    };
  }

  if (q.type === "LISTEN" && raw && !Array.isArray(raw)) {
    return {
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      speakText: typeof raw.speakText === "string" ? raw.speakText : q.prompt,
      locale: typeof raw.locale === "string" ? raw.locale : "es-ES",
      hint: q.hint,
    };
  }

  return {
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: Array.isArray(raw) ? (raw as string[]) : null,
    hint: q.hint,
  };
}

export { shuffle };
