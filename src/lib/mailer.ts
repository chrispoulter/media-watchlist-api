import type { ReactElement } from 'react';
import nodemailer from 'nodemailer';
import { render } from 'react-email';
import type { HealthStatus } from '../types/health.js';
import { config } from './config.js';
import { logger } from './logger.js';

const mailer = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth:
        config.SMTP_USER && config.SMTP_PASS
            ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
            : undefined,
});

export const shutdown = () => mailer.close();

export const check = async (): Promise<HealthStatus> => {
    try {
        await mailer.verify();
        return { name: 'mailer', status: 'ok' };
    } catch (err) {
        logger.error(
            { error: err instanceof Error ? err.message : err },
            'Mailer health check failed'
        );

        return {
            name: 'mailer',
            status: 'unhealthy',
        };
    }
};

interface SendMailOptions {
    to: string;
    subject: string;
    template: ReactElement;
}

export const sendMail = async ({ to, subject, template }: SendMailOptions) => {
    const html = await render(template);

    try {
        await mailer.sendMail({
            from: config.SMTP_FROM,
            to,
            subject,
            html,
        });
    } catch (err) {
        logger.error(
            { error: err instanceof Error ? err.message : err },
            'Mail sending failed'
        );
    }
};
