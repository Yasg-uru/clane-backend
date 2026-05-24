import type { JwtPayload } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      oauthSession?: { sessionId: string };
    }
  }
}

export {};
