import * as Sentry from '@sentry/node';
import { config, version } from './config.js';
import { logger } from './logger.js';

if (config.SENTRY_DSN) {
    logger.info(
        {
            dsn: config.SENTRY_DSN,
            release: version,
            environment: process.env['NODE_ENV'] ?? 'development',
        },
        'Initializing Sentry'
    );

    Sentry.init({
        dsn: config.SENTRY_DSN,
        release: version,
        environment: process.env['NODE_ENV'] ?? 'development',
        tracesSampleRate: 1.0,
        integrations: [Sentry.expressIntegration()],
    });
}
