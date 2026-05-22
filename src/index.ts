import './lib/instrument.js';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { apiReference } from '@scalar/express-api-reference';
import * as Sentry from '@sentry/node';
import { requestLogger } from './middleware/request-logger.js';
import { auth } from './lib/auth.js';
import apiRouter from './routes/index.js';
import app from './app.js';
import { config } from './lib/config.js';
import { logger } from './lib/logger.js';

import { shutdown as shutdownDb } from './db/index.js';
import { shutdown as shutdownMailer } from './lib/mailer.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

app.use(requestLogger);

app.use((_req, res, next) => {
    if (config.SENTRY_DSN) {
        res.on('finish', () => {
            Sentry.flush(2000);
        });
    }

    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: config.CLIENT_ORIGIN.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

app.use('/api', apiRouter);

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use('/api', (req, res) => {
    req.log.warn({ method: req.method, path: req.path }, 'Route not found');
    res.status(404).json({ error: 'Not Found' });
});

app.get('/openapi.json', async (_req, res) => {
    const authSchema = await auth.api.generateOpenAPISchema();

    const authPaths = Object.fromEntries(
        Object.entries(authSchema.paths).map(([path, pathItem]) => [
            `/api/auth${path}`,
            pathItem,
        ])
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

Sentry.setupExpressErrorHandler(app);

app.use(
    (
        err: Error,
        req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {
        req.log.error({ err, userId: req.user?.id }, 'Unhandled error');
        res.status(500).json({ error: 'Internal Server Error' });
    }
);

export default app;
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
