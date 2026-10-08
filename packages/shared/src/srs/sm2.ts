/**
 * Modified SM-2 spaced repetition.
 * - Quality 0–5 (we map binary correct/incorrect + confidence).
 * - Interval in days; ease factor floored at 1.3.
 * - Failed reviews reset interval but keep some ease.
 */

export interface Sm2Card {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  state: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
}

export interface Sm2Result extends Sm2Card {
  dueAt: Date;
}

/** Map lesson answer outcome to SM-2 quality. */
export function qualityFromAnswer(
  correct: boolean,
  responseMs?: number
): number {
  if (!correct) return 1;
  if (responseMs != null && responseMs < 2500) return 5;
  if (responseMs != null && responseMs < 6000) return 4;
  return 3;
}

export function scheduleSm2(
  card: Sm2Card,
  quality: number,
  now: Date = new Date()
): Sm2Result {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  let { easeFactor, intervalDays, repetitions, lapses, state } = card;

  if (q < 3) {
    lapses += 1;
    repetitions = 0;
    intervalDays = 1;
    state = "RELEARNING";
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    );

    if (repetitions === 0) {
      intervalDays = 1;
      state = "LEARNING";
    } else if (repetitions === 1) {
      intervalDays = 3;
      state = "REVIEW";
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
      state = "REVIEW";
    }
    repetitions += 1;
  }

  const dueAt = new Date(now.getTime());
  dueAt.setUTCDate(dueAt.getUTCDate() + intervalDays);
  dueAt.setUTCHours(9, 0, 0, 0);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    repetitions,
    lapses,
    state,
    dueAt,
  };
}

export function newSm2Card(): Sm2Card {
  return {
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    state: "NEW",
  };
}
