import type { APIRoute } from 'astro';
import { postcodeLookupSchema } from '@/lib/calculator/schemas';
import { lookupCityAsync } from '@/lib/calculator/postcode';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/calculator/rate-limit';
import { createLogger, generateRequestId } from '@/lib/calculator/logger';
import { siteConfig } from '@/config/calculator/site';

export const prerender = false;

export const GET: APIRoute = async ({ request, clientAddress, url }) => {
  const requestId = generateRequestId();
  const ip = clientAddress || request.headers.get('cf-connecting-ip') || 'unknown';

  const log = createLogger({ requestId, ip, path: '/api/calculator/postcode', method: 'GET' });

  try {
    // ============================================
    // 1. RATE LIMITING
    // ============================================
    const rateLimit = await checkRateLimit('postcode', ip);

    if (!rateLimit.allowed) {
      log.warn('Rate limit exceeded', { ip });
      return jsonError('Too many requests', 429, getRateLimitHeaders(rateLimit));
    }

    // ============================================
    // 2. VALIDATE INPUT
    // ============================================
    const code = url.searchParams.get('code');

    if (!code) {
      return jsonError('Missing postcode parameter', 400, getRateLimitHeaders(rateLimit));
    }

    const result = postcodeLookupSchema.safeParse({ code });

    if (!result.success) {
      log.warn('Invalid postcode', { code, errors: result.error.flatten() });
      return jsonError('Invalid postcode', 400, getRateLimitHeaders(rateLimit));
    }

    // ============================================
    // 3. LOOKUP CITY
    // ============================================
    const city = await lookupCityAsync(result.data.code, siteConfig.locale);

    log.info('Postcode lookup', { code: result.data.code, city, found: !!city });

    // ============================================
    // 4. RESPONSE
    // ============================================
    return new Response(
      JSON.stringify({ city }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimit),
        }
      }
    );

  } catch (error) {
    log.error('Postcode lookup error', error);
    return jsonError('Internal server error', 500);
  }
};

function jsonError(message: string, status: number, headers?: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      }
    }
  );
}
