import type { Hook } from '@hono/zod-openapi';
import type { ErrorResponse } from '../types/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validationHook: Hook<any, any, any, any> = (result, c) => {
    if (result.success) {
        return;
    }

    return c.json<ErrorResponse>(
        {
            error: 'Validation failed',
            details: result.error.issues,
        },
        400
    );
};
