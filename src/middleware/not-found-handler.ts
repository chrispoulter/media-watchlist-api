import type { Request, Response } from 'express';
import type { ErrorResponse } from '../types/index.js';

export const notFoundHandler = (req: Request, res: Response) => {
    req.log.warn({ path: req.path }, 'Request to unknown endpoint');
    res.status(404).json({ error: 'Not Found' } satisfies ErrorResponse);
};
