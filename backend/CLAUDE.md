# CreatorLane Backend Context

Read `README.md` first. It is the full handover document for this backend initialization and authentication implementation.

Current completed scope:

- Project scaffold for CreatorLane backend
- Express + TypeScript strict setup
- MongoDB, Redis, and RabbitMQ connection modules
- Brand and Creator auth models
- Registration, OTP verification, login, refresh, logout, and resend OTP
- JWT access/refresh token flow with hashed stored refresh tokens
- Redis-backed OTP storage, attempts, locks, cooldowns, and rate limiting
- Nodemailer OTP email delivery
- Winston logging, global error handling, graceful shutdown

Important constraints:

- Do not add campaign, bidding, escrow, or payment logic unless explicitly requested.
- Keep controllers thin and database logic in service files.
- Never return `passwordHash` or `refreshToken`.
- Preserve the existing auth response shape and route prefix `/api/v1/auth`.
