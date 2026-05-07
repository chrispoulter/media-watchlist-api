import env from '@fastify/env';

declare module 'fastify' {
    export interface FastifyInstance {
        config: {
            PORT: number;
            LOG_LEVEL: string;
            FASTIFY_CLOSE_GRACE_DELAY: number;
            DATABASE_URL: string;
            BETTER_AUTH_SECRET: string;
            BETTER_AUTH_URL: string;
            CLIENT_ORIGIN: string;
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            TMDB_API_READ_TOKEN: string;
            SMTP_HOST: string;
            SMTP_PORT: number;
            SMTP_SECURE: boolean;
            SMTP_FROM: string;
            SMTP_USER: string;
            SMTP_PASS: string;
        };
    }
}

const schema = {
    type: 'object',
    required: [
        'DATABASE_URL',
        'BETTER_AUTH_SECRET',
        'BETTER_AUTH_URL',
        'CLIENT_ORIGIN',
        'TMDB_API_READ_TOKEN',
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_FROM',
    ],
    properties: {
        DATABASE_URL: {
            type: 'string',
        },
        BETTER_AUTH_SECRET: {
            type: 'string',
        },
        BETTER_AUTH_URL: {
            type: 'string',
        },
        CLIENT_ORIGIN: {
            type: 'string',
        },
        GOOGLE_CLIENT_ID: {
            type: 'string',
        },
        GOOGLE_CLIENT_SECRET: {
            type: 'string',
        },
        TMDB_API_READ_TOKEN: {
            type: 'string',
        },
        SMTP_HOST: {
            type: 'string',
        },
        SMTP_PORT: {
            type: 'number',
        },
        SMTP_SECURE: {
            type: 'boolean',
        },
        SMTP_FROM: {
            type: 'string',
        },
        SMTP_USER: {
            type: 'string',
        },
        SMTP_PASS: {
            type: 'string',
        },
    },
};

export const autoConfig = {
    confKey: 'config',
    schema,
    dotenv: true,
    data: process.env,
};

export default env;
