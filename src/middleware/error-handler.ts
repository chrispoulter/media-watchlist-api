import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    req.log.error({ err, userId: req.user?.id }, 'Unhandled error');
    res.status(500).json({ error: 'Internal Server Error' });
};
