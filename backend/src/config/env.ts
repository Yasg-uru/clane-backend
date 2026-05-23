import "dotenv/config";
import { cleanEnv, makeValidator, port, str, url } from "envalid";

// [CRITICAL] JWT/cookie secrets must be at least 32 chars to be cryptographically safe.
const secret = makeValidator<string>((value) => {
  if (value.length < 32) {
    throw new Error("Must be at least 32 characters");
  }
  return value;
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
});
