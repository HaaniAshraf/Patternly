import { consoleEmailProvider } from './console.provider';
import type { EmailProvider } from './emailProvider.interface';

const activeProvider: EmailProvider = consoleEmailProvider;

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await activeProvider.send({
    to,
    subject: 'Welcome to Patternly',
    html: `<p>Hi ${name}, welcome to Patternly. Start with a 30-second check-in to begin discovering your patterns.</p>`,
  });
}
