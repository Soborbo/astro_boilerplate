/**
 * Email sending coordinator
 * Tries Resend first, falls back to SendGrid if needed
 */

import { sendWithResend } from './resend';
import { sendWithSendGrid } from './sendgrid';
import { siteConfig } from '@/config/calculator/site';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  provider: 'resend' | 'sendgrid' | 'none';
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, html, replyTo } = options;

  // Try Resend first
  const resendApiKey = import.meta.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const result = await sendWithResend({
        to,
        subject,
        html,
        from: `${siteConfig.emails.fromName} <${siteConfig.emails.from}>`,
        replyTo,
      });

      if (result.success) {
        return {
          success: true,
          provider: 'resend',
          messageId: result.messageId,
        };
      }
    } catch (error) {
      console.error('Resend failed, trying fallback:', error);
    }
  }

  // Fallback to SendGrid
  const sendgridApiKey = import.meta.env.SENDGRID_API_KEY;
  if (sendgridApiKey) {
    try {
      const result = await sendWithSendGrid({
        to,
        subject,
        html,
        from: {
          email: siteConfig.emails.from,
          name: siteConfig.emails.fromName,
        },
        replyTo,
      });

      if (result.success) {
        return {
          success: true,
          provider: 'sendgrid',
          messageId: result.messageId,
        };
      }
    } catch (error) {
      console.error('SendGrid failed:', error);
    }
  }

  // No provider available or all failed
  return {
    success: false,
    provider: 'none',
    error: 'No email provider available or all providers failed',
  };
}
