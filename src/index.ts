import { serve } from '@hono/node-server';
import app from './app.js';
import { config } from './lib/config.js';
import { logger } from './lib/logger.js';

import { shutdown as shutdownDb } from './db/index.js';
import { shutdown as shutdownMailer } from './lib/mailer.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = serve({ fetch: app.fetch, port: config.PORT }, (info) => {
    logger.info(
        { port: info.port, local: `http://localhost:${info.port}` },
        'Server started'
    );
});

const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');

    server.close(async () => {
        try {
            await Promise.all([shutdownDb(), shutdownMailer()]);
            logger.info('Shutdown complete');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, 'Error during shutdown');
            process.exit(1);
        }
    });

    setTimeout(() => {
        logger.error('Shutdown timeout exceeded, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
