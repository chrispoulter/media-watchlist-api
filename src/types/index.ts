import { z } from 'zod';

export type HealthStatus = {
    name: string;
    status: 'ok' | 'unhealthy';
    message?: string;
};

export const errorResponseSchema = z.object({
    error: z.string(),
    details: z.unknown().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const mediaTypeSchema = z.enum(['movie', 'tv-show']);

export type MediaType = z.infer<typeof mediaTypeSchema>;
