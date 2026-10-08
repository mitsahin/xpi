import {
  XP_LESSON_BONUS,
  XP_PERFECT_BONUS,
  XP_PER_CORRECT,
  anyAnswerMatches,
  type AnswerResult,
  type LessonSessionState,
  type PublicLesson,
  type QuestionPayload,
} from "@x-pi/shared";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { awardXp, getStreakSummary, updateStreak } from "./stats";
import { upsertSrsFromAnswer } from "./srs";

function toQuestion(q: {
  id: string;
  type: QuestionPayload["type"];
  prompt: string;
  optionsJson: Prisma.JsonValue;
  hint: string | null;
}): QuestionPayload {
  return {
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    options: (q.optionsJson as string[] | null) ?? null,
    hint: q.hint,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
    };
  });
}

export async function startLesson(userId: string, lessonId: string) {
  const lessons = await listLessonsForUser(userId);
  const meta = lessons.find((l) => l.id === lessonId);
  if (!meta) throw Object.assign(new Error("Lesson not found"), { status: 404 });
  if (meta.locked) throw Object.assign(new Error("Lesson locked"), { status: 403 });

  // Phase 1: abandon any in-progress session and start fresh
  await prisma.lessonSession.updateMany({
    where: { userId, lessonId, status: "IN_PROGRESS" },
    data: { status: "ABANDONED", completedAt: new Date() },
  });

  const questions = await prisma.question.findMany({
    where: { lessonId },
    orderBy: { orderIndex: "asc" },
  });
  if (!questions.length) {
    throw Object.assign(new Error("Lesson has no questions"), { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const questionIds = shuffle(questions.map((q) => q.id));
  const session = await prisma.lessonSession.create({
    data: {
      userId,
      lessonId,
      questionIds,
      heartsRemaining: Math.min(5, user.hearts),
    },
  });
  const q = toQuestion(
    await prisma.question.findUniqueOrThrow({ where: { id: questionIds[0] } })
  );
  return asState(session, q);
}

export async function submitAnswer(
  userId: string,
  sessionId: string,
  body: { questionId: string; answer: unknown; responseMs?: number }
): Promise<AnswerResult> {
  return prisma.$transaction(async (tx) => {
    // Lock session row to prevent overlapping answer races
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

    // Idempotent retry: already answered this question
    if (answers[body.questionId]) {
      const recorded = answers[body.questionId] as { correct: boolean };
      const qid = session.questionIds[session.currentIndex];
      const nextQ =
        session.status === "IN_PROGRESS" && qid
          ? toQuestion(
              await tx.question.findUniqueOrThrow({ where: { id: qid } })
            )
          : null;
      return {
        correct: recorded.correct,
        heartsRemaining: session.heartsRemaining,
        sessionComplete: session.status !== "IN_PROGRESS",
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
    const expectedArr = Array.isArray(question.answerJson)
      ? (question.answerJson as string[])
      : [String(question.answerJson)];
    const correct = anyAnswerMatches(expectedArr, String(body.answer ?? ""));
    const expected = expectedArr.length === 1 ? expectedArr[0] : expectedArr;

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
      // Persist hearts on User so new sessions don't restore lost hearts
      await tx.user.update({
        where: { id: userId },
        data: { hearts },
      });
    }

    const nextIndex = session.currentIndex + 1;
    const reachedEnd = nextIndex >= session.questionIds.length;
    const outOfHearts = hearts <= 0;
    // Out of hearts before the end → abandon; reaching the end → complete
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
      const nextQ = toQuestion(
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

      // Atomic bestScore / stars via GREATEST
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

      // Soft heart regen on successful complete
      await tx.user.update({
        where: { id: userId },
        data: { hearts: Math.min(5, hearts + 1) },
      });
    }

    // Read streak from same transaction so response is not stale
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
