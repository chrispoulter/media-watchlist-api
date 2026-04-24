import type { ReactElement } from "react";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { type HealthcheckResult } from "./health.js";
import { logger } from "./logger.js";
import { env } from "../env.js";

export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  connectionTimeout: 3_000,
  greetingTimeout: 3_000,
});

export const healthCheck = async (): Promise<HealthcheckResult> => {
  try {
    await mailer.verify();
    return { service: "mailer", success: true };
  } catch (err) {
    logger.error({ error: err instanceof Error ? err.message : err }, "Mailer health check failed");

    return {
      service: "mailer",
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
  return mailer.sendMail({ from: env.SMTP_FROM, to, subject, html });
};
