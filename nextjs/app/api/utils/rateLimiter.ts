import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const shortTermLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "1 m"), // 5 requests per minute
});

const longTermLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(100, "1 h"), // 100 requests per hour
});

export const rateLimiter = async (identifier: string) => {
  const [shortTerm, longTerm] = await Promise.all([
    shortTermLimit.limit(identifier),
    longTermLimit.limit(identifier),
  ]);

  return shortTerm.success && longTerm.success;
};
