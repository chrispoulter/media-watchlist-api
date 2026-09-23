import type { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { auth } from '../lib/auth.js';
import { version } from '../lib/config.js';

export function registerDocRoutes(app: OpenAPIHono) {
    app.openAPIRegistry.registerComponent('securitySchemes', 'apiKeyCookie', {
        type: 'apiKey',
        in: 'cookie',
        name: 'apiKeyCookie',
        description: 'API Key authentication via cookie',
    });

    app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
        type: 'http',
        scheme: 'bearer',
        description: 'Bearer token authentication',
    });

    app.doc('/openapi.json', {
        openapi: '3.0.3',
        info: {
            title: 'Media Watchlist API',
            version,
        },
    });

    app.get('/auth-openapi.json', async (c) =>
        c.json(await auth.api.generateOpenAPISchema())
    );

    app.get(
        '/reference',
        Scalar({
            pageTitle: 'Media Watchlist API',
            sources: [
                { url: '/openapi.json', title: 'Media Watchlist API' },
                { url: '/auth-openapi.json', title: 'Better Auth' },
            ],
        })
    );
}
