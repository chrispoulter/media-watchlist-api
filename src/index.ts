import { serve } from '@hono/node-server';
import { getLogger } from '@logtape/logtape';
import app from './app.js';
import { config } from './lib/config.js';

import { shutdown as shutdownDb } from './db/index.js';
import { shutdown as shutdownMailer } from './lib/mailer.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const logger = getLogger(['api', 'server']);

const server = serve({ fetch: app.fetch, port: config.PORT }, (info) => {
    logger.info('Server is running on http://localhost:{port}', {
        port: info.port,
    });
});

const closeServer = () =>
    new Promise<void>((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

const shutdown = (signal: string) => {
    logger.info('Shutdown signal received: {signal}', { signal });

    void (async () => {
        try {
            await Promise.all([closeServer(), shutdownDb(), shutdownMailer()]);
            logger.info('Shutdown complete');
            process.exit(0);
        } catch (err) {
            logger.error('Error during shutdown {*}', { err });
            process.exit(1);
        }
    })();

    if ('closeIdleConnections' in server) {
        server.closeIdleConnections();
    }

    setTimeout(() => {
        logger.error('Shutdown timeout exceeded, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
};

process.on('SIGTERM', () => {
    shutdown('SIGTERM');
});
process.on('SIGINT', () => {
    shutdown('SIGINT');
});
