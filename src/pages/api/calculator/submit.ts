import type { APIRoute } from 'astro';
import { submissionSchema } from '@/lib/calculator/schemas';
import { sendEmail } from '@/lib/calculator/email/send';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/calculator/rate-limit';
import { createLogger, generateRequestId } from '@/lib/calculator/logger';
import { siteConfig } from '@/config/calculator/site';
import { i18n, t } from '@/config/calculator/i18n';
// FIX-008: Use unified API response format
import { success, error, ErrorCodes } from '@/lib/calculator/api-response';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const requestId = generateRequestId();
  const ip = clientAddress || request.headers.get('cf-connecting-ip') || 'unknown';

  const log = createLogger({ requestId, ip, path: '/api/calculator/submit', method: 'POST' });

  try {
    // ============================================
    // 1. PAYLOAD SIZE CHECK
    // ============================================
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);

    if (contentLength > siteConfig.maxPayloadSize) {
      log.warn('Payload too large', { contentLength });
      // FIX-008: Use unified error response
      return error(ErrorCodes.PAYLOAD_TOO_LARGE, 'Payload too large', 413);
    }

    // ============================================
    // 2. RATE LIMITING
    // ============================================
    const rateLimit = await checkRateLimit('submit', ip);

    if (!rateLimit.allowed) {
      log.warn('Rate limit exceeded', { ip, reason: rateLimit.reason });
      // FIX-008: Use unified error response
      // FIX-002: Use i18n for message
      return error(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        t(siteConfig.locale, 'errors.rateLimitExceeded'),
        429,
        { reason: rateLimit.reason }, // FIX-005: Include reason (minute or day)
        getRateLimitHeaders(rateLimit)
      );
    }

    // ============================================
    // 3. PARSE & VALIDATE
    // ============================================
    const body = await request.json();
    const result = submissionSchema.safeParse(body);

    if (!result.success) {
      log.warn('Validation failed', { errors: result.error.flatten() });
      // FIX-008: Use unified error response
      return error(
        ErrorCodes.VALIDATION_ERROR,
        'Validation failed',
        400,
        { errors: result.error.flatten().fieldErrors },
        getRateLimitHeaders(rateLimit)
      );
    }

    const data = result.data;
    const sessionId = data.sessionId;

    log.info('Submission received', { sessionId });

    // ============================================
    // 4. GENERATE QUOTE ID
    // ============================================
    const quoteId = `Q-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    log.info('Quote created', { sessionId, quoteId });

    // ============================================
    // 5. GOOGLE SHEETS (async, non-blocking)
    // ============================================
    const sheetsUrl = import.meta.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (sheetsUrl) {
      fetch(sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          quoteId,
          sessionId,
          ...data.contact,
          answers: JSON.stringify(data.answers),
          utm: JSON.stringify(data.utm),
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => log.error('Sheets webhook failed', err));
    }

    // ============================================
    // 6. SEND EMAILS
    // ============================================
    const locale = siteConfig.locale;
    const translations = i18n[locale];

    // User email
    const userEmailResult = await sendEmail({
      to: data.contact.email,
      subject: `${translations.thankYouTitle} - #${quoteId}`,
      html: `
        <h1>${translations.thankYouTitle}</h1>
        <p>${data.contact.firstName},</p>
        <p>${translations.thankYouMessage}</p>
        <p><strong>${translations.quoteNumber}:</strong> ${quoteId}</p>
        <hr>
        <p>${translations.emailFollowUp}</p>
        <p><small>${translations.emailAutoReply}</small></p>
      `,
    });

    log.info('User email sent', {
      sessionId,
      quoteId,
      provider: userEmailResult.provider,
      success: userEmailResult.success,
    });

    // Admin email
    // FIX-002: Use i18n for subject
    const adminEmailResult = await sendEmail({
      to: siteConfig.emails.admin,
      subject: `${translations.emailSubjectAdmin}: ${quoteId}`,
      html: `
        <h1>Új ajánlatkérés</h1>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p><strong>Quote ID:</strong> ${quoteId}</p>
        <p><strong>Session:</strong> ${sessionId}</p>
        <hr>
        <h2>Kapcsolattartó adatok</h2>
        <p><strong>Név:</strong> ${data.contact.firstName} ${data.contact.lastName}</p>
        <p><strong>Email:</strong> ${data.contact.email}</p>
        <p><strong>Telefon:</strong> ${data.contact.phone}</p>
        <p><strong>Cím:</strong> ${data.contact.postcode} ${data.contact.city}</p>
        <hr>
        <h2>Válaszok</h2>
        <pre>${JSON.stringify(data.answers, null, 2)}</pre>
        <h2>UTM Paraméterek</h2>
        <pre>${JSON.stringify(data.utm, null, 2)}</pre>
        <h2>Meta információk</h2>
        <pre>${JSON.stringify(data.meta, null, 2)}</pre>
      `,
      replyTo: data.contact.email,
    });

    log.info('Admin email sent', {
      sessionId,
      quoteId,
      provider: adminEmailResult.provider,
      success: adminEmailResult.success,
    });

    // ============================================
    // 7. SUCCESS RESPONSE
    // ============================================
    // FIX-008: Use unified success response
    return success({ quoteId }, getRateLimitHeaders(rateLimit));

  } catch (err) {
    log.error('Submit handler error', err);
    // FIX-008: Use unified error response
    return error(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
};
