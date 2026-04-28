import { pinoHttp } from 'pino-http';
import { logger } from '../lib/logger.js';

export const requestLogger = pinoHttp({
    logger,
    genReqId: (req) =>
        (req.headers['x-vercel-id'] as string | undefined) ??
        crypto.randomUUID(),
    customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) {
            return 'error';
        }

        if (res.statusCode >= 400) {
            return 'warn';
        }

        return 'info';
    },
    autoLogging: {
        ignore: (req) => req.url === '/api/health',
    },
});
