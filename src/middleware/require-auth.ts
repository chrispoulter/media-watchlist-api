import { createMiddleware } from 'hono/factory';
import { auth } from '../lib/auth.js';
import type { AppEnv } from '../types/hono.js';

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
    const log = c.var.logger;

    const sessionData = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!sessionData) {
        log.withMetadata({ path: c.req.path }).warn(
            'Unauthenticated request rejected'
        );

        return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('user', sessionData.user);
    c.set('session', sessionData.session);

    c.set('logger', log.withContext({ userId: sessionData.user.id }));

    await next();
});
