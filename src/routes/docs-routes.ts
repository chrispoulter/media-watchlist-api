import { Router } from 'express';
import { apiReference } from '@scalar/express-api-reference';
import { openApiSpec } from '../docs/openapi.js';
import { auth } from '../lib/auth.js';

const router = Router();

router.get('/openapi.json', async (_req, res) => res.json(openApiSpec));

router.get('/auth-openapi.json', async (_req, res) => {
    const authSchema = await auth.api.generateOpenAPISchema();
    res.json(authSchema);
});

router.use(
    '/reference',
    apiReference({
        pageTitle: 'Media Watchlist API',
        sources: [
            { url: '/openapi.json', title: 'Media Watchlist API' },
            {
                url: '/auth-openapi.json',
                title: 'Better Auth',
            },
        ],
    })
);

router.get('/', (_req, res) => res.redirect('/reference'));

export default router;
