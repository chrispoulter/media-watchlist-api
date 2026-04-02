import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";
import { createElement } from "react";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { env } from "../env.js";
import { sendMail } from "./mailer.js";
import ForgotPasswordEmail from "../emails/forgot-password.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.CLIENT_ORIGIN.split(","),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        template: createElement(ForgotPasswordEmail, { username: user.name, url }),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    twoFactor({
      issuer: "Media Watchlist",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
