import cors, { FastifyCorsOptions } from '@fastify/cors';

export const autoConfig: FastifyCorsOptions = {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
};

export default cors;
