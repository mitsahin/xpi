import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import {
  answerBodySchema,
  lessonIdParam,
  sessionIdParam,
  startLessonBodySchema,
} from "../validators";
import {
  getActiveSession,
  listLessonsForUser,
  startLesson,
  submitAnswer,
} from "../services/lessons";

export const lessonsRouter = Router();

lessonsRouter.use(requireAuth);

lessonsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const lessons = await listLessonsForUser(req.auth!.userId);
    return res.json({ lessons });
  })
);

lessonsRouter.get(
  "/:lessonId/active",
  asyncHandler(async (req, res) => {
    const params = lessonIdParam.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ error: "Invalid lesson id", code: "BAD_PARAMS" });
    }
    const session = await getActiveSession(
      req.auth!.userId,
      params.data.lessonId
    );
    return res.json({ session });
  })
);

lessonsRouter.post(
  "/:lessonId/start",
  asyncHandler(async (req, res) => {
    const params = lessonIdParam.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ error: "Invalid lesson id", code: "BAD_PARAMS" });
    }
    const body = startLessonBodySchema.safeParse(req.body ?? {});
    if (!body.success) {
      return res.status(400).json({ error: "Invalid body", code: "BAD_BODY" });
    }
    try {
      const result = await startLesson(req.auth!.userId, params.data.lessonId, {
        forceNew: body.data?.forceNew === true,
      });
      return res.json(result);
    } catch (e) {
      const err = e as Error & { status?: number; code?: string };
      return res
        .status(err.status || 500)
        .json({ error: err.message, code: err.code });
    }
  })
);

lessonsRouter.post(
  "/sessions/:sessionId/answer",
  asyncHandler(async (req, res) => {
    const params = sessionIdParam.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ error: "Invalid session id", code: "BAD_PARAMS" });
    }
    const parsed = answerBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body", code: "BAD_BODY" });
    }
    try {
      const result = await submitAnswer(
        req.auth!.userId,
        params.data.sessionId,
        {
          questionId: parsed.data.questionId,
          answer: parsed.data.answer,
          responseMs: parsed.data.responseMs,
        }
      );
      return res.json(result);
    } catch (e) {
      const err = e as Error & { status?: number; code?: string };
      return res
        .status(err.status || 500)
        .json({ error: err.message, code: err.code });
    }
  })
);
