import * as Sentry from '@sentry/node';
import { config, release, environment } from './config.js';
import { logger } from './logger.js';

if (config.SENTRY_DSN) {
    logger.info(
        {
            dsn: config.SENTRY_DSN,
            release,
            environment,
        },
        'Initializing Sentry'
    );

    Sentry.init({
        dsn: config.SENTRY_DSN,
        release,
        environment,
        integrations: [Sentry.expressIntegration()],
        tracesSampleRate: 1.0,
    });
}
