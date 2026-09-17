import { Router } from 'express';
import { version } from '../lib/config.js';

import { check as checkDatabase } from '../db/index.js';
import { check as checkMailer } from '../lib/mailer.js';
import { check as checkTmdb } from '../lib/tmdb.js';

const router = Router();

interface HealthResponse {
    status: 'ok' | 'unhealthy';
    version: string;
    uptime: number;
    services: Array<{
        name: string;
        status: 'ok' | 'unhealthy';
    }>;
}

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
        uptime: process.uptime(),
        services,
    } satisfies HealthResponse);
});

interface AliveResponse {
    status: 'ok';
    version: string;
    uptime: number;
}

router.get('/alive', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        version,
        uptime: process.uptime(),
    } satisfies AliveResponse);
});

export default router;
