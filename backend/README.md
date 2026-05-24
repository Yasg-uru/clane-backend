# CreatorLane Backend Handover

This repository contains the initial backend scaffold for CreatorLane (`creatorlane.in`), an Indian influencer-marketing platform where Brands post campaigns and Creators bid and collaborate.

The current implementation intentionally covers only:

- Full backend project initialization
- End-to-end authentication for Brand and Creator users

The following features have not been built yet:

- Campaign posting
- Creator bidding
- Collaboration workflows
- Escrow
- Payments
- Admin dashboards
- Notifications beyond registration email OTP

Use this file as the handover context for any new Claude/Codex chat.

## Current Status

Implemented and verified:

- Node.js 20+ backend with TypeScript strict mode
- Express app setup
- MongoDB via Mongoose
- Redis via ioredis
- RabbitMQ via amqplib
- JWT access and refresh token authentication
- Email OTP delivery through Nodemailer SMTP
- Zod request validation
- Winston request and error logging
- Rate limiting with Redis-backed `express-rate-limit`
- Global error handling
- Graceful shutdown
- ESLint flat config
- `npm run build` passes
- `npm run lint` passes
- `npm audit --audit-level=moderate` passes with 0 vulnerabilities

## Tech Stack

| Layer | Implementation |
| --- | --- |
| Runtime | Node.js 20+ |
| Language | TypeScript strict mode |
| Framework | Express.js |
| Database | MongoDB with Mongoose |
| Cache / OTP store | Redis with ioredis |
| Message broker | RabbitMQ with amqplib |
| Auth | JWT access token + refresh token pair |
| OTP delivery | Nodemailer SMTP |
| Validation | Zod |
| Env management | dotenv + envalid |
| Logging | Winston |
| Dev runner | tsx watch |
| Linting | ESLint 9 flat config |

## Project Structure

```text
.
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   ├── redis.ts
│   │   ├── rabbitmq.ts
│   │   └── env.ts
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.routes.ts
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       ├── auth.validator.ts
│   │       └── otp.service.ts
│   ├── models/
│   │   ├── Brand.model.ts
│   │   └── Creator.model.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   ├── authenticate.ts
│   │   ├── rateLimiter.ts
│   │   └── requestLogger.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── jwt.ts
│   │   ├── mailer.ts
│   │   └── logger.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   ├── app.ts
│   ├── bootstrap.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` and update values:

```env
# App
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/creatorlane

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Cookie
COOKIE_SECRET=your_cookie_secret_here

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=app_password_here
SMTP_FROM="CreatorLane <noreply@creatorlane.in>"
```

## Setup Commands

```bash
npm install
cp .env.example .env
npm run dev
```

Useful checks:

```bash
npm run build
npm run lint
npm audit --audit-level=moderate
```

Production-style run:

```bash
npm run build
npm start
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Starts `tsx watch src/bootstrap.ts` |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs `node dist/server.js` |
| `npm run lint` | Runs ESLint over `src/**/*.ts` |

## App Bootstrap Flow

`src/bootstrap.ts` starts the app in this order:

1. Connect MongoDB through `connectDB()`
2. Connect Redis through `connectRedis()`
3. Connect RabbitMQ through `connectRabbitMQ()`
4. Start the HTTP server on `env.PORT`

Graceful shutdown handles:

- `SIGINT`
- `SIGTERM`
- `unhandledRejection`
- `uncaughtException`

Shutdown closes:

- HTTP server
- MongoDB connection
- Redis client
- RabbitMQ channel and connection

## Express App Flow

`src/app.ts` configures:

- Winston request logger
- JSON body parsing
- URL-encoded body parsing
- Cookie parser
- `GET /health`
- Auth routes at `/api/v1/auth`
- Extra strict rate limiter on `/api/v1/auth/resend-otp`
- General strict auth route limiter on `/api/v1/auth`
- 404 handler
- Global error handler

## Auth Routes

Base prefix:

```text
/api/v1/auth
```

Routes:

| Method | Route | Middleware | Purpose |
| --- | --- | --- | --- |
| `POST` | `/brand/register` | Auth rate limiter | Register Brand and send OTP |
| `POST` | `/creator/register` | Auth rate limiter | Register Creator and send OTP |
| `POST` | `/verify-otp` | Auth rate limiter | Verify email OTP and issue tokens |
| `POST` | `/login` | Auth rate limiter | Login verified user and rotate refresh token |
| `POST` | `/refresh` | Auth rate limiter | Rotate refresh token and return new access token |
| `POST` | `/logout` | Auth rate limiter + `authenticate` | Null stored refresh token and clear cookie |
| `POST` | `/resend-otp` | Resend OTP limiter + auth rate limiter | Resend OTP with cooldown |

## User Roles

Supported roles are defined in `src/types/index.ts`:

```ts
"brand" | "creator"
```

The roles are completely separate models and collections:

- `BrandModel`
- `CreatorModel`

Registration checks email uniqueness across both collections, so the same email cannot register once as Brand and once as Creator.

## Brand Model

File: `src/models/Brand.model.ts`

Fields:

- `role`: literal `"brand"`
- `fullName`: required string
- `email`: required, unique, lowercase string
- `passwordHash`: required string, excluded by default
- `city`: required string
- `brandName`: required string
- `brandType`: required string
- `instagramHandle`: optional string
- `isEmailVerified`: boolean, default `false`
- `refreshToken`: hashed refresh token, excluded by default
- timestamps

Passwords are hashed with bcryptjs using 12 salt rounds.

## Creator Model

File: `src/models/Creator.model.ts`

Fields:

- `role`: literal `"creator"`
- `fullName`: required string
- `email`: required, unique, lowercase string
- `passwordHash`: required string, excluded by default
- `city`: required string
- `instagramHandle`: required string
- `instagramFollowers`: required number
- `niche`: required non-empty string array
- `isEmailVerified`: boolean, default `false`
- `refreshToken`: hashed refresh token, excluded by default
- timestamps

Passwords are hashed with bcryptjs using 12 salt rounds.

## Response Shape

Success responses use `ApiResponse<T>` from `src/utils/ApiResponse.ts`:

```json
{
  "success": true,
  "message": "Message here",
  "data": {}
}
```

Error responses use the global handler:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

`errors` is included only when useful.

## Auth Flow Details

### Brand Registration

Endpoint:

```text
POST /api/v1/auth/brand/register
```

Body:

```json
{
  "fullName": "Riya Sharma",
  "email": "riya@brandco.in",
  "password": "Min8Chars1!",
  "city": "Mumbai",
  "brandName": "BrandCo",
  "brandType": "Fashion",
  "instagramHandle": "@brandco"
}
```

Flow:

1. Validate request with Zod.
2. Normalize email to lowercase.
3. Check email does not exist in Brand or Creator collections.
4. Hash password with bcryptjs, 12 salt rounds.
5. Save Brand with `isEmailVerified: false`.
6. Generate 6-digit OTP.
7. Store OTP in Redis at `otp:brand:{email}` with 600-second TTL.
8. Reset OTP attempts and lock keys.
9. Send OTP email through Nodemailer.
10. Publish RabbitMQ event with routing key `user.registered`.
11. Return `201` with message `OTP sent to email`.

RabbitMQ payload includes:

```json
{
  "role": "brand",
  "email": "riya@brandco.in",
  "name": "Riya Sharma",
  "brandName": "BrandCo"
}
```

### Creator Registration

Endpoint:

```text
POST /api/v1/auth/creator/register
```

Body:

```json
{
  "fullName": "Arjun Mehra",
  "email": "arjun@gmail.com",
  "password": "Min8Chars1!",
  "city": "Delhi",
  "instagramHandle": "@arjunmehra",
  "instagramFollowers": 52000,
  "niche": ["Fashion", "Lifestyle"]
}
```

Flow:

1. Validate request with Zod.
2. Normalize email to lowercase.
3. Check email does not exist in Brand or Creator collections.
4. Hash password with bcryptjs, 12 salt rounds.
5. Save Creator with `isEmailVerified: false`.
6. Generate 6-digit OTP.
7. Store OTP in Redis at `otp:creator:{email}` with 600-second TTL.
8. Reset OTP attempts and lock keys.
9. Send OTP email through Nodemailer.
10. Publish RabbitMQ event with routing key `user.registered`.
11. Return `201` with message `OTP sent to email`.

RabbitMQ payload includes:

```json
{
  "role": "creator",
  "email": "arjun@gmail.com",
  "name": "Arjun Mehra"
}
```

### Email OTP Verification

Endpoint:

```text
POST /api/v1/auth/verify-otp
```

Body:

```json
{
  "email": "riya@brandco.in",
  "otp": "482910",
  "role": "brand"
}
```

Flow:

1. Validate request with Zod.
2. Find user in the collection matching `role`.
3. Reject already verified users.
4. Check Redis lock key.
5. Check OTP exists.
6. Compare submitted OTP with Redis OTP.
7. On mismatch, increment attempt key.
8. Lock after 3 failed attempts for the remaining OTP TTL window.
9. On match, delete OTP, attempt, and lock keys.
10. Set `isEmailVerified: true`.
11. Issue access token valid for 15 minutes.
12. Issue refresh token valid for 7 days.
13. Hash refresh token with SHA-256 and store hash in DB.
14. Set refresh token cookie as `httpOnly`, `secure`, `sameSite: strict`.
15. Return access token and safe user fields.

### Login

Endpoint:

```text
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "riya@brandco.in",
  "password": "Min8Chars1!",
  "role": "brand"
}
```

Flow:

1. Validate request with Zod.
2. Find user in matching collection.
3. If not found, return `401 Invalid credentials`.
4. If email is not verified, return `403 Email not verified`.
5. Compare password with bcryptjs.
6. If mismatch, return `401 Invalid credentials`.
7. Issue new access and refresh token pair.
8. Hash and store new refresh token, replacing the old token hash.
9. Set refresh token cookie.
10. Return access token and safe user fields.

### Refresh Token

Endpoint:

```text
POST /api/v1/auth/refresh
```

Flow:

1. Read `refreshToken` from httpOnly cookie.
2. Verify with `JWT_REFRESH_SECRET`.
3. Use JWT `role` claim to select Brand or Creator collection.
4. Find user by `userId`.
5. Compare SHA-256 hash of incoming token against stored `refreshToken`.
6. If valid, issue new access and refresh token pair.
7. Store new hashed refresh token.
8. Update refresh token cookie.
9. Return new access token.

### Logout

Endpoint:

```text
POST /api/v1/auth/logout
```

Headers:

```text
Authorization: Bearer <access_token>
```

Flow:

1. `authenticate` verifies access token.
2. Service uses `req.user.role` and `req.user.userId`.
3. Set `refreshToken` to `null` in DB.
4. Clear refresh token cookie.
5. Return `200 Logged out`.

### Resend OTP

Endpoint:

```text
POST /api/v1/auth/resend-otp
```

Body:

```json
{
  "email": "riya@brandco.in",
  "role": "brand"
}
```

Flow:

1. Validate request with Zod.
2. Find user by role and email.
3. Reject if user does not exist.
4. Reject if email is already verified.
5. Check cooldown key `otp:cooldown:{role}:{email}`.
6. If cooldown exists, return `429`.
7. Generate new OTP.
8. Store OTP for 600 seconds.
9. Reset attempts and lock keys.
10. Set cooldown key for 60 seconds.
11. Send OTP email.
12. Return `200 OTP resent`.

## Redis Keys

| Key | Purpose | TTL |
| --- | --- | --- |
| `otp:{role}:{email}` | Stores 6-digit OTP | 600 seconds |
| `otp:attempts:{role}:{email}` | Tracks failed OTP attempts | 600 seconds |
| `otp:lock:{role}:{email}` | Locks verification after 3 failed attempts | 600 seconds |
| `otp:cooldown:{role}:{email}` | Resend OTP cooldown | 60 seconds |

## JWT Details

File: `src/utils/jwt.ts`

Access token:

- Signed with `JWT_ACCESS_SECRET`
- Expires in 15 minutes
- Sent in response body
- Used in `Authorization: Bearer <token>`

Refresh token:

- Signed with `JWT_REFRESH_SECRET`
- Expires in 7 days
- Stored in httpOnly secure strict cookie named `refreshToken`
- SHA-256 hash stored in DB
- Rotated on login and refresh

JWT payload:

```ts
{
  userId: string;
  role: "brand" | "creator";
  email: string;
}
```

## RabbitMQ Details

File: `src/config/rabbitmq.ts`

Connection behavior:

- Connects on startup.
- Retries up to 5 times.
- Uses exponential backoff: 1s, 2s, 4s, 8s, 16s.
- Creates durable topic exchange named `creatorlane.events`.

Publishing helper:

```ts
publishEvent(routingKey: string, payload: object): boolean
```

Current event:

```text
routingKey: user.registered
exchange: creatorlane.events
```

Used after successful Brand or Creator registration.

## Middleware

### `authenticate.ts`

- Reads `Authorization: Bearer <token>`
- Verifies access token
- Attaches `req.user = { userId, role, email }`
- Fails with `401 Unauthorized`

### `errorHandler.ts`

Handles:

- `ApiError`
- Mongoose validation errors
- Mongoose cast errors
- MongoDB duplicate key errors (`11000`)
- Zod errors
- JWT expired errors
- JWT invalid errors
- Generic errors

Logs full error details with Winston and returns JSON only.

### `rateLimiter.ts`

Uses `express-rate-limit` with `rate-limit-redis`.

Configured limits:

- Auth routes: 10 requests per 15 minutes per IP
- Resend OTP: 3 requests per 15 minutes per IP

### `requestLogger.ts`

Logs every request as:

```text
METHOD URL STATUS response_time_ms
```

## Utilities

| File | Purpose |
| --- | --- |
| `ApiError.ts` | Custom error class with `statusCode` and `errors` |
| `ApiResponse.ts` | Standard success response wrapper |
| `asyncHandler.ts` | Wraps async route handlers and forwards errors |
| `jwt.ts` | Signs and verifies access/refresh tokens |
| `mailer.ts` | Nodemailer transporter and OTP email sender |
| `logger.ts` | Winston logger instance |

## Validation

File: `src/modules/auth/auth.validator.ts`

Implemented schemas:

- `brandRegisterSchema`
- `creatorRegisterSchema`
- `verifyOtpSchema`
- `loginSchema`
- `resendOtpSchema`

Validation behavior:

- Emails are trimmed and lowercased.
- Passwords must be at least 8 characters.
- Passwords must include uppercase, lowercase, number, and special character.
- OTP must be exactly 6 digits.
- Role must be `brand` or `creator`.
- Creator niche must be a non-empty array.
- Creator followers must be a non-negative integer.

## Security Notes

- Passwords are never returned in API responses.
- `passwordHash` is excluded from Mongoose queries by default.
- Refresh token hashes are stored, not raw refresh tokens.
- Refresh tokens are rotated on login and refresh.
- Refresh token cookies are `httpOnly`, `secure`, and `sameSite: strict`.
- Login does not reveal whether email or password was wrong.
- Email uniqueness is enforced across both user roles at service level.
- Mongoose unique indexes also exist per collection.
- OTP attempts are capped at 3.
- Resend OTP has both rate limiting and Redis cooldown.

## Important Implementation Notes For Next Chat

- Controllers only parse requests, call service methods, set cookies, and send responses.
- Database calls live in `auth.service.ts`.
- All async route handlers use `asyncHandler`.
- `logout` requires a valid access token.
- `refresh` reads only from the cookie and does not require `Authorization`.
- RabbitMQ must be connected before registration calls can publish events.
- Redis must be connected before auth rate limiting and OTP flows work.
- The health endpoint is `GET /health`.
- Cookie `secure: true` means local HTTP clients may not store the refresh cookie unless using HTTPS or a compatible test setup.

## Suggested Manual Test Order

1. Start MongoDB, Redis, and RabbitMQ locally.
2. Fill `.env`.
3. Start backend with `npm run dev`.
4. Call `GET /health`.
5. Register Brand.
6. Check OTP email delivery.
7. Verify Brand OTP.
8. Use returned access token on logout or protected route.
9. Register Creator.
10. Verify Creator OTP.
11. Test login for both roles.
12. Test refresh token rotation.
13. Test resend OTP cooldown.
14. Test invalid OTP lock after 3 failed attempts.

## Example cURL Requests

Brand registration:

```bash
curl -X POST http://localhost:5000/api/v1/auth/brand/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Riya Sharma",
    "email": "riya@brandco.in",
    "password": "Min8Chars1!",
    "city": "Mumbai",
    "brandName": "BrandCo",
    "brandType": "Fashion",
    "instagramHandle": "@brandco"
  }'
```

Creator registration:

```bash
curl -X POST http://localhost:5000/api/v1/auth/creator/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Arjun Mehra",
    "email": "arjun@gmail.com",
    "password": "Min8Chars1!",
    "city": "Delhi",
    "instagramHandle": "@arjunmehra",
    "instagramFollowers": 52000,
    "niche": ["Fashion", "Lifestyle"]
  }'
```

Verify OTP:

```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "riya@brandco.in",
    "otp": "482910",
    "role": "brand"
  }'
```

Login:

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "riya@brandco.in",
    "password": "Min8Chars1!",
    "role": "brand"
  }'
```

Refresh:

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

Logout:

```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE" \
  -b cookies.txt
```

Resend OTP:

```bash
curl -X POST http://localhost:5000/api/v1/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "riya@brandco.in",
    "role": "brand"
  }'
```

## Handover Prompt For New Claude Chat

Use this prompt when starting a new Claude chat:

```text
We are working on the CreatorLane backend in Node.js, TypeScript, Express, MongoDB, Redis, and RabbitMQ.

The current scope already completed is project initialization and end-to-end auth for two separate roles: Brand and Creator. Do not rebuild it from scratch. Read README.md first, then inspect src/.

Implemented:
- Express app and server setup
- MongoDB/Redis/RabbitMQ config with retry and shutdown
- Brand and Creator Mongoose models
- Auth validators with Zod
- OTP service with Redis TTL, attempts, lock, and resend cooldown
- Auth service for brand register, creator register, verify OTP, login, refresh, logout, resend OTP
- JWT utilities for access and refresh tokens
- Nodemailer OTP email sender
- Auth middleware
- Request logger
- Redis-backed rate limiters
- Global error handler
- TypeScript strict config
- ESLint flat config

Important constraints:
- Keep Brand and Creator auth separate.
- Do not add campaign, bidding, escrow, or payment logic unless explicitly asked.
- Keep DB calls in service layer.
- Keep controllers thin.
- Never return passwordHash or refreshToken.
- Store only SHA-256 hash of refresh tokens.
- Use asyncHandler for route handlers.
- Preserve existing response shape.

Verification already passed:
- npm run build
- npm run lint
- npm audit --audit-level=moderate
```

## Next Logical Backend Tasks

Only do these when requested:

- Add automated tests for auth service and routes.
- Add Docker Compose for MongoDB, Redis, and RabbitMQ.
- Add CI workflow for build/lint/test.
- Add OpenAPI/Swagger docs.
- Add password reset flow.
- Add email verification re-send templates and branded email styling.
- Add campaign module after auth is approved.
