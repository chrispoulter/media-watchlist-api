import type { PinoLogger } from 'hono-pino';
import type { User, Session } from '../lib/auth.js';

export type AppEnv = {
    Variables: {
        user: User;
        session: Session;
        logger: PinoLogger;
    };
};
