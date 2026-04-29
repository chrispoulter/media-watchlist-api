import * as Sentry from '@sentry/node';
import { config, version } from './lib/config.js';

if (config.SENTRY_DSN) {
    Sentry.init({
        dsn: config.SENTRY_DSN,
        release: version,
        environment: process.env['NODE_ENV'] ?? 'development',
        tracesSampleRate: 1.0,
        integrations: [Sentry.expressIntegration()],
    });
}
