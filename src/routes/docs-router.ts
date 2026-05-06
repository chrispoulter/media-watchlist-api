import { Router } from 'express';
import { apiReference } from '@scalar/express-api-reference';
import { auth } from '../lib/auth.js';
import { openApiSpec } from '../openapi.js';

const router = Router();

router.get('/openapi.json', async (_req, res) => {
    const authSchema = await auth.api.generateOpenAPISchema();

    const authPaths = Object.fromEntries(
        Object.entries(authSchema.paths).map(([path, pathItem]) => [
            `/api/auth${path}`,
            pathItem,
        ])
    );

    res.json({
        ...openApiSpec,
        paths: { ...authPaths, ...openApiSpec.paths },
        components: {
            ...openApiSpec.components,
            schemas: {
                ...authSchema.components?.schemas,
                ...openApiSpec.components?.schemas,
            },
        },
    });
});

router.use(
    '/reference',
    apiReference({
        url: '/openapi.json',
        pageTitle: 'Media Watchlist API',
    })
);

export default router;
