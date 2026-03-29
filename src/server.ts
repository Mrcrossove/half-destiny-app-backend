import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import './models';

async function bootstrap() {
  await connectDatabase();
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`[backend] ${env.appName} backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('[backend] failed to start', error);
  process.exit(1);
});
