import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "1 m"),
});

export const rateLimiter = async (identifier: string) => {
  const { success } = await ratelimit.limit(identifier);
  return success;
};
