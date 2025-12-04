import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';
import rateLimit from 'express-rate-limit';

export const createApp = () => {
  const app = express();

  // Basic rate limiting (bonus)
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many requests, please try again later.',
    },
  });

  app.use(limiter);
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  app.use('/static', express.static(uploadDir));

  app.use('/api', router);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
};

