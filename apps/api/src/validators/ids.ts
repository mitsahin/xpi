import { z } from "zod";

/** Prisma cuid-like ids (flexible: cuid / cuid2 / uuid). */
export const idSchema = z
  .string()
  .min(8)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid id");

export const lessonIdParam = z.object({ lessonId: idSchema });
export const sessionIdParam = z.object({ sessionId: idSchema });
export const cardIdParam = z.object({ cardId: idSchema });

export const answerBodySchema = z.object({
  questionId: idSchema,
  answer: z.union([
    z.string().max(500),
    z.number(),
    z.boolean(),
    z.record(z.string().max(200)),
    z.array(z.unknown()).max(50),
  ]),
  responseMs: z.number().int().nonnegative().max(3_600_000).optional(),
});

export const reviewAnswerBodySchema = z.object({
  answer: z.union([
    z.string().max(500),
    z.number(),
    z.boolean(),
    z.record(z.string().max(200)),
    z.array(z.unknown()).max(50),
  ]),
  responseMs: z.number().int().nonnegative().max(3_600_000).optional(),
});

export const startLessonBodySchema = z
  .object({
    forceNew: z.boolean().optional(),
  })
  .optional()
  .default({});
