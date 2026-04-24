import type { ReactElement } from "react";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { type HealthcheckResult } from "./health.js";
import { withTimeout } from "./with-timeout.js";
import { env } from "../env.js";

export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export const healthCheck = async (): Promise<HealthcheckResult> => {
  const start = Date.now();
  try {
    await withTimeout(() => mailer.verify());
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: "error",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
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
