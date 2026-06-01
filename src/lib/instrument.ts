import * as Sentry from '@sentry/node';
import { config, version } from './config.js';

if (config.SENTRY_DSN) {
    Sentry.init({
        dsn: config.SENTRY_DSN,
        release: version,
        sendDefaultPii: true,
        integrations: [
            Sentry.expressIntegration(),
            Sentry.postgresIntegration(),
            Sentry.pinoIntegration(),
        ],
        tracesSampleRate: 0.1,
    });
}
