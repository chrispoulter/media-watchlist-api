import { buildApp } from './index.js';
import { config } from './lib/config.js';
import { shutdown as shutdownDb } from './db/index.js';
import { shutdown as shutdownMailer } from './lib/mailer.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const fastify = await buildApp();

await fastify.listen({ port: config.PORT, host: '0.0.0.0' });

const shutdown = async (signal: string) => {
    fastify.log.info({ signal }, 'Shutdown signal received');

    const timeout = setTimeout(() => {
        fastify.log.error('Shutdown timeout exceeded, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    try {
        await Promise.all([fastify.close(), shutdownDb(), shutdownMailer()]);
        clearTimeout(timeout);
        fastify.log.info('Shutdown complete');
        process.exit(0);
    } catch (err) {
        fastify.log.error({ err }, 'Error during shutdown');
        process.exit(1);
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
