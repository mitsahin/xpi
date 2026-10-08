import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { listLessonsForUser, startLesson, submitAnswer } from "../services/lessons";

export const lessonsRouter = Router();

lessonsRouter.use(requireAuth);

lessonsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const lessons = await listLessonsForUser(req.auth!.userId);
    return res.json({ lessons });
  })
);

lessonsRouter.post(
  "/:lessonId/start",
  asyncHandler(async (req, res) => {
    try {
      const session = await startLesson(req.auth!.userId, req.params.lessonId);
      return res.json({ session });
    } catch (e) {
      const err = e as Error & { status?: number };
      return res.status(err.status || 500).json({ error: err.message });
    }
  })
);

lessonsRouter.post(
  "/sessions/:sessionId/answer",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      questionId: z.string(),
      answer: z.any(),
      responseMs: z.number().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
    try {
      const result = await submitAnswer(req.auth!.userId, req.params.sessionId, {
        questionId: parsed.data.questionId,
        answer: parsed.data.answer,
        responseMs: parsed.data.responseMs,
      });
      return res.json(result);
    } catch (e) {
      const err = e as Error & { status?: number };
      return res.status(err.status || 500).json({ error: err.message });
    }
  })
);
