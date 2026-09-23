import { createMiddleware } from 'hono/factory';
import { withContext } from '@logtape/logtape';
import type { ErrorResponse } from '../types/index.js';
import { auth, type AuthEnv } from '../lib/auth.js';

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
    const sessionData = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!sessionData) {
        return c.json<ErrorResponse>({ error: 'Unauthorized' }, 401);
    }

    c.set('user', sessionData.user);
    c.set('session', sessionData.session);

    await withContext({ userId: sessionData.user.id }, next);
});
