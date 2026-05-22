import pino from 'pino';
<<<<<<< HEAD
import { config, release } from './config.js';
=======
import { config, environment, version } from './config.js';
>>>>>>> 0b28bda715210065fa1339c86d94f7bdbd831190

const isDev = process.env['NODE_ENV'] !== 'production';

const destination = isDev
    ? undefined
    : pino.destination({ dest: 1, sync: true });

export const logger = pino(
    {
        level: config.LOG_LEVEL,
        timestamp: pino.stdTimeFunctions.isoTime,
<<<<<<< HEAD
        base: { service: 'media-watchlist-api', release },
=======
        base: { environment, version },
>>>>>>> 0b28bda715210065fa1339c86d94f7bdbd831190
        redact: {
            paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers["set-cookie"]',
                'req.body.password',
                'req.body.newPassword',
                'req.body.token',
                '*.secret',
                '*.accessToken',
                '*.refreshToken',
                '*.backupCodes',
            ],
            censor: '[REDACTED]',
        },
        ...(isDev && {
            transport: {
                target: 'pino-pretty',
                options: { colorize: true, translateTime: 'SYS:standard' },
            },
        }),
    },
    destination
);
