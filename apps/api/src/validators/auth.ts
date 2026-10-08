import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(6).max(128),
  displayName: z.string().min(1).max(40),
  timezone: z.string().min(1).max(64).optional(),
});

export const loginBodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(20).max(512).optional(),
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(20).max(512).optional(),
  allDevices: z.boolean().optional(),
});
