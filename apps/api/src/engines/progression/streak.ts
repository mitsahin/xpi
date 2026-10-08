import {
  calendarDateInTz,
  daysBetween,
  previousCalendarDate,
} from "@x-pi/shared";
import type { Prisma, PrismaClient } from "@prisma/client";

type Tx = Prisma.TransactionClient | PrismaClient;

export type StreakUpdateResult = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  freezesAvailable: number;
  freezesUsed: number;
  freezeConsumed: boolean;
};

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

  let streak = await tx.streak.findUnique({ where: { userId } });
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

  if (streak.lastActiveDate === today) {
    return { ...streak, freezeConsumed: false };
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

  const updated = await tx.streak.update({
    where: { userId },
    data: {
      currentStreak: current,
      longestStreak: Math.max(streak.longestStreak, current),
      lastActiveDate: today,
      freezesAvailable,
      freezesUsed,
    },
  });

  return { ...updated, freezeConsumed };
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

  // Award at most once per goal-met day via xp event style marker
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
