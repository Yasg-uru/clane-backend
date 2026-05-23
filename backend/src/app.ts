import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { authRateLimiter, resendOtpRateLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import { requestLogger } from "./middlewares/requestLogger";
import { authRoutes } from "./modules/auth/auth.routes";
import { ApiResponse } from "./utils/ApiResponse";

export const app = express();

// [HIGH] Trust the first proxy hop so req.ip reflects the real client IP behind a load balancer.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(requestLogger);
// [HIGH] Constrain body sizes to prevent payload-flooding / DoS.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser(env.COOKIE_SECRET));

app.get("/health", (_req, res) => {
  res.status(200).json(
    new ApiResponse("OK", {
      service: "creatorlane-backend",
    }),
  );
});

app.use("/api/v1/auth/resend-otp", resendOtpRateLimiter);
app.use("/api/v1/auth", authRateLimiter, authRoutes);

app.use(notFound);
app.use(errorHandler);
