import type { CookieOptions } from "express";
import { REFRESH_COOKIE_PATH } from "./auth.constants";

/** Parses durations like "15m", "7d", "30s", "12h" into milliseconds. */
export function durationToMs(value: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!match) return Number(value) || 0;
  const n = Number(match[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]]!;
  return n * unit;
}

export function refreshCookieOptions(maxAgeMs: number, isProd: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: maxAgeMs,
  };
}
