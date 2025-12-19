import type { APIRoute } from 'astro';
import { postcodeLookupSchema } from '@/lib/calculator/schemas';
import { lookupCityAsync } from '@/lib/calculator/postcode';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/calculator/rate-limit';
import { createLogger, generateRequestId } from '@/lib/calculator/logger';
import { siteConfig } from '@/config/calculator/site';
// FIX-008: Use unified API response format
import { success, error, ErrorCodes } from '@/lib/calculator/api-response';

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
      // FIX-008: Use unified error response
      return error(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        'Too many requests',
        429,
        undefined,
        getRateLimitHeaders(rateLimit)
      );
    }

    // ============================================
    // 2. VALIDATE INPUT
    // ============================================
    const code = url.searchParams.get('code');

    if (!code) {
      // FIX-008: Use unified error response
      return error(
        ErrorCodes.MISSING_PARAMETER,
        'Missing postcode parameter',
        400,
        undefined,
        getRateLimitHeaders(rateLimit)
      );
    }

    const result = postcodeLookupSchema.safeParse({ code });

    if (!result.success) {
      log.warn('Invalid postcode', { code, errors: result.error.flatten() });
      // FIX-008: Use unified error response
      return error(
        ErrorCodes.INVALID_POSTCODE,
        'Invalid postcode',
        400,
        { errors: result.error.flatten() },
        getRateLimitHeaders(rateLimit)
      );
    }

    // ============================================
    // 3. LOOKUP CITY
    // ============================================
    const city = await lookupCityAsync(result.data.code, siteConfig.locale);

    log.info('Postcode lookup', { code: result.data.code, city, found: !!city });

    // ============================================
    // 4. RESPONSE
    // ============================================
    // FIX-008: Use unified success response
    return success({ city }, getRateLimitHeaders(rateLimit));

  } catch (err) {
    log.error('Postcode lookup error', err);
    // FIX-008: Use unified error response
    return error(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
};
