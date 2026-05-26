import { honoLogLayer } from '@loglayer/hono';
import { logger } from '../lib/logger.js';

export const requestLogger = honoLogLayer({
    instance: logger,
    autoLogging: {
        ignore: ['/health', '/alive'],
    },
});
