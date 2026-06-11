import "dotenv/config";
import { cleanEnv, makeValidator, num, port, str, url } from "envalid";

// [CRITICAL] JWT/cookie secrets must be at least 32 chars to be cryptographically safe.
const secret = makeValidator<string>((value) => {
  if (value.length < 32) {
    throw new Error("Must be at least 32 characters");
  }
  return value;
});

// [CRITICAL] AES-256-GCM requires a 32-byte key — stored as 64 lowercase hex chars.
const hexKey32 = makeValidator<string>((value) => {
  if (!/^[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("Must be a 64-character hex string (32 bytes for AES-256-GCM)");
  }
  return value.toLowerCase();
});

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
  PORT: port({ default: 5000 }),
  MONGO_URI: url(),
  REDIS_URL: url(),
  RABBITMQ_URL: str(),
  JWT_ACCESS_SECRET: secret(),
  JWT_REFRESH_SECRET: secret(),
  COOKIE_SECRET: secret(),
  ALLOWED_ORIGINS: str({ default: "http://localhost:3000" }),
  SMTP_HOST: str(),
  SMTP_PORT: port({ default: 587 }),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  SMTP_FROM: str(),
  // Google OAuth
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_REDIRECT_URI_BRAND: url(),
  GOOGLE_REDIRECT_URI_CREATOR: url(),
  // Instagram OAuth (Meta Graph API)
  INSTAGRAM_APP_ID: str(),
  INSTAGRAM_APP_SECRET: str(),
  INSTAGRAM_REDIRECT_URI_BRAND: url(),
  INSTAGRAM_REDIRECT_URI_CREATOR: url(),
  // AES-256-GCM key for encrypting all social access tokens at rest
  INSTAGRAM_TOKEN_ENCRYPTION_KEY: hexKey32(),
  // YouTube OAuth — reuses Google OAuth client, needs separate callback URI
  YOUTUBE_REDIRECT_URI_CREATOR: url(),
  // Razorpay
  RAZORPAY_KEY_ID: str(),
  RAZORPAY_KEY_SECRET: str(),
  RAZORPAY_WEBHOOK_SECRET: str(),
  RAZORPAY_ACCOUNT_NUMBER: str(),
  PAYMENT_TIMEOUT_HOURS: num({ default: 24 }),
  FRONTEND_PAYMENT_URL: url(),
  FRONTEND_URL: url({ default: "http://localhost:3000" }),
});
