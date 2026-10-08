import { daysBetween, previousCalendarDate } from "@x-pi/shared";

export type StreakSnapshot = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  freezesAvailable: number;
  freezesUsed: number;
};

export type StreakTransition = StreakSnapshot & {
  freezeConsumed: boolean;
  unchanged: boolean;
};

/**
 * Pure streak transition (no DB). Used by applyStreakActivity + unit tests.
 */
export function resolveStreakTransition(
  today: string,
  streak: StreakSnapshot
): StreakTransition {
  if (streak.lastActiveDate === today) {
    return { ...streak, freezeConsumed: false, unchanged: true };
  }

  const yesterday = previousCalendarDate(today);
  let current = 1;
  let freezesAvailable = streak.freezesAvailable;
  let freezesUsed = streak.freezesUsed;
  let freezeConsumed = false;

  if (streak.lastActiveDate === yesterday) {
    current = streak.currentStreak + 1;
  } else if (
    streak.lastActiveDate &&
    daysBetween(streak.lastActiveDate, today) === 2 &&
    freezesAvailable > 0
  ) {
    current = streak.currentStreak + 1;
    freezesAvailable -= 1;
    freezesUsed += 1;
    freezeConsumed = true;
  } else {
    current = 1;
  }

  return {
    currentStreak: current,
    longestStreak: Math.max(streak.longestStreak, current),
    lastActiveDate: today,
    freezesAvailable,
    freezesUsed,
    freezeConsumed,
    unchanged: false,
  };
}

/** Display streak: zero when gap too large and freeze cannot bridge. */
export function effectiveCurrentStreak(
  today: string,
  lastActiveDate: string | null,
  currentStreak: number,
  freezesAvailable: number
): number {
  if (!lastActiveDate || lastActiveDate === today) return currentStreak;
  const gap = daysBetween(lastActiveDate, today);
  if (gap >= 3 || (gap === 2 && freezesAvailable <= 0)) return 0;
  return currentStreak;
}
