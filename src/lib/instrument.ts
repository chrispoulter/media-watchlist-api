import * as Sentry from '@sentry/node';
import { config, version, environment } from './config.js';

if (config.SENTRY_DSN) {
    Sentry.init({
        dsn: config.SENTRY_DSN,
        release: version,
        environment,
        sendDefaultPii: true,
        integrations: [Sentry.expressIntegration()],
        tracesSampleRate: 1.0,
    });
}
