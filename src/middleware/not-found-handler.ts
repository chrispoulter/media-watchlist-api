import type { NotFoundHandler } from 'hono';
import { getLogger } from '@logtape/logtape';
import { ErrorResponse } from '../types/index.js';

const logger = getLogger(['api', 'not-found-handler']);

export const notFoundHandler: NotFoundHandler = (c) => {
    logger.warn('Request to unknown endpoint {path}', { path: c.req.path });
    return c.json<ErrorResponse>({ error: 'Not Found' }, 404);
};
