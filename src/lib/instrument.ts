import * as Sentry from '@sentry/node';
import { config, release, environment } from './config.js';

if (config.SENTRY_DSN) {
    Sentry.init({
        dsn: config.SENTRY_DSN,
        release,
        environment,
        sendDefaultPii: true,
        integrations: [Sentry.expressIntegration()],
        tracesSampleRate: 1.0,
    });
}
