import type { Request, Response } from "express";
import { env } from "./env";

export const REFRESH_COOKIE = "xpi_refresh";

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function setRefreshCookie(res: Response, raw: string) {
  if (!env.authSetCookie) return;
  const maxAge = Math.floor(env.jwtRefreshMs / 1000);
  const parts = [
    `${REFRESH_COOKIE}=${encodeURIComponent(raw)}`,
    "Path=/auth",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (env.nodeEnv === "production") parts.push("Secure");
  res.append("Set-Cookie", parts.join("; "));
}

export function clearRefreshCookie(res: Response) {
  if (!env.authSetCookie) return;
  const parts = [
    `${REFRESH_COOKIE}=`,
    "Path=/auth",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (env.nodeEnv === "production") parts.push("Secure");
  res.append("Set-Cookie", parts.join("; "));
}
