import type { APIRoute } from 'astro';
import { submissionSchema } from '@/lib/calculator/schemas';
import { sendEmail } from '@/lib/calculator/email/send';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/calculator/rate-limit';
import { createLogger, generateRequestId } from '@/lib/calculator/logger';
import { siteConfig } from '@/config/calculator/site';
import { i18n } from '@/config/calculator/i18n';

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
      return jsonError('Payload too large', 413);
    }

    // ============================================
    // 2. RATE LIMITING
    // ============================================
    const rateLimit = await checkRateLimit('submit', ip);

    if (!rateLimit.allowed) {
      log.warn('Rate limit exceeded', { ip });
      return jsonError(
        i18n[siteConfig.locale].errors.rateLimitExceeded,
        429,
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
      return new Response(
        JSON.stringify({
          success: false,
          errors: result.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getRateLimitHeaders(rateLimit),
          }
        }
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
    const t = i18n[locale];

    // User email
    const userEmailResult = await sendEmail({
      to: data.contact.email,
      subject: `${t.thankYouTitle} - #${quoteId}`,
      html: `
        <h1>${t.thankYouTitle}</h1>
        <p>${data.contact.firstName},</p>
        <p>${t.thankYouMessage}</p>
        <p><strong>Azonosító:</strong> ${quoteId}</p>
        <hr>
        <p>Hamarosan felvesszük Önnel a kapcsolatot a megadott elérhetőségeken.</p>
        <p><small>Ez egy automatikus email. Kérjük, ne válaszoljon rá.</small></p>
      `,
    });

    log.info('User email sent', {
      sessionId,
      quoteId,
      provider: userEmailResult.provider,
      success: userEmailResult.success,
    });

    // Admin email
    const adminEmailResult = await sendEmail({
      to: siteConfig.emails.admin,
      subject: `Új ajánlatkérés: ${quoteId}`,
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
    return new Response(
      JSON.stringify({ success: true, quoteId }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimit),
        }
      }
    );

  } catch (error) {
    log.error('Submit handler error', error);

    return jsonError('Internal server error', 500);
  }
};

function jsonError(message: string, status: number, headers?: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      }
    }
  );
}
