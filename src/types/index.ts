export interface ErrorResponse {
    error: string;
    details?: object[];
}

export interface HealthStatus {
    name: string;
    status: 'ok' | 'unhealthy';
}
