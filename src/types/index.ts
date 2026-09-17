export type MediaType = 'movie' | 'tv-show';

export interface ErrorResponse {
    error: string;
    details?: object[];
}

export interface HealthStatus {
    name: string;
    status: 'ok' | 'unhealthy';
}
