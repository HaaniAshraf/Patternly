import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function main(): Promise<void> {
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] Patternly API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start', err);
  process.exit(1);
});
