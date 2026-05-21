import { Router } from 'express';
import { version, environment } from '../lib/config.js';

import { check as checkDatabase } from '../db/index.js';
import { check as checkMailer } from '../lib/mailer.js';
import { check as checkTmdb } from '../lib/tmdb.js';

const router = Router();

router.get('/health', async (_req, res) => {
    const services = await Promise.all([
        checkDatabase(),
        checkMailer(),
        checkTmdb(),
    ]);

    const failing = services.some((s) => s.status !== 'ok');

    res.status(failing ? 503 : 200).json({
        status: failing ? 'unhealthy' : 'ok',
        version,
        environment,
        uptime: process.uptime(),
        services,
    });
});

router.get('/alive', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        version,
        environment,
        uptime: process.uptime(),
    });
});

export default router;
