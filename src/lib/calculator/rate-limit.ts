import { siteConfig } from '@/config/calculator/site';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// KV binding type (Cloudflare)
// This will be bound in wrangler.toml
declare const RATE_LIMIT_KV: KVNamespace | undefined;

export async function checkRateLimit(
  type: 'submit' | 'postcode',
  identifier: string // IP or sessionId
): Promise<RateLimitResult> {
  const limits = siteConfig.rateLimit[type];
  const minuteKey = `${type}:${identifier}:minute:${Math.floor(Date.now() / 60000)}`;

  try {
    // Check if KV is available
    if (typeof RATE_LIMIT_KV === 'undefined') {
      console.warn('RATE_LIMIT_KV not available, allowing request');
      return {
        allowed: true,
        remaining: limits.perMinute,
        resetAt: Math.ceil(Date.now() / 60000) * 60000,
      };
    }

    const currentStr = await RATE_LIMIT_KV.get(minuteKey);
    const current = currentStr ? parseInt(currentStr, 10) : 0;

    if (current >= limits.perMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: Math.ceil(Date.now() / 60000) * 60000,
      };
    }

    // Increment
    await RATE_LIMIT_KV.put(minuteKey, String(current + 1), {
      expirationTtl: 60,
    });

    return {
      allowed: true,
      remaining: limits.perMinute - current - 1,
      resetAt: Math.ceil(Date.now() / 60000) * 60000,
    };

  } catch (error) {
    // If KV fails, allow request but log
    console.error('Rate limit KV error:', error);
    return {
      allowed: true,
      remaining: -1,
      resetAt: 0,
    };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
  };
}
