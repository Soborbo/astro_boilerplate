/**
 * Resend email provider
 * https://resend.com/docs/api-reference/emails/send-email
 */

import { Resend } from 'resend';

interface ResendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from: string;
  replyTo?: string;
}

interface ResendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWithResend(options: ResendEmailOptions): Promise<ResendResult> {
  const apiKey = import.meta.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'RESEND_API_KEY not configured',
    };
  }

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
