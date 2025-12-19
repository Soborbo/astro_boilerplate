import { siteConfig } from '@/config/calculator/site';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  reason?: 'minute' | 'day'; // FIX-005
}

// KV binding type (Cloudflare)
// This will be bound in wrangler.toml
declare const RATE_LIMIT_KV: KVNamespace | undefined;

export async function checkRateLimit(
  type: 'submit' | 'postcode',
  identifier: string // IP or sessionId
): Promise<RateLimitResult> {
  const limits = siteConfig.rateLimit[type];
  const now = Date.now();
  const minuteWindow = Math.floor(now / 60000);
  const dayWindow = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const minuteKey = `${type}:${identifier}:min:${minuteWindow}`;
  const dayKey = `${type}:${identifier}:day:${dayWindow}`;

  try {
    // Check if KV is available
    if (typeof RATE_LIMIT_KV === 'undefined') {
      console.warn('RATE_LIMIT_KV not available, allowing request');
      return {
        allowed: true,
        remaining: limits.perMinute,
        resetAt: (minuteWindow + 1) * 60000,
      };
    }

    // FIX-005: Check minute limit
    const minuteCountStr = await RATE_LIMIT_KV.get(minuteKey);
    const minuteCount = minuteCountStr ? parseInt(minuteCountStr, 10) : 0;

    if (minuteCount >= limits.perMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: (minuteWindow + 1) * 60000,
        reason: 'minute',
      };
    }

    // FIX-005: Check day limit (only for submit)
    if (type === 'submit' && 'perDay' in limits) {
      const dayCountStr = await RATE_LIMIT_KV.get(dayKey);
      const dayCount = dayCountStr ? parseInt(dayCountStr, 10) : 0;

      if (dayCount >= limits.perDay) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(dayWindow + 'T23:59:59Z').getTime(),
          reason: 'day',
        };
      }

      // Increment day counter
      await RATE_LIMIT_KV.put(dayKey, String(dayCount + 1), {
        expirationTtl: 86400, // 24 hours
      });
    }

    // Increment minute counter
    await RATE_LIMIT_KV.put(minuteKey, String(minuteCount + 1), {
      expirationTtl: 60,
    });

    return {
      allowed: true,
      remaining: limits.perMinute - minuteCount - 1,
      resetAt: (minuteWindow + 1) * 60000,
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
