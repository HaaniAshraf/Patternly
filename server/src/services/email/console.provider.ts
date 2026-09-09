import type { EmailMessage, EmailProvider } from './emailProvider.interface';

/**
 * Local-dev default: logs instead of sending, so email is never a hard dependency
 * for running the app. Swap `activeProvider` in email.service.ts for a real
 * transactional provider (e.g. Postmark/SendGrid/SES) when one is configured.
 */
export const consoleEmailProvider: EmailProvider = {
  async send(message: EmailMessage): Promise<void> {
    console.log(`[email:console] to=${message.to} subject="${message.subject}"`);
  },
};
