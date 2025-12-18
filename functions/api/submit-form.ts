/**
 * Form Handler - Cloudflare Workers
 * 
 * Funkciók:
 * - Honeypot spam védelem
 * - Time-to-submit validáció (3mp+)
 * - Rate limiting
 * - CSRF védelem (Origin check)
 * - Google Sheets írás
 * - Email küldés (Resend)
 * - Slack notification
 * 
 * ENV változók (Cloudflare Dashboard-on állítsd be):
 * - ALLOWED_ORIGIN (kötelező!) - pl. https://example.com
 * - RESEND_FROM_EMAIL (kötelező!) - verified Resend domain
 * - GOOGLE_SHEETS_API_KEY
 * - GOOGLE_SHEET_ID
 * - RESEND_API_KEY
 * - SLACK_WEBHOOK_URL
 * - NOTIFICATION_EMAIL
 */

interface FormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  form_start_time?: string;
  website?: string; // Honeypot
}

interface Env {
  ALLOWED_ORIGIN: string;
  RESEND_FROM_EMAIL: string;
  GOOGLE_SHEETS_API_KEY: string;
  GOOGLE_SHEET_ID: string;
  RESEND_API_KEY: string;
  SLACK_WEBHOOK_URL: string;
  NOTIFICATION_EMAIL: string;
  FORM_SUBMISSIONS: KVNamespace; // Rate limiting
}

// Rate limit config
const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 óra
};

// Minimum form kitöltési idő (bot védelem)
const MIN_FORM_TIME_MS = 3000;

// Retry config
const RETRY_CONFIG = {
  maxRetries: 2,
  delayMs: 1000,
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // ENV validation
  if (!env.ALLOWED_ORIGIN) {
    console.error('ALLOWED_ORIGIN environment variable is not set!');
    return new Response(
      JSON.stringify({ success: false, error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // CORS headers - RESTRICTED to allowed origin
    const allowedOrigin = env.ALLOWED_ORIGIN;
    const requestOrigin = request.headers.get('Origin');
    
    // CSRF védelem - Origin ellenőrzés
    if (requestOrigin && requestOrigin !== allowedOrigin) {
      console.warn(`CSRF attempt blocked. Origin: ${requestOrigin}, Expected: ${allowedOrigin}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid origin' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const headers = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };
    
    // OPTIONS request (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    // Parse form data
    const contentType = request.headers.get('content-type') || '';
    let formData: FormData;
    
    if (contentType.includes('application/json')) {
      formData = await request.json();
    } else if (contentType.includes('form-data') || contentType.includes('urlencoded')) {
      const data = await request.formData();
      formData = Object.fromEntries(data.entries()) as unknown as FormData;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid content type' }),
        { status: 400, headers }
      );
    }
    
    // 1. Honeypot check
    if (formData.website && formData.website.trim() !== '') {
      console.log('Honeypot triggered');
      // Sikert színlelünk, de nem dolgozzuk fel
      return new Response(
        JSON.stringify({ success: true }),
        { headers }
      );
    }
    
    // 2. Time-to-submit check
    if (formData.form_start_time) {
      const startTime = parseInt(formData.form_start_time);
      const submitTime = Date.now();
      
      if (submitTime - startTime < MIN_FORM_TIME_MS) {
        console.log('Form submitted too quickly');
        return new Response(
          JSON.stringify({ success: false, error: 'Please take your time filling the form' }),
          { status: 429, headers }
        );
      }
    }
    
    // 3. Validáció
    const validationError = validateFormData(formData);
    if (validationError) {
      return new Response(
        JSON.stringify({ success: false, error: validationError }),
        { status: 400, headers }
      );
    }
    
    // 4. Rate limiting (IP alapú)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `rate_limit:${clientIP}`;
    
    if (env.FORM_SUBMISSIONS) {
      const currentCount = await env.FORM_SUBMISSIONS.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount) : 0;
      
      if (count >= RATE_LIMIT.maxRequests) {
        return new Response(
          JSON.stringify({ success: false, error: 'Too many submissions. Please try again later.' }),
          { status: 429, headers }
        );
      }
      
      await env.FORM_SUBMISSIONS.put(rateLimitKey, (count + 1).toString(), {
        expirationTtl: RATE_LIMIT.windowMs / 1000,
      });
    } else {
      // Warning: Rate limiting disabled
      console.warn('⚠️ FORM_SUBMISSIONS KV namespace not configured. Rate limiting is DISABLED!');
    }
    
    // 5. Párhuzamos feldolgozás with retry logic
    const timestamp = new Date().toISOString();

    // Helper function for retrying failed operations
    async function withRetry<T>(
      operation: () => Promise<T>,
      serviceName: string
    ): Promise<{ success: boolean; service: string; error?: string }> {
      let lastError: Error | undefined;

      for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
          await operation();
          return { success: true, service: serviceName };
        } catch (error) {
          lastError = error as Error;
          console.warn(`${serviceName} attempt ${attempt + 1} failed:`, error);

          if (attempt < RETRY_CONFIG.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.delayMs * (attempt + 1)));
          }
        }
      }

      console.error(`${serviceName} failed after ${RETRY_CONFIG.maxRetries + 1} attempts:`, lastError);
      return { success: false, service: serviceName, error: lastError?.message };
    }

    const results = await Promise.all([
      withRetry(() => saveToGoogleSheets(env, formData, timestamp, clientIP), 'Google Sheets'),
      withRetry(() => sendEmail(env, formData, timestamp), 'Email'),
      withRetry(() => sendSlackNotification(env, formData, timestamp), 'Slack'),
    ]);

    // Count successes and failures
    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    // Log summary
    if (failures.length > 0) {
      console.warn(`Form submission partial failure. Succeeded: ${successes.map(s => s.service).join(', ') || 'none'}. Failed: ${failures.map(f => f.service).join(', ')}`);
    }

    // At least one service must succeed (preferably Google Sheets for data persistence)
    const sheetsSuccess = results.find(r => r.service === 'Google Sheets')?.success;

    if (!sheetsSuccess && successes.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process submission. Please try again.',
          details: failures.map(f => f.service),
        }),
        { status: 500, headers }
      );
    }

    // Partial success - data is saved but notifications may have failed
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
        warnings: failures.length > 0 ? `Some notifications failed: ${failures.map(f => f.service).join(', ')}` : undefined,
      }),
      { headers }
    );
    
  } catch (error) {
    console.error('Form handler error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Validáció
function validateFormData(data: FormData): string | null {
  if (!data.name || data.name.trim().length < 2) {
    return 'Name is required (minimum 2 characters)';
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    return 'Valid email is required';
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    return 'Invalid phone number format';
  }
  
  if (data.message && data.message.length > 5000) {
    return 'Message is too long (maximum 5000 characters)';
  }
  
  return null;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Nemzetközi formátum támogatás
  const phoneRegex = /^[\d\s\-\+\(\)]{6,20}$/;
  return phoneRegex.test(phone);
}

// Google Sheets mentés
async function saveToGoogleSheets(
  env: Env,
  data: FormData,
  timestamp: string,
  clientIP: string
): Promise<void> {
  if (!env.GOOGLE_SHEETS_API_KEY || !env.GOOGLE_SHEET_ID) {
    console.log('Google Sheets not configured, skipping');
    return;
  }
  
  const row = [
    timestamp,
    data.name,
    data.email,
    data.phone || '',
    data.message || '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || '',
    clientIP,
  ];
  
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Sheet1!A:I:append?valueInputOption=USER_ENTERED&key=${env.GOOGLE_SHEETS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status}`);
  }
}

// Email küldés (Resend)
async function sendEmail(env: Env, data: FormData, timestamp: string): Promise<void> {
  if (!env.RESEND_API_KEY || !env.NOTIFICATION_EMAIL) {
    console.log('Email not configured, skipping');
    return;
  }
  
  if (!env.RESEND_FROM_EMAIL) {
    console.error('⚠️ RESEND_FROM_EMAIL not configured! Email will fail.');
    throw new Error('RESEND_FROM_EMAIL environment variable is required');
  }
  
  const utmInfo = [data.utm_source, data.utm_medium, data.utm_campaign]
    .filter(Boolean)
    .join(' / ');
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL, // ENV-ből jön, verified domain kell!
      to: env.NOTIFICATION_EMAIL,
      subject: `Új ajánlatkérés: ${data.name}`,
      html: `
        <h2>Új ajánlatkérés érkezett</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Név:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(data.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Telefon:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.phone ? `<a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a>` : '-'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Üzenet:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.message ? escapeHtml(data.message).replace(/\n/g, '<br>') : '-'}</td>
          </tr>
          ${utmInfo ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Forrás:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(utmInfo)}</td>
          </tr>
          ` : ''}
        </table>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Beküldve: ${timestamp}
        </p>
      `,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status}`);
  }
}

// Slack notification
async function sendSlackNotification(env: Env, data: FormData, timestamp: string): Promise<void> {
  if (!env.SLACK_WEBHOOK_URL) {
    console.log('Slack not configured, skipping');
    return;
  }
  
  const utmInfo = [data.utm_source, data.utm_medium, data.utm_campaign]
    .filter(Boolean)
    .join(' / ');
  
  const response = await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 Új ajánlatkérés!',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Név:*\n${data.name}` },
            { type: 'mrkdwn', text: `*Email:*\n${data.email}` },
            { type: 'mrkdwn', text: `*Telefon:*\n${data.phone || '-'}` },
            { type: 'mrkdwn', text: `*Forrás:*\n${utmInfo || 'Direkt'}` },
          ],
        },
        ...(data.message ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Üzenet:*\n${data.message}`,
          },
        }] : []),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Beküldve: ${timestamp}`,
            },
          ],
        },
      ],
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Slack webhook error: ${response.status}`);
  }
}

// HTML escape (XSS védelem)
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
