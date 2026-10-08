import {
  XP_PER_CORRECT,
  anyAnswerMatches,
  newSm2Card,
  qualityFromAnswer,
  scheduleSm2,
  type DailyQueueItem,
  type SrsReviewItem,
} from "@x-pi/shared";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { awardXp, updateStreak } from "./stats";
import { listLessonsForUser } from "./lessons";

type Tx = Prisma.TransactionClient;

export async function upsertSrsFromAnswer(
  tx: Tx,
  params: {
    userId: string;
    questionId: string;
    correct: boolean;
    responseMs?: number;
  }
) {
  const quality = qualityFromAnswer(params.correct, params.responseMs);
  const existing = await tx.srsCard.findUnique({
    where: {
      userId_questionId: {
        userId: params.userId,
        questionId: params.questionId,
      },
    },
  });
  const base = existing
    ? {
        easeFactor: existing.easeFactor,
        intervalDays: existing.intervalDays,
        repetitions: existing.repetitions,
        lapses: existing.lapses,
        state: existing.state as "NEW" | "LEARNING" | "REVIEW" | "RELEARNING",
      }
    : newSm2Card();
  const scheduled = scheduleSm2(base, quality);

  await tx.srsCard.upsert({
    where: {
      userId_questionId: {
        userId: params.userId,
        questionId: params.questionId,
      },
    },
    create: {
      userId: params.userId,
      questionId: params.questionId,
      easeFactor: scheduled.easeFactor,
      intervalDays: scheduled.intervalDays,
      repetitions: scheduled.repetitions,
      lapses: scheduled.lapses,
      state: scheduled.state,
      dueAt: scheduled.dueAt,
      lastReviewedAt: new Date(),
    },
    update: {
      easeFactor: scheduled.easeFactor,
      intervalDays: scheduled.intervalDays,
      repetitions: scheduled.repetitions,
      lapses: scheduled.lapses,
      state: scheduled.state,
      dueAt: scheduled.dueAt,
      lastReviewedAt: new Date(),
    },
  });
}

export async function getDueReviews(userId: string, limit = 20): Promise<SrsReviewItem[]> {
  const cards = await prisma.srsCard.findMany({
    where: { userId, dueAt: { lte: new Date() } },
    orderBy: { dueAt: "asc" },
    take: limit,
    include: { question: true },
  });
  return cards.map((c) => ({
    cardId: c.id,
    prompt: c.question.prompt,
    type: c.question.type,
    options: (c.question.optionsJson as string[] | null) ?? null,
    hint: c.question.hint,
  }));
}

export async function submitSrsReview(
  userId: string,
  cardId: string,
  answer: unknown,
  responseMs?: number
) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT id FROM "SrsCard" WHERE id = ${cardId} AND "userId" = ${userId} FOR UPDATE
    `;
    const card = await tx.srsCard.findFirst({
      where: { id: cardId, userId },
      include: { question: true },
    });
    if (!card) throw Object.assign(new Error("Card not found"), { status: 404 });
    if (card.dueAt.getTime() > Date.now()) {
      throw Object.assign(new Error("Card not due yet"), { status: 400 });
    }

    const expected = Array.isArray(card.question.answerJson)
      ? (card.question.answerJson as string[])
      : [String(card.question.answerJson)];
    const correct = anyAnswerMatches(expected, String(answer ?? ""));

    await upsertSrsFromAnswer(tx, {
      userId,
      questionId: card.questionId,
      correct,
      responseMs,
    });

    let xpEarned = 0;
    if (correct) {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      // Hour-bucketed refId limits redelivery spam for the same card
      const award = await awardXp(tx, {
        userId,
        amount: Math.floor(XP_PER_CORRECT / 2),
        reason: "srs_review",
        refId: `${cardId}:${new Date().toISOString().slice(0, 13)}`,
        timezone: user.timezone,
        reviewsCompleted: 1,
      });
      xpEarned = award.awarded;
      await updateStreak(tx, userId, user.timezone);
    }

    return { correct, expected: correct ? undefined : expected, xpEarned };
  });
}

export async function getDailyQueue(userId: string): Promise<DailyQueueItem[]> {
  const items: DailyQueueItem[] = [];
  const due = await prisma.srsCard.findMany({
    where: { userId, dueAt: { lte: new Date() } },
    take: 10,
    orderBy: { dueAt: "asc" },
    include: { question: { include: { lesson: true } } },
  });
  for (const c of due) {
    items.push({
      kind: "SRS_REVIEW",
      id: c.id,
      title: "Review",
      subtitle: c.question.lesson.title,
      dueAt: c.dueAt.toISOString(),
      xpReward: 5,
    });
  }
  const lessons = await listLessonsForUser(userId);
  const next = lessons.find((l) => !l.completed && !l.locked);
  if (next) {
    items.push({
      kind: "LESSON",
      id: next.id,
      title: next.title,
      subtitle: next.description,
      xpReward: next.xpReward,
    });
  }
  return items;
}
