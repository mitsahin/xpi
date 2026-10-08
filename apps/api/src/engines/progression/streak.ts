import { calendarDateInTz } from "@x-pi/shared";
import type { Prisma, PrismaClient } from "@prisma/client";
import { resolveStreakTransition } from "./streakLogic";

type Tx = Prisma.TransactionClient | PrismaClient;

export type StreakUpdateResult = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  freezesAvailable: number;
  freezesUsed: number;
  freezeConsumed: boolean;
};

export { resolveStreakTransition, effectiveCurrentStreak } from "./streakLogic";

/**
 * Timezone-aware streak update.
 * - Same day: no-op
 * - Yesterday: increment
 * - Exactly one missed day + freeze available: consume freeze, keep streak
 * - Larger gap: reset to 1
 */
export async function applyStreakActivity(
  tx: Tx,
  userId: string,
  timezone: string
): Promise<StreakUpdateResult> {
  const today = calendarDateInTz(new Date(), timezone);

  await tx.$executeRaw`
    SELECT id FROM "Streak" WHERE "userId" = ${userId} FOR UPDATE
  `;

  const streak = await tx.streak.findUnique({ where: { userId } });
  if (!streak) {
    const created = await tx.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        freezesAvailable: 1,
        freezesUsed: 0,
      },
    });
    return { ...created, freezeConsumed: false };
  }

  const next = resolveStreakTransition(today, {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActiveDate: streak.lastActiveDate,
    freezesAvailable: streak.freezesAvailable,
    freezesUsed: streak.freezesUsed,
  });

  if (next.unchanged) {
    return { ...streak, freezeConsumed: false };
  }

  const updated = await tx.streak.update({
    where: { userId },
    data: {
      currentStreak: next.currentStreak,
      longestStreak: next.longestStreak,
      lastActiveDate: next.lastActiveDate,
      freezesAvailable: next.freezesAvailable,
      freezesUsed: next.freezesUsed,
    },
  });

  return { ...updated, freezeConsumed: next.freezeConsumed };
}

/** Award one freeze when daily goal is first met (cap 2). */
export async function maybeAwardStreakFreeze(
  tx: Tx,
  userId: string,
  timezone: string
): Promise<number> {
  const today = calendarDateInTz(new Date(), timezone);
  const activity = await tx.dailyActivity.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  if (!activity?.goalMet) return 0;

  const streak = await tx.streak.findUnique({ where: { userId } });
  if (!streak || streak.freezesAvailable >= 2) return streak?.freezesAvailable ?? 0;

  const id = `freeze_${userId}_${today}`;
  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "XpEvent" (id, "userId", amount, reason, "refId", "createdAt")
    VALUES (${id}, ${userId}, 0, 'streak_freeze_award', ${today}, NOW())
    ON CONFLICT ("userId", reason, "refId") DO NOTHING
    RETURNING id
  `;
  if (rows.length === 0) return streak.freezesAvailable;

  const updated = await tx.streak.update({
    where: { userId },
    data: { freezesAvailable: { increment: 1 } },
  });
  return updated.freezesAvailable;
}
