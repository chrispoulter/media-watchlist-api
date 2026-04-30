import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import * as Sentry from '@sentry/node';
import { auth } from '../lib/auth.js';

export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const sessionData = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData) {
        req.log.warn({ path: req.path }, 'Unauthenticated request rejected');
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    req.user = sessionData.user;
    req.session = sessionData.session;

    req.log = req.log.child({ userId: sessionData.user.id });
    Sentry.setUser({ id: sessionData.user.id, email: sessionData.user.email });

    next();
};
