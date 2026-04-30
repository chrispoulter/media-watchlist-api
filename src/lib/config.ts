import 'dotenv/config';
import { z } from 'zod';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(join(process.cwd(), 'package.json'));

export const release =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GIT_COMMIT_SHA ??
    require('./package.json').version;

export const environment =
    process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';

const configSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    TMDB_API_READ_TOKEN: z.string(),
    SMTP_HOST: z.string().default('localhost'),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_SECURE: z.coerce.boolean().default(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.email(),
    LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
        .default('info'),
    SENTRY_DSN: z.url().optional(),
});

export const config = configSchema.parse(process.env);
