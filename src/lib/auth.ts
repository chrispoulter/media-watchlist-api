import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor, openAPI } from 'better-auth/plugins';
import { createElement } from 'react';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { config } from './config.js';
import { sendMail } from './mailer.js';

import ResetPasswordEmail from '../emails/reset-password-email.js';
import VerificationEmail from '../emails/verification-email.js';

export const auth = betterAuth({
    baseURL: {
        allowedHosts: config.BETTER_AUTH_URL.split(','),
        fallback: config.BETTER_AUTH_URL.split(',')[0],
    },
    secret: config.BETTER_AUTH_SECRET,
    trustedOrigins: config.CLIENT_ORIGIN.split(','),
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema,
    }),
    user: {
        changeEmail: {
            enabled: true,
        },
        deleteUser: {
            enabled: true,
        },
    },
    account: {
        accountLinking: {
            allowDifferentEmails: true,
        },
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await sendMail({
                to: user.email,
                subject: 'Reset your password | Media Watchlist',
                template: createElement(ResetPasswordEmail, {
                    username: user.name,
                    url,
                }),
            });
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendMail({
                to: user.email,
                subject: 'Verify your email address | Media Watchlist',
                template: createElement(VerificationEmail, {
                    username: user.name,
                    url,
                }),
            });
        },
    },
    socialProviders: {
        google: {
            enabled: !!config.GOOGLE_CLIENT_ID && !!config.GOOGLE_CLIENT_SECRET,
            clientId: config.GOOGLE_CLIENT_ID ?? '',
            clientSecret: config.GOOGLE_CLIENT_SECRET ?? '',
        },
    },
    plugins: [
        twoFactor({
            issuer: 'Media Watchlist',
        }),
        openAPI({
            disableDefaultReference: true,
        }),
    ],
    advanced: {
        defaultCookieAttributes: {
            sameSite: 'none',
            secure: true,
        },
    },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
