import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import routes from './routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.allowedOrigins === '*' ? true : env.allowedOrigins.split(',') }));
  app.use(express.json({ limit: '2mb' }));
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        service: 'half-destiny-backend',
        time: new Date().toISOString()
      }
    });
  });

  app.use('/api', routes);
  app.use(errorHandler);

  return app;
}
