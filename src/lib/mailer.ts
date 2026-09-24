import nodemailer from 'nodemailer';
import type { ReactElement } from 'react';
import { render } from 'react-email';
import { getLogger } from '@logtape/logtape';
import type { HealthStatus } from '../types/index.js';
import { config } from './config.js';

const logger = getLogger(['api', 'mailer']);

const mailer = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth:
        config.SMTP_USER && config.SMTP_PASS
            ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
            : undefined,
});

export const shutdown = () => Promise.resolve(mailer.close());

export const check = async (): Promise<HealthStatus> => {
    try {
        await mailer.verify();
        return { name: 'mailer', status: 'ok' };
    } catch (err) {
        logger.error('Mailer health check failed {*}', { err });
        return { name: 'mailer', status: 'unhealthy' };
    }
};

interface MailMessage {
    to: string;
    subject: string;
    template: ReactElement;
}

export const sendMail = async ({ to, subject, template }: MailMessage) => {
    const html = await render(template);

    try {
        await mailer.sendMail({
            from: config.SMTP_FROM,
            to,
            subject,
            html,
        });
    } catch (err) {
        logger.error('Mail sending failed {*}', { err });
    }
};
