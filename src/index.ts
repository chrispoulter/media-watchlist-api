import app from './app.js';
import { config } from './lib/config.js';
import { logger } from './lib/logger.js';

import { shutdown as shutdownDb } from './db/index.js';
import { shutdown as shutdownMailer } from './lib/mailer.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app.listen(config.PORT, () => {
    logger.info(
        { port: config.PORT, local: `http://localhost:${config.PORT}` },
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
