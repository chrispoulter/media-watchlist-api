import { createRouter } from '../lib/create-router.js';
import { auth } from '../lib/auth.js';

const router = createRouter();

router.on(['GET', 'POST'], '/*', (c) => auth.handler(c.req.raw));

export default router;
