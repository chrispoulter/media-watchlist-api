import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { requestLogger } from './middleware/request-logger.js';
import { notFoundHandler } from './middleware/not-found-handler.js';
import { errorHandler } from './middleware/error-handler.js';
import searchRoutes from './routes/search-routes.js';
import watchlistRoutes from './routes/watchlist-routes.js';
import healthRoutes from './routes/health-routes.js';
import docsRoutes from './routes/docs-routes.js';
import { auth } from './lib/auth.js';
import { config, version } from './lib/config.js';
import type { AppEnv } from './types/hono.js';

const app = new OpenAPIHono<AppEnv>();

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

// Register security scheme used by protected routes
app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    description: 'Session token returned by sign-in endpoints.',
});

// Auto-generate the OpenAPI spec endpoint
app.doc('/openapi.json', {
    openapi: '3.0.3',
    info: {
        title: 'Media Watchlist API',
        version,
        description: 'REST API for managing a personal media watchlist.',
    },
    servers: [{ url: '/' }],
    tags: [
        { name: 'Health', description: 'Service health check' },
        { name: 'Search', description: 'Search for movies and TV shows' },
        {
            name: 'Watchlist',
            description: 'Manage your personal media watchlist',
        },
    ],
});

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
