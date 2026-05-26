import type { HonoLogLayerVariables } from '@loglayer/hono';
import type { User, Session } from '../lib/auth.js';

export type AppEnv = {
    Variables: HonoLogLayerVariables & {
        user: User;
        session: Session;
    };
};
