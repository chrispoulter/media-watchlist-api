import Fastify from 'fastify';
import fp from 'fastify-plugin';
import closeWithGrace from 'close-with-grace';
import { logger } from './lib/logger.js';
import serviceApp from './app.js';

const app = Fastify({
    requestIdHeader: 'x-vercel-id',
    loggerInstance: logger,
    connectionTimeout: 120_000,
    requestTimeout: 60_000,
    keepAliveTimeout: 10_000,
    http: {
        headersTimeout: 15_000,
    },
    ajv: {
        customOptions: {
            coerceTypes: 'array',
            removeAdditional: 'all',
        },
    },
});

async function init() {
    app.register(fp(serviceApp));

    closeWithGrace(
        { delay: process.env.FASTIFY_CLOSE_GRACE_DELAY ?? 500 },
        async ({ err }) => {
            if (err != null) {
                app.log.error(err);
            }

            await app.close();
        }
    );

    await app.ready();

    try {
        await app.listen({ host: '0.0.0.0', port: process.env.PORT ?? 3000 });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

init();
