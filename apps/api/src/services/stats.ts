import {
  calendarDateInTz,
  levelFromXp,
  previousCalendarDate,
} from "@x-pi/shared";
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";

type Tx = Prisma.TransactionClient | PrismaClient;

/** Idempotent XP award via unique (userId, reason, refId). */
export async function awardXp(
  tx: Tx,
  params: {
    userId: string;
    amount: number;
    reason: string;
    refId: string;
    timezone: string;
  }
) {
  const { userId, amount, reason, refId, timezone } = params;
  if (amount <= 0) {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    return { user, awarded: 0, leveledUp: false };
  }

  try {
    await tx.xpEvent.create({ data: { userId, amount, reason, refId } });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      return { user, awarded: 0, leveledUp: false };
    }
    throw err;
  }

  const before = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  const newXp = before.xp + amount;
  const newLevel = levelFromXp(newXp);
  const user = await tx.user.update({
    where: { id: userId },
    data: { xp: newXp, level: newLevel },
  });

  const today = calendarDateInTz(new Date(), timezone);
  await tx.dailyActivity.upsert({
    where: { userId_date: { userId, date: today } },
    create: {
      userId,
      date: today,
      xpEarned: amount,
      goalMet: amount >= before.dailyXpGoal,
    },
    update: { xpEarned: { increment: amount } },
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

  return { user, awarded: amount, leveledUp: newLevel > before.level };
}

/** Timezone-aware streak: consecutive calendar days; gap resets to 1. */
export async function updateStreak(tx: Tx, userId: string, timezone: string) {
  const today = calendarDateInTz(new Date(), timezone);
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

export async function getStreakSummary(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const streak = await prisma.streak.findUnique({ where: { userId } });
  const today = calendarDateInTz(new Date(), user.timezone);
  const activity = await prisma.dailyActivity.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  return {
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    lastActiveDate: streak?.lastActiveDate ?? null,
    todayXp: activity?.xpEarned ?? 0,
    dailyXpGoal: user.dailyXpGoal,
    goalMet: activity?.goalMet ?? false,
  };
}
