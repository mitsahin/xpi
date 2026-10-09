/**
 * Integration: lesson start resume vs forceNew abandon.
 * Skips when DATABASE_URL is unset (local unit-only runs).
 */
import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import bcrypt from "bcryptjs";

const hasDb = Boolean(process.env.DATABASE_URL);

describe("lesson resume (integration)", { skip: !hasDb }, () => {
  let prisma: typeof import("../../lib/prisma").prisma;
  let startLesson: typeof import("../../services/lessons").startLesson;
  let getActiveSession: typeof import("../../services/lessons").getActiveSession;
  let userId = "";
  let lessonId = "";

  before(async () => {
    ({ prisma } = await import("../../lib/prisma"));
    ({ startLesson, getActiveSession } = await import("../../services/lessons"));

    const email = `resume-test-${Date.now()}@x-pi.test`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash("testpass1", 10),
        displayName: "Resume Tester",
        streak: { create: {} },
      },
    });
    userId = user.id;

    // Prefer seeded greetings lesson; create a minimal one if seed missing.
    let lesson = await prisma.lesson.findFirst({
      where: { slug: "greetings" },
      include: { questions: { take: 1 } },
    });
    if (!lesson || lesson.questions.length === 0) {
      const course =
        (await prisma.course.findFirst({ where: { slug: "spanish-basics" } })) ??
        (await prisma.course.create({
          data: {
            slug: "spanish-basics",
            title: "Spanish Basics",
            description: "test",
            language: "es",
          },
        }));
      lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          slug: `resume-lesson-${Date.now()}`,
          title: "Resume Fixture",
          description: "test",
          unitOrder: 1,
          lessonOrder: 99,
          xpReward: 10,
          questions: {
            create: [
              {
                type: "MCQ",
                prompt: "1+1?",
                optionsJson: ["1", "2"],
                answerJson: "2",
                orderIndex: 0,
              },
              {
                type: "MCQ",
                prompt: "2+2?",
                optionsJson: ["3", "4"],
                answerJson: "4",
                orderIndex: 1,
              },
            ],
          },
        },
        include: { questions: true },
      });
    }
    lessonId = lesson.id;
  });

  after(async () => {
    if (userId) {
      await prisma.lessonSession.deleteMany({ where: { userId } }).catch(() => null);
      await prisma.user.delete({ where: { id: userId } }).catch(() => null);
    }
    await prisma.$disconnect();
  });

  it("returns resumed:true for an in-progress session", async () => {
    const first = await startLesson(userId, lessonId);
    assert.equal(first.resumed, false);
    assert.ok(first.session.sessionId);
    assert.equal(first.session.status, "IN_PROGRESS");
    assert.ok(first.session.question);

    const second = await startLesson(userId, lessonId);
    assert.equal(second.resumed, true);
    assert.equal(second.session.sessionId, first.session.sessionId);
    assert.equal(second.session.currentIndex, first.session.currentIndex);

    const active = await getActiveSession(userId, lessonId);
    assert.ok(active);
    assert.equal(active!.sessionId, first.session.sessionId);
  });

  it("forceNew abandons prior session and starts fresh", async () => {
    const prior = await startLesson(userId, lessonId);
    assert.ok(prior.session.sessionId);

    const fresh = await startLesson(userId, lessonId, { forceNew: true });
    assert.equal(fresh.resumed, false);
    assert.notEqual(fresh.session.sessionId, prior.session.sessionId);
    assert.equal(fresh.session.currentIndex, 0);

    const abandoned = await prisma.lessonSession.findUnique({
      where: { id: prior.session.sessionId },
    });
    assert.equal(abandoned?.status, "ABANDONED");

    const active = await getActiveSession(userId, lessonId);
    assert.ok(active);
    assert.equal(active!.sessionId, fresh.session.sessionId);
  });

  it("rejects locked lessons", async () => {
    const locked = await prisma.lesson.findFirst({
      where: { slug: "numbers-1" },
    });
    if (!locked) return; // seed may not be present in bare DB

    await assert.rejects(
      () => startLesson(userId, locked.id),
      (e: Error & { code?: string; status?: number }) =>
        e.code === "LESSON_LOCKED" && e.status === 403
    );
  });
});
