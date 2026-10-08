import {
  calendarDateInTz,
  daysBetween,
  levelFromXp,
  previousCalendarDate,
} from "@x-pi/shared";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";

type Tx = Prisma.TransactionClient | PrismaClient;

/** Idempotent XP award via unique (userId, reason, refId) + atomic increment. */
export async function awardXp(
  tx: Tx,
  params: {
    userId: string;
    amount: number;
    reason: string;
    refId: string;
    timezone: string;
    lessonsCompleted?: number;
    reviewsCompleted?: number;
  }
) {
  const {
    userId,
    amount,
    reason,
    refId,
    timezone,
    lessonsCompleted = 0,
    reviewsCompleted = 0,
  } = params;

  if (amount <= 0 && lessonsCompleted === 0 && reviewsCompleted === 0) {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    return { user, awarded: 0, leveledUp: false };
  }

  let awarded = 0;
  if (amount > 0) {
    const id = `xp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    // ON CONFLICT DO NOTHING avoids aborting the surrounding PG transaction
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "XpEvent" (id, "userId", amount, reason, "refId", "createdAt")
      VALUES (${id}, ${userId}, ${amount}, ${reason}, ${refId}, NOW())
      ON CONFLICT ("userId", reason, "refId") DO NOTHING
      RETURNING id
    `;
    if (rows.length === 0) {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      return { user, awarded: 0, leveledUp: false };
    }
    awarded = amount;
  }

  const before = await tx.user.findUniqueOrThrow({ where: { id: userId } });

  if (awarded > 0) {
    await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: awarded } },
    });
  }

  const afterXp = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  const correctLevel = levelFromXp(afterXp.xp);
  const user =
    afterXp.level !== correctLevel
      ? await tx.user.update({
          where: { id: userId },
          data: { level: correctLevel },
        })
      : afterXp;

  const today = calendarDateInTz(new Date(), timezone);
  await tx.dailyActivity.upsert({
    where: { userId_date: { userId, date: today } },
    create: {
      userId,
      date: today,
      xpEarned: awarded,
      lessonsCompleted,
      reviewsCompleted,
      goalMet: awarded >= before.dailyXpGoal,
    },
    update: {
      ...(awarded > 0 ? { xpEarned: { increment: awarded } } : {}),
      ...(lessonsCompleted > 0
        ? { lessonsCompleted: { increment: lessonsCompleted } }
        : {}),
      ...(reviewsCompleted > 0
        ? { reviewsCompleted: { increment: reviewsCompleted } }
        : {}),
    },
  });

  const activity = await tx.dailyActivity.findUniqueOrThrow({
    where: { userId_date: { userId, date: today } },
  });
  if (!activity.goalMet && activity.xpEarned >= before.dailyXpGoal) {
    await tx.dailyActivity.update({
      where: { id: activity.id },
      data: { goalMet: true },
    });
  }

  return {
    user,
    awarded,
    leveledUp: user.level > before.level,
  };
}

/** Timezone-aware streak: consecutive calendar days; gap resets to 1. */
export async function updateStreak(tx: Tx, userId: string, timezone: string) {
  const today = calendarDateInTz(new Date(), timezone);

  await tx.$executeRaw`
    SELECT id FROM "Streak" WHERE "userId" = ${userId} FOR UPDATE
  `;

  let streak = await tx.streak.findUnique({ where: { userId } });
  if (!streak) {
    return tx.streak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      },
    });
  }
  if (streak.lastActiveDate === today) return streak;

  const yesterday = previousCalendarDate(today);
  const current =
    streak.lastActiveDate === yesterday ? streak.currentStreak + 1 : 1;

  return tx.streak.update({
    where: { userId },
    data: {
      currentStreak: current,
      longestStreak: Math.max(streak.longestStreak, current),
      lastActiveDate: today,
    },
  });
}

/**
 * Streak summary with stale-miss handling: if lastActiveDate is ≥2 days ago,
 * report currentStreak as 0 until the user plays again.
 */
export async function getStreakSummary(userId: string, tx: Tx = prisma) {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  const streak = await tx.streak.findUnique({ where: { userId } });
  const today = calendarDateInTz(new Date(), user.timezone);
  const activity = await tx.dailyActivity.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  let currentStreak = streak?.currentStreak ?? 0;
  const last = streak?.lastActiveDate ?? null;
  if (last && last !== today && daysBetween(last, today) >= 2) {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak: streak?.longestStreak ?? 0,
    lastActiveDate: last,
    todayXp: activity?.xpEarned ?? 0,
    dailyXpGoal: user.dailyXpGoal,
    goalMet: activity?.goalMet ?? false,
  };
}
