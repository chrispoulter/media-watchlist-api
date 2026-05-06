import { Router } from 'express';
import { version, environment } from '../lib/config.js';
import { healthCheck as checkDatabase } from '../db/index.js';
import { healthCheck as checkTmdb } from '../lib/tmdb.js';
import { healthCheck as checkMailer } from '../lib/mailer.js';

const router = Router();

router.get('/', async (_req, res) => {
    const services = await Promise.all([
        checkDatabase(),
        checkTmdb(),
        checkMailer(),
    ]);
    const failing = services.some((s) => s?.success !== true);

    res.status(failing ? 503 : 200).json({
        status: failing ? 'unhealthy' : 'ok',
        version,
        environment,
        uptime: process.uptime(),
        services,
    });
});

export default router;
