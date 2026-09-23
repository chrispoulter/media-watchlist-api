import { OpenAPIHono } from '@hono/zod-openapi';
import { validationHook } from './validation-hook.js';
import { AuthEnv } from '../lib/auth.js';

export const createRouter = () =>
    new OpenAPIHono<AuthEnv>({ defaultHook: validationHook });
