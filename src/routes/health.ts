import { Router } from 'express';
<<<<<<< HEAD
import { release, environment } from '../lib/config.js';
=======
import { version, environment } from '../lib/config.js';
>>>>>>> 0b28bda715210065fa1339c86d94f7bdbd831190
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
<<<<<<< HEAD
        release,
=======
        version,
>>>>>>> 0b28bda715210065fa1339c86d94f7bdbd831190
        environment,
        uptime: process.uptime(),
        services,
    });
});

export default router;
