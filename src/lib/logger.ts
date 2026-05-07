import pino from 'pino';
import { environment, version } from './config.js';

const isDev = process.env['NODE_ENV'] !== 'production';

const destination = isDev
    ? undefined
    : pino.destination({ dest: 1, sync: true });

export const logger = pino(
    {
        level: process.env.LOG_LEVEL || 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
        base: { environment, version },
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
