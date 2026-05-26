import { Hono } from 'hono';
import { Scalar } from '@scalar/hono-api-reference';
import { auth } from '../lib/auth.js';

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
