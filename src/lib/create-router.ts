import { OpenAPIHono } from '@hono/zod-openapi';
import { AuthEnv } from '../middleware/require-auth.js';
import { validationHook } from './validation-hook.js';

export const createRouter = () =>
    new OpenAPIHono<AuthEnv>({ defaultHook: validationHook });

export const authSecurity: Record<string, string[]>[] = [
    { bearerAuth: [] },
    { cookieAuth: [] },
];
