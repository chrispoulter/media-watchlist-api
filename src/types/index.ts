import { z } from 'zod';

export const mediaTypeSchema = z.enum(['movie', 'tv-show']);

export type MediaType = z.infer<typeof mediaTypeSchema>;

export interface ErrorResponse {
    error: string;
    details?: object[];
}

export interface HealthStatus {
    name: string;
    status: 'ok' | 'unhealthy';
}
