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

ResetPasswordEmail.PreviewProps = {
  url: "https://example.com/reset-password?token=abc123xyz",
  username: "Jane Smith",
} satisfies ResetPasswordEmailProps;

export default function ResetPasswordEmail({ url, username }: ResetPasswordEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your Media Watchlist password</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>Media Watchlist</Text>
          </Section>

          <Section style={content}>
            <Text style={heading}>Reset your password</Text>
            <Text style={paragraph}>Hi {username},</Text>
            <Text style={paragraph}>
              We received a request to reset the password for your account. Click the button below
              to choose a new password. This link expires in 1 hour.
            </Text>

            <Section style={buttonContainer}>
              <Button href={url} style={button}>
                Reset password
              </Button>
            </Section>

            <Text style={paragraph}>
              If you didn&apos;t request a password reset, you can safely ignore this email. Your
              password will not change.
            </Text>

            <Hr style={divider} />

            <Text style={footer}>
              If the button above doesn&apos;t work, copy and paste this link into your browser:
            </Text>
            <Link href={url} style={link}>
              {url}
            </Link>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} Media Watchlist. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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
