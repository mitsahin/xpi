import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, signToken } from "../middleware/auth";
import { authRateLimit } from "../middleware/rateLimit";

export const authRouter = Router();

authRouter.use(authRateLimit);

function isValidTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function publicUser(u: {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  xp: number;
  level: number;
  hearts: number;
  dailyXpGoal: number;
}) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    timezone: u.timezone,
    xp: u.xp,
    level: u.level,
    hearts: u.hearts,
    dailyXpGoal: u.dailyXpGoal,
  };
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      displayName: z.string().min(1).max(40),
      timezone: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const tz =
      parsed.data.timezone && isValidTimeZone(parsed.data.timezone)
        ? parsed.data.timezone
        : "UTC";

    const exists = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (exists) {
      // Avoid email enumeration: same shape as success would be awkward;
      // return generic conflict without confirming which field.
      return res.status(409).json({ error: "Unable to register with these credentials" });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        displayName: parsed.data.displayName,
        timezone: tz,
        streak: { create: {} },
      },
    });
    const token = signToken({ userId: user.id, email: user.email });
    return res.status(201).json({ token, user: publicUser(user) });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ userId: user.id, email: user.email });
    return res.json({ token, user: publicUser(user) });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId },
    });
    return res.json({ user: publicUser(user) });
  })
);
