import type { ReactElement } from "react";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { env } from "../env.js";

const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

type SendMailOptions = {
  to: string;
  subject: string;
  template: ReactElement;
};

export const sendMail = async ({ to, subject, template }: SendMailOptions) => {
  const html = await render(template);
  return mailer.sendMail({ from: env.SMTP_FROM, to, subject, html });
};
