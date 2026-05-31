// ── IP-based rate limiter ─────────────────────────────────────────────────────
// 10 uses per IP per day, 3-second cooldown between requests.
// Resets at midnight UTC. In-memory — resets on server restart.

import type { Request } from "express";

export const DAILY_LIMIT = 10;
const COOLDOWN_MS = 3_000;

interface UsageRecord {
  count:       number;
  resetAt:     number; // unix ms for next midnight UTC
  lastRequest: number; // unix ms of last accepted request
}

const store = new Map<string, UsageRecord>();

function nextMidnightUTC(): number {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    return ip.trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

export interface LimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number;
  error?:    string;
}

/** Check the limit and, if allowed, consume one use. */
export function checkAndConsume(ip: string): LimitResult {
  const now = Date.now();
  let rec = store.get(ip);

  // Initialise or reset after midnight
  if (!rec || now >= rec.resetAt) {
    rec = { count: 0, resetAt: nextMidnightUTC(), lastRequest: 0 };
  }

  // Cooldown check
  if (now - rec.lastRequest < COOLDOWN_MS) {
    store.set(ip, rec);
    return {
      allowed:   false,
      remaining: DAILY_LIMIT - rec.count,
      resetAt:   rec.resetAt,
      error:     "Please wait 3 seconds between requests.",
    };
  }

  // Daily limit check
  if (rec.count >= DAILY_LIMIT) {
    store.set(ip, rec);
    return {
      allowed:   false,
      remaining: 0,
      resetAt:   rec.resetAt,
      error:     "You've used all 10 free tools for today. Come back tomorrow — resets at midnight UTC.",
    };
  }

  rec.count++;
  rec.lastRequest = now;
  store.set(ip, rec);

  return {
    allowed:   true,
    remaining: DAILY_LIMIT - rec.count,
    resetAt:   rec.resetAt,
  };
}

/** Read current usage without consuming a use. */
export function getUsage(ip: string): { used: number; remaining: number; resetAt: number } {
  const now = Date.now();
  const rec = store.get(ip);
  if (!rec || now >= rec.resetAt) {
    return { used: 0, remaining: DAILY_LIMIT, resetAt: nextMidnightUTC() };
  }
  return { used: rec.count, remaining: DAILY_LIMIT - rec.count, resetAt: rec.resetAt };
}
