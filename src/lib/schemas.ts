import { z } from '@hono/zod-openapi';

export const errorSchema = z
    .object({
        error: z.string(),
        details: z
            .array(z.record(z.string(), z.unknown()))
            .nullable()
            .optional(),
    })
    .openapi('Error');
