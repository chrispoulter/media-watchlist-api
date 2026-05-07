import type { OpenAPIV3 } from 'openapi-types';
import { version } from './lib/config.js';

export const openApiSpec: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
        title: 'Media Watchlist API',
        version,
        description: 'REST API for managing a personal media watchlist.',
    },
    servers: [{ url: '/' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                description: 'Session token returned by sign-in endpoints.',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string' },
                    details: {
                        type: 'array',
                        items: { type: 'object' },
                        nullable: true,
                    },
                },
                required: ['error'],
            },
            Healthcheck: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['ok', 'unhealthy'] },
                    version: { type: 'string', example: '1.0.0' },
                    environment: { type: 'string', example: 'production' },
                    uptime: {
                        type: 'number',
                        description: 'Process uptime in seconds',
                    },
                    services: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                status: {
                                    type: 'string',
                                    enum: ['ok', 'unhealthy'],
                                },
                            },
                            required: ['name', 'status'],
                        },
                    },
                },
                required: [
                    'status',
                    'version',
                    'environment',
                    'uptime',
                    'services',
                ],
            },
            SearchResult: {
                type: 'object',
                properties: {
                    providerId: { type: 'string' },
                    mediaType: { type: 'string', enum: ['movie', 'tv-show'] },
                    title: { type: 'string' },
                    posterUrl: { type: 'string', nullable: true },
                    overview: { type: 'string', nullable: true },
                    releaseDate: { type: 'string', nullable: true },
                    watchlistItemId: { type: 'integer', nullable: true },
                },
                required: ['providerId', 'mediaType'],
            },
            WatchlistItem: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    providerId: { type: 'string' },
                    mediaType: { type: 'string', enum: ['movie', 'tv-show'] },
                    title: { type: 'string' },
                    posterUrl: { type: 'string', nullable: true },
                    overview: { type: 'string', nullable: true },
                    releaseDate: { type: 'string', nullable: true },
                    addedAt: { type: 'string', format: 'date-time' },
                },
                required: ['id', 'providerId', 'mediaType', 'title'],
            },
            AddWatchlistItemRequest: {
                type: 'object',
                properties: {
                    providerId: { type: 'string', example: 'tmdb:1396' },
                    mediaType: {
                        type: 'string',
                        enum: ['movie', 'tv-show'],
                        example: 'tv-show',
                    },
                    title: { type: 'string', example: 'Breaking Bad' },
                    posterUrl: {
                        type: 'string',
                        example:
                            'https://image.tmdb.org/t/p/w300/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
                    },
                    overview: {
                        type: 'string',
                        example: 'A high school chemistry teacher...',
                    },
                    releaseDate: { type: 'string', example: '2008-01-20' },
                },
                required: ['providerId', 'mediaType', 'title'],
            },
        },
    },
    tags: [
        { name: 'Health', description: 'Service health check' },
        { name: 'Search', description: 'Search for movies and TV shows' },
        {
            name: 'Watchlist',
            description: 'Manage your personal media watchlist',
        },
    ],
    paths: {
        // ── Health ───────────────────────────────────────────────────────────────
        '/api/health': {
            get: {
                tags: ['Health'],
                summary: 'Health check',
                responses: {
                    '200': {
                        description: 'All services are healthy.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Healthcheck',
                                },
                            },
                        },
                    },
                    '503': {
                        description: 'One or more services are unhealthy.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Healthcheck',
                                },
                            },
                        },
                    },
                },
            },
        },

        // ── Search ───────────────────────────────────────────────────────────────
        '/api/search': {
            get: {
                tags: ['Search'],
                summary: 'Search for movies and TV shows',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'query',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', minLength: 1 },
                        description: 'Search query string.',
                        example: 'Breaking Bad',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Search results.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/SearchResult',
                                    },
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid request query.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Unauthorized.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal Server Error.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
        },

        // ── Watchlist ────────────────────────────────────────────────────────────
        '/api/watchlist': {
            get: {
                tags: ['Watchlist'],
                summary: 'Get all watchlist items for the current user',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'List of watchlist items.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/WatchlistItem',
                                    },
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Unauthorized.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal Server Error.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Watchlist'],
                summary: 'Add an item to the watchlist',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/AddWatchlistItemRequest',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Item added to watchlist.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/WatchlistItem',
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid request body.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Unauthorized.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '409': {
                        description: 'Item already exists in watchlist.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '429': {
                        description: 'Watchlist limit of items reached.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal Server Error.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/watchlist/{id}': {
            delete: {
                tags: ['Watchlist'],
                summary: 'Remove an item from the watchlist',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'Watchlist item ID.',
                        example: 42,
                    },
                ],
                responses: {
                    '204': { description: 'Item removed.' },
                    '400': {
                        description: 'Invalid request parameters.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '401': {
                        description: 'Unauthorized.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Item not found in watchlist.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal Server Error.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Error',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
