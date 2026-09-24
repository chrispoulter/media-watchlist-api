import type { ErrorHandler } from 'hono';
import { getLogger } from '@logtape/logtape';
import type { ErrorResponse } from '../types/index.js';

const logger = getLogger(['api', 'error-handler']);

export const errorHandler: ErrorHandler = (err, c) => {
    logger.error('Unhandled error {*}', { err });
    return c.json<ErrorResponse>({ error: 'Internal Server Error' }, 500);
};
