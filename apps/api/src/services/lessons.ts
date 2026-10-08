import {
  XP_LESSON_BONUS,
  XP_PERFECT_BONUS,
  XP_PER_CORRECT,
  type AnswerResult,
  type LessonSessionState,
  type PublicLesson,
  type QuestionPayload,
} from "@x-pi/shared";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  gradeLessonAnswer,
  shuffle,
  toQuestionPayload,
} from "../engines/lesson";
import { awardXp, getStreakSummary, updateStreak } from "./stats";
import { upsertSrsFromAnswer } from "./srs";

function asState(
  session: {
    id: string;
    lessonId: string;
    status: LessonSessionState["status"];
    currentIndex: number;
    heartsRemaining: number;
    correctCount: number;
    incorrectCount: number;
    questionIds: string[];
  },
  question?: QuestionPayload | null
): LessonSessionState {
  return {
    sessionId: session.id,
    lessonId: session.lessonId,
    status: session.status,
    currentIndex: session.currentIndex,
    totalQuestions: session.questionIds.length,
    heartsRemaining: session.heartsRemaining,
    correctCount: session.correctCount,
    incorrectCount: session.incorrectCount,
    question: question ?? null,
  };
}

export async function listLessonsForUser(userId: string): Promise<PublicLesson[]> {
  const course = await prisma.course.findFirst({
    where: { slug: "spanish-basics" },
    include: {
      lessons: { orderBy: [{ unitOrder: "asc" }, { lessonOrder: "asc" }] },
    },
  });
  if (!course) return [];

  const progress = await prisma.userProgress.findMany({ where: { userId } });
  const byLesson = new Map(progress.map((p) => [p.lessonId, p]));
  const active = await prisma.lessonSession.findMany({
    where: { userId, status: "IN_PROGRESS" },
    select: { lessonId: true },
  });
  const activeSet = new Set(active.map((a) => a.lessonId));

  let unlockNext = true;
  return course.lessons.map((lesson) => {
    const p = byLesson.get(lesson.id);
    const completed = p?.completed ?? false;
    const locked = !unlockNext;
    if (completed) unlockNext = true;
    else if (!locked) unlockNext = false;
    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      unitOrder: lesson.unitOrder,
      lessonOrder: lesson.lessonOrder,
      xpReward: lesson.xpReward,
      estimatedMinutes: lesson.estimatedMinutes,
      locked,
      completed,
      stars: p?.stars ?? 0,
      hasActiveSession: activeSet.has(lesson.id),
    };
  });
}

export async function getActiveSession(userId: string, lessonId: string) {
  const session = await prisma.lessonSession.findFirst({
    where: { userId, lessonId, status: "IN_PROGRESS" },
  });
  if (!session) return null;
  const qid = session.questionIds[session.currentIndex];
  if (!qid) return null;
  const q = toQuestionPayload(
    await prisma.question.findUniqueOrThrow({ where: { id: qid } })
  );
  return asState(session, q);
}

export async function startLesson(
  userId: string,
  lessonId: string,
  opts: { forceNew?: boolean } = {}
) {
  const lessons = await listLessonsForUser(userId);
  const meta = lessons.find((l) => l.id === lessonId);
  if (!meta) throw Object.assign(new Error("Lesson not found"), { status: 404 });
  if (meta.locked) throw Object.assign(new Error("Lesson locked"), { status: 403 });

  if (!opts.forceNew) {
    const resumed = await getActiveSession(userId, lessonId);
    if (resumed) return { session: resumed, resumed: true as const };
  }

  const questions = await prisma.question.findMany({
    where: { lessonId },
    orderBy: { orderIndex: "asc" },
  });
  if (!questions.length) {
    throw Object.assign(new Error("Lesson has no questions"), { status: 400 });
  }

  const questionIds = shuffle(questions.map((q) => q.id));

  const session = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE
    `;
    await tx.lessonSession.updateMany({
      where: { userId, lessonId, status: "IN_PROGRESS" },
      data: { status: "ABANDONED", completedAt: new Date() },
    });
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    return tx.lessonSession.create({
      data: {
        userId,
        lessonId,
        questionIds,
        heartsRemaining: Math.min(5, user.hearts),
      },
    });
  });

  const q = toQuestionPayload(
    await prisma.question.findUniqueOrThrow({ where: { id: questionIds[0] } })
  );
  return { session: asState(session, q), resumed: false as const };
}

export async function submitAnswer(
  userId: string,
  sessionId: string,
  body: { questionId: string; answer: unknown; responseMs?: number }
): Promise<AnswerResult> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT id FROM "LessonSession" WHERE id = ${sessionId} AND "userId" = ${userId} FOR UPDATE
    `;

    const session = await tx.lessonSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw Object.assign(new Error("Session not found"), { status: 404 });

    const answers = { ...((session.answersJson as object) || {}) } as Record<
      string,
      unknown
    >;

    if (answers[body.questionId]) {
      const recorded = answers[body.questionId] as { correct: boolean };
      const qid = session.questionIds[session.currentIndex];
      const nextQ =
        session.status === "IN_PROGRESS" && qid
          ? toQuestionPayload(
              await tx.question.findUniqueOrThrow({ where: { id: qid } })
            )
          : null;
      return {
        correct: recorded.correct,
        heartsRemaining: session.heartsRemaining,
        sessionComplete: session.status === "COMPLETED",
        session: asState(session, nextQ),
      };
    }

    if (session.status !== "IN_PROGRESS") {
      throw Object.assign(new Error("Session not active"), { status: 400 });
    }

    const currentQid = session.questionIds[session.currentIndex];
    if (body.questionId !== currentQid) {
      throw Object.assign(new Error("Unexpected question"), { status: 409 });
    }

    const question = await tx.question.findUniqueOrThrow({
      where: { id: body.questionId },
    });
    const { correct, expected } = gradeLessonAnswer(
      question.type,
      question.answerJson,
      body.answer
    );

    answers[body.questionId] = {
      correct,
      answer: body.answer,
      at: new Date().toISOString(),
    };

    let hearts = session.heartsRemaining;
    let correctCount = session.correctCount;
    let incorrectCount = session.incorrectCount;
    if (correct) correctCount += 1;
    else {
      incorrectCount += 1;
      hearts = Math.max(0, hearts - 1);
      await tx.user.update({
        where: { id: userId },
        data: { hearts },
      });
    }

    const nextIndex = session.currentIndex + 1;
    const reachedEnd = nextIndex >= session.questionIds.length;
    const outOfHearts = hearts <= 0;
    const resolvedStatus: "IN_PROGRESS" | "COMPLETED" | "ABANDONED" =
      !reachedEnd && outOfHearts
        ? "ABANDONED"
        : reachedEnd
          ? "COMPLETED"
          : "IN_PROGRESS";
    const isFinished = resolvedStatus !== "IN_PROGRESS";

    const updated = await tx.lessonSession.update({
      where: { id: session.id },
      data: {
        answersJson: answers as Prisma.InputJsonValue,
        heartsRemaining: hearts,
        correctCount,
        incorrectCount,
        currentIndex: isFinished ? session.currentIndex : nextIndex,
        status: resolvedStatus,
        completedAt: isFinished ? new Date() : null,
      },
    });

    if (question.srsEligible) {
      await upsertSrsFromAnswer(tx, {
        userId,
        questionId: question.id,
        correct,
        responseMs: body.responseMs,
      });
    }

    if (!isFinished) {
      const nextQ = toQuestionPayload(
        await tx.question.findUniqueOrThrow({
          where: { id: updated.questionIds[nextIndex] },
        })
      );
      return {
        correct,
        expected: correct ? undefined : expected,
        explanation: question.explanation,
        heartsRemaining: hearts,
        sessionComplete: false,
        session: asState({ ...updated, currentIndex: nextIndex }, nextQ),
      };
    }

    let xpEarned = 0;
    let leveledUp = false;
    let newLevel: number | undefined;

    if (resolvedStatus === "COMPLETED") {
      const lesson = await tx.lesson.findUniqueOrThrow({
        where: { id: session.lessonId },
      });
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      const totalXp =
        correctCount * XP_PER_CORRECT +
        lesson.xpReward +
        XP_LESSON_BONUS +
        (incorrectCount === 0 ? XP_PERFECT_BONUS : 0);

      const award = await awardXp(tx, {
        userId,
        amount: totalXp,
        reason: "lesson_complete",
        refId: session.id,
        timezone: user.timezone,
        lessonsCompleted: 1,
      });
      xpEarned = award.awarded;
      leveledUp = award.leveledUp;
      newLevel = award.user.level;
      await updateStreak(tx, userId, user.timezone);

      const accuracy = correctCount / Math.max(1, correctCount + incorrectCount);
      const stars = accuracy >= 1 ? 3 : accuracy >= 0.8 ? 2 : 1;
      const score = Math.round(accuracy * 100);

      await tx.$executeRaw`
        INSERT INTO "UserProgress" (id, "userId", "lessonId", completed, stars, "bestScore", "timesCompleted", "lastCompletedAt", "updatedAt")
        VALUES (${`up_${session.id}`}, ${userId}, ${session.lessonId}, true, ${stars}, ${score}, 1, NOW(), NOW())
        ON CONFLICT ("userId", "lessonId") DO UPDATE SET
          completed = true,
          stars = GREATEST("UserProgress".stars, EXCLUDED.stars),
          "bestScore" = GREATEST("UserProgress"."bestScore", EXCLUDED."bestScore"),
          "timesCompleted" = "UserProgress"."timesCompleted" + 1,
          "lastCompletedAt" = NOW(),
          "updatedAt" = NOW()
      `;

      await tx.lessonSession.update({
        where: { id: session.id },
        data: { xpAwarded: xpEarned },
      });

      await tx.user.update({
        where: { id: userId },
        data: { hearts: Math.min(5, hearts + 1) },
      });
    }

    const streak = await getStreakSummary(userId, tx);
    return {
      correct,
      expected: correct ? undefined : expected,
      explanation: question.explanation,
      heartsRemaining: hearts,
      sessionComplete: resolvedStatus === "COMPLETED",
      xpEarned,
      leveledUp,
      newLevel,
      streak,
      session: asState({ ...updated, status: resolvedStatus }, null),
    };
  });
}
