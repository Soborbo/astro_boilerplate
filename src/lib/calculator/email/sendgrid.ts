/**
 * SendGrid email provider (fallback)
 * https://docs.sendgrid.com/api-reference/mail-send/mail-send
 */

import sgMail from '@sendgrid/mail';

interface SendGridEmailOptions {
  to: string;
  subject: string;
  html: string;
  from: {
    email: string;
    name: string;
  };
  replyTo?: string;
}

interface SendGridResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWithSendGrid(options: SendGridEmailOptions): Promise<SendGridResult> {
  const apiKey = import.meta.env.SENDGRID_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'SENDGRID_API_KEY not configured',
    };
  }

  try {
    sgMail.setApiKey(apiKey);

    const msg = {
      to: options.to,
      from: options.from,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    };

    const [response] = await sgMail.send(msg);

    return {
      success: true,
      messageId: response.headers['x-message-id'],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
