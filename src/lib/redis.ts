import { Duration, Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import { rateLimitSchema } from '../utils/schema';
import { TFError } from './error';
export const rateLimit = async (data: z.infer<typeof rateLimitSchema>) => {
  try {
  let { interval, limit, phoneNumber, url, token } = data;
  const redis = new Redis({
    url,
    token,
  });
  const result = rateLimitSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  const limiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(limit, interval as Duration),
  });
  const { success } = await limiter.limit(phoneNumber);

  if (!success) {
    throw new TFError('OTP limit reached');
  }

  return;
} catch (err) {
  throw err;
}
};
