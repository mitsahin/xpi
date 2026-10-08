/** XP thresholds: level N requires cumulative XP from this curve. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Soft exponential: 50 * (n-1)^1.5 rounded
  return Math.round(50 * Math.pow(level - 1, 1.5));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level += 1;
    if (level > 200) break;
  }
  return level;
}

export function xpProgressInLevel(xp: number): {
  level: number;
  current: number;
  next: number;
  progress: number;
} {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = Math.max(1, next - floor);
  const current = xp - floor;
  return {
    level,
    current,
    next: next - floor,
    progress: Math.min(1, current / span),
  };
}

export const DEFAULT_DAILY_XP_GOAL = 50;
export const DEFAULT_HEARTS = 5;
export const XP_PER_CORRECT = 10;
export const XP_LESSON_BONUS = 20;
export const XP_PERFECT_BONUS = 15;
