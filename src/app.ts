import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestLogger } from './middleware/request-logger.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { errorHandler } from './middleware/error-handler.js';
import searchRoutes from './routes/search-routes.js';
import watchlistRoutes from './routes/watchlist-routes.js';
import healthRoutes from './routes/health-routes.js';
import docsRoutes from './routes/docs-routes.js';
import { auth } from './lib/auth.js';
import { config } from './lib/config.js';
import type { AppEnv } from './types/hono.js';

const app = new Hono<AppEnv>();

app.use(
    '*',
    cors({
        origin: config.CLIENT_ORIGIN.split(','),
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

app.use('*', requestLogger);

app.all('/api/auth/**', (c) => auth.handler(c.req.raw));

app.route('/api', searchRoutes);
app.route('/api', watchlistRoutes);

app.route('/', healthRoutes);
app.route('/', docsRoutes);

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
