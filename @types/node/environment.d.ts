declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            LOG_LEVEL: string;
            FASTIFY_CLOSE_GRACE_DELAY: number;
            DATABASE_URL: string;
            BETTER_AUTH_SECRET: string;
            BETTER_AUTH_URL: string;
            CLIENT_ORIGIN: string;
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
            TMDB_API_READ_TOKEN: string;
            SMTP_HOST: string;
            SMTP_PORT: number;
            SMTP_SECURE: string;
            SMTP_FROM: string;
            SMTP_USER: string;
            SMTP_PASS: string;
        }
    }
}

export {};
