import type { ReactElement } from 'react';
import nodemailer from 'nodemailer';
import { render } from 'react-email';
import { config } from './config.js';
import { logger } from './logger.js';

const mailer = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
});

export const shutdown = () => mailer.close();

export const check = async (): Promise<{
    service: string;
    status: 'ok' | 'unhealthy';
}> => {
    try {
        await mailer.verify();
        return { service: 'mailer', status: 'ok' };
    } catch (err) {
        logger.error(
            { error: err instanceof Error ? err.message : err },
            'Mailer health check failed'
        );

        return {
            service: 'mailer',
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
    return mailer.sendMail({ from: config.SMTP_FROM, to, subject, html });
};
