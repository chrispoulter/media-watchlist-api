import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { requestLogger } from './middleware/request-logger.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { errorHandler } from './middleware/error-handler.js';
import searchRouter from './routes/search-router.js';
import watchlistRouter from './routes/watchlist-router.js';
import healthRouter from './routes/health-router.js';
import docsRouter from './routes/docs-router.js';
import { auth } from './lib/auth.js';
import { config } from './lib/config.js';

const app = express();

// app.use(async (_req, _res, next) => {
//   await new Promise((resolve) => setTimeout(resolve, 1000 * 3));
//   next();
// });

app.use(
    cors({
        origin: config.CLIENT_ORIGIN.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.all('/api/auth/*splat', toNodeHandler(auth));
app.use('/api/search', searchRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/health', healthRouter);
app.use(docsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
