import pino from 'pino';
import { LogLayer } from 'loglayer';
import { PinoTransport } from '@loglayer/transport-pino';
import { serializeError } from 'serialize-error';
import { config, version } from './config.js';

const isDev = process.env['NODE_ENV'] !== 'production';

const destination = isDev
    ? undefined
    : pino.destination({ dest: 1, sync: true });

export const pinoInstance = pino(
    {
        level: config.LOG_LEVEL,
        timestamp: pino.stdTimeFunctions.isoTime,
        base: { version },
        serializers: {
            err: pino.stdSerializers.err,
        },
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

export const logger = new LogLayer({
    errorSerializer: serializeError,
    transport: new PinoTransport({ logger: pinoInstance }),
});
