import type { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { auth } from '../lib/auth.js';
import { config, version } from '../lib/config.js';

export function registerDocRoutes(app: OpenAPIHono) {
    const cookiePrefix = config.BETTER_AUTH_URL.startsWith('https://')
        ? '__Secure-'
        : '';

    app.openAPIRegistry.registerComponent('securitySchemes', 'cookieAuth', {
        type: 'apiKey',
        in: 'cookie',
        name: `${cookiePrefix}better-auth.session_token`,
        description:
            'Signed session cookie set by Better Auth on sign-in. Sent automatically by the browser.',
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
