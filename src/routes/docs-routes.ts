import { Hono } from 'hono';
import { type OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { auth } from '../lib/auth.js';
import { version } from '../lib/config.js';
import type { AppEnv } from '../types/hono.js';

export function registerDocs(app: OpenAPIHono<AppEnv>): void {
    app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
        type: 'http',
        scheme: 'bearer',
        description: 'Session token returned by sign-in endpoints.',
    });

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
}

const docsRoutes = new Hono();

docsRoutes.get('/auth-openapi.json', async (c) => {
    const authSchema = await auth.api.generateOpenAPISchema();
    return c.json(authSchema);
});

docsRoutes.use(
    '/reference',
    Scalar({
        pageTitle: 'Media Watchlist API',
        sources: [
            { url: '/openapi.json', title: 'Media Watchlist API' },
            { url: '/auth-openapi.json', title: 'Better Auth' },
        ],
    })
);

docsRoutes.get('/', (c) => c.redirect('/reference'));

export default docsRoutes;
