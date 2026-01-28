
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

// Create a new ratelimiter, that allows 5 requests per 60 minutes
export const strictRateLimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, "60 m"),
    analytics: true,
});

// More lenient limiter for general API calls (if needed)
export const standardRateLimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
});

export async function rateLimit(req: NextRequest, limiter = strictRateLimit) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // Skip rate limiting in development if no KV tokens (will fail otherwise)
    if (!process.env.KV_REST_API_URL) return { success: true };

    const { success, limit, reset, remaining } = await limiter.limit(`ratelimit_${ip}`);

    return { success, limit, reset, remaining };
}
