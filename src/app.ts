// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Hono } from 'hono';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { honoLogger } from '@logtape/hono';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import type { ErrorResponse } from './types/index.js';
import { config } from './lib/config.js';

import './lib/logger.js';

import { registerDocRoutes } from './routes/doc-routes.js';
import healthRoutes from './routes/health-routes.js';
import authRoutes from './routes/auth-routes.js';
import searchRoutes from './routes/search-routes.js';
import watchlistRoutes from './routes/watchlist-routes.js';

const app = new OpenAPIHono();

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.use(
    cors({
        origin: config.CLIENT_ORIGIN.split(','),
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    })
);

app.use(
    bodyLimit({
        maxSize: 10 * 1024 * 1024,
        onError: (c) =>
            c.json<ErrorResponse>({ error: 'Payload Too Large' }, 413),
    })
);

app.use(
    honoLogger({
        skip: (c) => c.req.path === '/health' || c.req.path === '/alive',
        context: true,
    })
);

app.route('/api/auth', authRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/watchlist', watchlistRoutes);
app.route('/', healthRoutes);

registerDocRoutes(app);

app.get('/', (c) => c.redirect('/reference'));

export default app;
