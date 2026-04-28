// HACK: non jsx version of email template to allow for vercel deployment

import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
  Preview,
} from "@react-email/components";

type ResetPasswordEmailProps = {
  url: string;
  username: string;
};

export default function ResetPasswordEmail({ url, username }: ResetPasswordEmailProps) {
  return React.createElement(
    Html,
    { lang: "en" },
    React.createElement(Head),
    React.createElement(Preview, null, "Reset your Media Watchlist password"),
    React.createElement(
      Body,
      { style: body },
      React.createElement(
        Container,
        { style: container },
        React.createElement(
          Section,
          { style: header },
          React.createElement(Text, { style: headerText }, "Media Watchlist")
        ),
        React.createElement(
          Section,
          { style: content },
          React.createElement(Text, { style: heading }, "Reset your password"),
          React.createElement(Text, { style: paragraph }, "Hi ", username, ","),
          React.createElement(
            Text,
            { style: paragraph },
            "We received a request to reset the password for your account. Click the button below to choose a new password. This link expires in 1 hour."
          ),
          React.createElement(
            Section,
            { style: buttonContainer },
            React.createElement(Button, { href: url, style: button }, "Reset password")
          ),
          React.createElement(
            Text,
            { style: paragraph },
            "If you didn't request a password reset, you can safely ignore this email. Your password will not change."
          ),
          React.createElement(Hr, { style: divider }),
          React.createElement(
            Text,
            { style: footer },
            "If the button above doesn't work, copy and paste this link into your browser:"
          ),
          React.createElement(Link, { href: url, style: link }, url)
        ),
        React.createElement(
          Section,
          { style: footerSection },
          React.createElement(
            Text,
            { style: footerText },
            "\u00a9 Chris Poulter ",
            new Date().getFullYear()
          )
        )
      )
    )
  );
}

ResetPasswordEmail.PreviewProps = {
  url: "https://example.com/reset-password?token=abc123xyz",
  username: "John Smith",
} satisfies ResetPasswordEmailProps;

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e8eaed",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  backgroundColor: "#0f172a",
  padding: "24px 40px",
};

const headerText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
};

const content: React.CSSProperties = {
  padding: "40px 40px 24px",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0 0 16px",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0",
};

const button: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 32px",
  borderRadius: "6px",
  textDecoration: "none",
};

const divider: React.CSSProperties = {
  borderColor: "#e8eaed",
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "0 0 8px",
};

const link: React.CSSProperties = {
  fontSize: "13px",
  color: "#2563eb",
  wordBreak: "break-all",
};

const footerSection: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  padding: "16px 40px",
  borderTop: "1px solid #e8eaed",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center",
  margin: "0",
};
