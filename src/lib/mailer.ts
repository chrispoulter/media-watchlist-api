import type { ReactElement } from 'react';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { type HealthcheckResult } from './health.js';

export const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
});

export const shutdown = () => mailer.close();

export const healthCheck = async (): Promise<HealthcheckResult> => {
    try {
        await mailer.verify();
        return { service: 'mailer', success: true };
    } catch (err) {
        console.error(
            { error: err instanceof Error ? err.message : err },
            'Mailer health check failed'
        );

        return {
            service: 'mailer',
            success: false,
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
    return mailer.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
};
