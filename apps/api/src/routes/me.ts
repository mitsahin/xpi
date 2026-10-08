import { Router } from "express";
import { xpProgressInLevel } from "@x-pi/shared";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { getStreakSummary } from "../services/stats";
import {
  getDailyQueue,
  getDueReviews,
  submitSrsReview,
} from "../services/srs";

export const meRouter = Router();
meRouter.use(requireAuth);

meRouter.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId },
    });
    const streak = await getStreakSummary(user.id);
    const progress = xpProgressInLevel(user.xp);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        timezone: user.timezone,
        xp: user.xp,
        level: user.level,
        hearts: user.hearts,
        dailyXpGoal: user.dailyXpGoal,
      },
      streak,
      levelProgress: progress,
    });
  })
);

meRouter.get(
  "/queue",
  asyncHandler(async (req, res) => {
    const queue = await getDailyQueue(req.auth!.userId);
    return res.json({ queue });
  })
);

meRouter.get(
  "/reviews",
  asyncHandler(async (req, res) => {
    const reviews = await getDueReviews(req.auth!.userId);
    return res.json({ reviews });
  })
);

meRouter.post(
  "/reviews/:cardId/answer",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      answer: z.unknown(),
      responseMs: z.number().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
    try {
      const result = await submitSrsReview(
        req.auth!.userId,
        req.params.cardId,
        parsed.data.answer,
        parsed.data.responseMs
      );
      return res.json(result);
    } catch (e) {
      const err = e as Error & { status?: number };
      return res.status(err.status || 500).json({ error: err.message });
    }
  })
);
