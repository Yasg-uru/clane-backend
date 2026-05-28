# CreatorLane Backend — Claude Context

CreatorLane (`creatorlane.in`) is an Indian influencer-marketing platform. Brands post campaigns; Creators bid and collaborate. Stack: Node.js 20+, TypeScript strict, Express 5, MongoDB (Mongoose), Redis (ioredis), RabbitMQ (amqplib).

---

## Commands

```bash
npm run dev        # tsx watch src/server.ts — hot reload
npm run build      # tsc — must pass before any task is done
npm run lint       # eslint src --ext .ts — must pass before any task is done
npm start          # node dist/server.js — production entry
npm audit --audit-level=moderate   # must stay at 0 vulnerabilities
```

Always run `npm run build && npm run lint` after any non-trivial change. Both must be clean.

---

## Directory Layout

```
src/
  config/
    env.ts                      Envalid validation — unchanged, not a class.
    DatabaseConnection.ts       Singleton — wraps mongoose.
    RedisClient.ts              Singleton — wraps ioredis.
    RabbitMQConnection.ts       Singleton — wraps amqplib.
    index.ts                    Re-exports all four above.

  core/
    errors/
      AppError.ts               Base throwable class (statusCode, isOperational, code?).
      AuthError.ts              401
      ForbiddenError.ts         403
      NotFoundError.ts          404
      ValidationError.ts        400
      ConflictError.ts          409
      UnprocessableError.ts     422
      RateLimitError.ts         429
      ServiceUnavailableError.ts  503
    responses/
      ApiResponse.ts            Generic success wrapper (+ static factory).
      ApiError.ts               Error response builder used by ErrorHandlerMiddleware.
    interfaces/
      IRepository.ts            Core CRUD contract (findById, create, updateById, deleteById).
      IAuthRepository.ts        Extends IRepository — adds auth methods (findByEmail, findByEmailWithSecrets, findByIdWithRefreshToken, emailExists). Implemented only by BrandRepository and CreatorRepository.
      IAuthStrategy.ts          Strategy pattern — authenticate(credentials).
      ITokenService.ts          Token sign/verify/hash/blacklist.
      IOtpService.ts            OTP generate/verify/lock/cooldown.
      IEmailService.ts          sendOtp(to, otp).
      IEventPublisher.ts        publish(routingKey, payload).
    types/
      index.ts                  Shared domain types (UserRole, JwtPayload, SafeUser, AuthDocument …).
      express.d.ts              Express Request augmentation (req.user).

  infrastructure/
    repositories/
      BaseRepository.ts         Abstract generic repository — core CRUD + protected buildPaginatedResult<U>().
      BrandRepository.ts        extends BaseRepository<BrandDocument> + implements IAuthRepository methods.
      CreatorRepository.ts      extends BaseRepository<CreatorDocument> + implements IAuthRepository methods.
    services/
      TokenService.ts           implements ITokenService — owns all JWT + blacklist logic.
      OtpService.ts             implements IOtpService — owns all Redis OTP logic.
      EmailService.ts           implements IEmailService — owns Nodemailer.
      EventPublisher.ts         implements IEventPublisher — owns RabbitMQ publish.
    middleware/
      AuthMiddleware.ts         authenticate bound arrow method.
      RateLimiterMiddleware.ts  auth + resendOtp rate-limit instances.
      ErrorHandlerMiddleware.ts handle bound error-handler method.
      NotFoundMiddleware.ts     handle bound 404 method.
      RequestLoggerMiddleware.ts handle bound request logger.

  models/
    Brand.model.ts              Mongoose schema + IBrand interface + BrandDocument type.
    Creator.model.ts            Mongoose schema + ICreator interface + CreatorDocument type.

  modules/
    auth/
      strategies/
        EmailPasswordStrategy.ts  implements IAuthStrategy — bcrypt compare.
      BaseAuthService.ts          Abstract — holds all shared auth logic.
      BrandAuthService.ts         extends BaseAuthService — register + repo wiring.
      CreatorAuthService.ts       extends BaseAuthService — register + repo wiring.
      AuthController.ts           Thin controller class — bound arrow handlers.
      auth.routes.ts              Factory: createAuthRouter(controller, authMiddleware).
      auth.validator.ts           Zod schemas + inferred types. Unchanged.
      auth.types.ts               AuthResult, RefreshResult — module-local types.

  workers/
    BaseWorker.ts               Abstract — Template Method for RabbitMQ consumers. Subclasses declare queueName, exchangeName, routingKey (string or string[]), prefetch, and implement handleMessage(msg).
    *.Worker.ts                 All workers extend BaseWorker. Never duplicate start/stop/channel boilerplate.

  jobs/
    BaseJob.ts                  Abstract — Template Method for cron-style jobs. Subclasses declare intervalMs and implement run(): Promise<void>.
    *.Job.ts                    All jobs extend BaseJob. Never duplicate setInterval/clearInterval boilerplate.

  utils/
    asyncHandler.ts             Wraps async route handlers, forwards errors.
    logger.ts                   Winston logger singleton — use this, never console.log.
    crypto.ts                   AES-256-GCM encrypt/decrypt for Instagram tokens.
    requestParam.ts             toParam(val) — extracts a single string param from Express req.params or req.query. Import in all controllers instead of defining locally.

  app.ts                        class App — Express wiring + route mounting.
  server.ts                     class Server + COMPOSITION ROOT (all new calls live here).
```

---

## Where Code Lives — The Deciding Rule

**"Is this infrastructure that multiple modules share?"**
- Yes → `src/infrastructure/` — repositories, services, middleware classes.

**"Is this a cross-cutting concern (error class, interface, shared type)?"**
- Yes → `src/core/` — errors, interfaces, responses, types.

**"Is this a truly global utility function used by two or more modules?"**
- Yes → `src/utils/<name>.ts` (e.g. `asyncHandler`, `logger`, `crypto`).

**"Is this business logic for a specific module?"**
- Yes → `src/modules/<feature>/` — service class, controller class, routes factory, validator.

**"Is this a type used only within one module?"**
- Yes → `src/modules/<feature>/<feature>.types.ts`.

**"Is this a shared domain type (used across modules or by infra)?"**
- Yes → `src/core/types/index.ts`.

**One rule that never changes:** All `new` calls for non-trivial classes live only in `src/server.ts` (the composition root). No class instantiates its own dependencies internally.

---

## Layer Rules — Non-Negotiable

### Config Singletons (`src/config/`)

- `DatabaseConnection`, `RedisClient`, `RabbitMQConnection` follow the strict Singleton pattern: private constructor, private static `instance`, public static `getInstance()`.
- Callers never import `ioredis`, `mongoose`, or `amqplib` directly — they use the singleton class methods.
- `RedisClient` exposes typed methods: `get`, `set`, `del`, `exists`, `incr`, `expire`, `sendCommand`. No ioredis methods leak out.

### Repositories (`src/infrastructure/repositories/`)

- The only layer allowed to import Mongoose models.
- `BaseRepository<T>` is an abstract class. Every Mongoose query lives inside a concrete repository method.
- Services never call `Model.findOne(...)` — they call `this.repository.findByEmail(...)`.
- Sensitive fields are accessed only through explicit repository methods: `findByEmailWithSecrets`, `findByIdWithRefreshToken`.
- **ISP**: `IRepository<T>` defines only core CRUD (`findById`, `create`, `updateById`, `deleteById`). Auth-specific methods (`findByEmail`, `findByEmailWithSecrets`, `findByIdWithRefreshToken`, `emailExists`) belong on `BrandRepository` and `CreatorRepository` only — never stub them on domain repositories.
- **Pagination**: Always use `this.buildPaginatedResult(items, total, page, limit)` from `BaseRepository`. Never copy-paste the `Math.ceil(total / limit)` formula.

```ts
// correct — repository encapsulates all DB access
protected async findUserWithSecrets(email: string): Promise<AuthDocument | null> {
  return this.brandRepository.findByEmailWithSecrets(email);
}

// wrong — direct Mongoose query in a service
const user = await BrandModel.findOne({ email }).select("+passwordHash");
```

### Infrastructure Services (`src/infrastructure/services/`)

- `TokenService` is the only class that imports `jsonwebtoken`.
- `OtpService` is the only class that imports `crypto` for OTP generation/comparison.
- `EmailService` is the only class that imports `nodemailer`.
- `EventPublisher` is the only class that uses the RabbitMQ channel.
- These classes receive their dependencies via constructor injection; they never use singletons directly.

### Auth Strategies (`src/modules/auth/strategies/`)

- Each strategy implements `IAuthStrategy`: `strategyName: string` and `authenticate(credentials): Promise<boolean>`.
- `EmailPasswordStrategy` — the only class that imports `bcryptjs`.
- Adding a new provider (Instagram, Google) means adding a new strategy file. No existing class changes.

### Services (`src/modules/<feature>/`)

- `BaseAuthService` is abstract and holds all shared auth logic: `verifyOtp`, `login`, `refreshToken`, `logout`, `resendOtp`, `issueTokenPair`, `toSafeUser`.
- Subclasses (`BrandAuthService`, `CreatorAuthService`) implement five protected abstract methods: `findUser`, `findUserWithSecrets`, `findUserByIdWithRefreshToken`, `updateUserRefreshToken`, `updateEmailVerified`, `crossRoleEmailExists`.
- Subclasses also implement `register(data)` as a public concrete method (not declared on the base).
- Services receive all dependencies via constructor — never instantiate them with `new`.
- Throw typed error classes (`AuthError`, `ConflictError`, etc.), never raw `Error`, never `AppError` directly.

```ts
// correct — typed, semantically named
throw new ConflictError("Email already registered");

// wrong — numeric codes, loses semantic meaning
throw new AppError(409, "Email already registered");
```

### Controllers (`src/modules/<feature>/AuthController.ts`)

- Handler methods are **bound arrow functions** (`login = asyncHandler(async (req, res) => { ... })`), not class methods. This makes them safe to pass as Express route handlers without losing `this` context.
- Exactly four responsibilities per handler: parse → call service → set cookie if needed → send `ApiResponse`.
- No business logic. No repository access. No conditionals beyond cookie/response construction.
- `AuthController` receives `BrandAuthService`, `CreatorAuthService`, and `ITokenService` via constructor. It uses `ITokenService` only to decode the refresh token before routing to the correct service in the `refresh` handler.

```ts
// correct — route to the right service based on role in validated body
login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const result = await this.getService(payload.role).login(payload);
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
  res.status(200).json(new ApiResponse("Logged in", { accessToken: result.accessToken, user: result.user }));
});

// wrong — Mongoose in a controller
login = asyncHandler(async (req, res) => {
  const user = await BrandModel.findOne({ email: req.body.email });
});
```

### Routes (`<feature>.routes.ts`)

- Exports a **factory function** `createAuthRouter(controller, authMiddleware)` that returns a configured `Router`.
- No business logic. Mounts handler methods and applies middleware per route.
- `App` class calls the factory and mounts the result.

```ts
// correct
export const createAuthRouter = (controller: AuthController, authMiddleware: AuthMiddleware): Router => {
  const router = Router();
  router.post("/login", controller.login);
  router.post("/logout", authMiddleware.authenticate, controller.logout);
  return router;
};
```

### Validators (`<feature>.validator.ts`)

- Unchanged convention: Zod schemas with private reusable field schemas at the top.
- `z.infer<typeof schema>` for all input types. No separate interface that mirrors a schema.
- Transform at parse time (trim, lowercase) so services receive clean data.

### Models (`*.model.ts`)

- Export a TypeScript interface (plain shape), a `HydratedDocument` type alias, and the Mongoose model.
- `role` field: `immutable: true`. Sensitive fields (`passwordHash`, `refreshToken`, `instagramAccessToken`): `select: false`.
- `toJSON.transform` strips all secrets as a safety net (not the primary defence).

### Workers (`src/workers/`)

- Every worker **extends `BaseWorker`** (Template Method pattern). `BaseWorker` owns the RabbitMQ channel lifecycle and consumer registration.
- Subclasses declare four `protected readonly` properties: `queueName`, `exchangeName`, `routingKey` (accepts `string | string[]` for multi-key binding), `prefetch`.
- Subclasses implement one method: `protected async handleMessage(msg: ConsumeMessage): Promise<void>`. This method is responsible for its own ack/nack.
- Never duplicate `start()` / `stop()` / channel setup. If `start()` needs custom exchange type, that is the only reason to override it.

```ts
// correct — declare properties + implement handleMessage only
export class MyWorker extends BaseWorker {
  protected readonly queueName = "creatorlane.my.queue";
  protected readonly exchangeName = MY_EXCHANGE;
  protected readonly routingKey = "event.happened";
  protected readonly prefetch = 10;

  constructor(private readonly myService: MyService, rabbitMQ: RabbitMQConnection) {
    super(rabbitMQ);
  }

  protected async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.channel;
    if (!channel) return;
    try {
      // process message
      channel.ack(msg);
    } catch (err) {
      channel.nack(msg, false, true);
    }
  }
}
```

### Jobs (`src/jobs/`)

- Every job **extends `BaseJob`** (Template Method pattern). `BaseJob` owns `setInterval` / `clearInterval` and error catching.
- Subclasses declare `protected readonly intervalMs: number` and implement `protected async run(): Promise<void>`.
- Never duplicate `start()` / `stop()` / timer boilerplate.

```ts
// correct — declare intervalMs + implement run only
export class MyJob extends BaseJob {
  protected readonly intervalMs = 5 * 60 * 1000;

  constructor(private readonly myService: MyService) {
    super();
  }

  protected async run(): Promise<void> {
    await this.myService.doPeriodicWork();
  }
}
```

### App class (`src/app.ts`)

- Receives all middleware and controller instances via constructor — DI all the way.
- `initialiseMiddleware()`, `initialiseRoutes()`, `initialiseErrorHandling()` called from constructor.
- `getExpressApp()` returns the Express application for the Server to call `.listen()` on.

### Server class + Composition Root (`src/server.ts`)

- `class Server` manages HTTP lifecycle and graceful shutdown.
- The module-level code below the class definition is the **composition root** — the only place where `new` is called for non-trivial classes.
- Wiring order in the composition root: singletons → infrastructure services → repositories → strategies → domain services → middleware → controller → App → Server.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Class files | `PascalCase` | `BrandAuthService.ts`, `TokenService.ts` |
| Non-class files | `kebab-case` or `dot-notation` | `auth.validator.ts`, `auth.types.ts` |
| Constants files | `kebab-case` + `.constants` | `auth.constants.ts` |
| Classes | `PascalCase` noun | `BrandAuthService`, `TokenService` |
| Interfaces | `I` + `PascalCase` | `ITokenService`, `IRepository` |
| Error classes | `PascalCase` + `Error` | `AuthError`, `ConflictError` |
| Abstract base classes | `Base` + `PascalCase` | `BaseAuthService`, `BaseRepository` |
| Singleton classes | `PascalCase` noun | `DatabaseConnection`, `RedisClient` |
| Handler methods (bound) | `camelCase` arrow | `login`, `registerBrand` |
| Private Redis key builders | `camelCase` + `Key`, private method | `otpKey(role, email)` |
| Zod schemas | `camelCase` + `Schema` | `loginSchema`, `brandRegisterSchema` |
| Inferred types | `PascalCase` + `Input`/`Result` | `LoginInput`, `AuthResult` |
| Mongoose interfaces | `PascalCase` noun | `Brand`, `Creator` |
| Mongoose document types | `PascalCase` + `Document` | `BrandDocument`, `CreatorDocument` |
| Mongoose models | `PascalCase` + `Model` | `BrandModel`, `CreatorModel` |
| Constants | `UPPER_SNAKE_CASE` | `BCRYPT_SALT_ROUNDS`, `REFRESH_TOKEN_COOKIE` |
| Route prefix | `/api/v1/<module>` | `/api/v1/auth`, `/api/v1/campaigns` |

---

## Constants Files — Non-Negotiable

Constants must never be defined inside a class body or left as file-level `const` inside a class file. They go in a dedicated constants file.

**Where a constant lives:**

| Scope | Location |
|---|---|
| Used only within one module | `src/modules/<feature>/<feature>.constants.ts` |
| Truly shared across two or more modules | `src/utils/constants.ts` |

**What belongs in a constants file:**
- Named string/number values (`REFRESH_TOKEN_COOKIE`, `BCRYPT_SALT_ROUNDS`)
- Timing values in milliseconds or seconds (`REFRESH_TOKEN_MAX_AGE_MS`)
- Configuration objects derived from those values (`REFRESH_COOKIE_OPTIONS`, `CLEAR_REFRESH_COOKIE_OPTIONS`)

**What does NOT belong in a constants file:**
- Private implementation details that never leave one class (e.g. `OTP_TTL_SECONDS` only used inside `OtpService` methods — keep those as `private static readonly` or file-level `const` in the class's own file).

```ts
// correct — auth.constants.ts exports shared auth values
export const REFRESH_TOKEN_COOKIE = "refreshToken";
export const BCRYPT_SALT_ROUNDS = 12;
export const REFRESH_COOKIE_OPTIONS: CookieOptions = { ... };

// wrong — constant buried inside AuthController.ts alongside class code
const REFRESH_TOKEN_COOKIE = "refreshToken";  // ← hidden, hard to find
export class AuthController { ... }
```

---

## TypeScript Rules

- `strict: true` and `noUncheckedIndexedAccess: true` are on. Never use `any`. Use `unknown` and narrow explicitly.
- Every class method has explicit return type annotations. Private helpers may let TypeScript infer.
- Constructor parameters typed to an **interface**, not a concrete class, where an interface exists. `ITokenService` not `TokenService`.
- `z.infer<typeof schema>` for all Zod input types.
- Never use non-null assertion (`!`) on data from DB queries or external input. Narrow with guards.
- `noUncheckedIndexedAccess: true` means array indexing returns `T | undefined`. Check every indexed access.

### Enums — Non-Negotiable

**Never use hardcoded string literals for domain state values.** All status, role, and categorical values must be defined as TypeScript `enum` and referenced via the enum.

| Where enums live | Examples |
|---|---|
| `src/models/<Feature>.model.ts` | `EscrowStatus`, `BidStatus`, `CampaignStatus`, `CampaignPlatform`, `TargetGender`, `CampaignDeliveryType`, `CollabRoomStatus` |
| `src/core/types/index.ts` | `UserRole`, `AuthProvider` |

Rules:
- Mongoose `enum:` arrays must use `Object.values(EnumName)`, never a literal array of strings.
- Mongoose `default:` values must use the enum member, never a string literal.
- Zod validators must use `z.nativeEnum(EnumName)`, never `z.enum([...])` for domain enums.
- All comparisons (`===`, `!==`) and assignments must use enum members (`BidStatus.Accepted`), never string literals (`"accepted"`).

```ts
// correct
status: { type: String, enum: Object.values(BidStatus), default: BidStatus.Submitted }
if (bid.status === BidStatus.Accepted) { ... }
z.nativeEnum(CampaignStatus).optional()

// wrong — hardcoded strings
status: { type: String, enum: ["submitted", "shortlisted"], default: "submitted" }
if (bid.status === "accepted") { ... }
z.enum(["draft", "active", "closed"])
```

---

## Error Handling Rules

- Services throw **typed error subclasses**: `AuthError`, `ConflictError`, `ForbiddenError`, `NotFoundError`, `RateLimitError`, `ValidationError`, `UnprocessableError`.
- `ErrorHandlerMiddleware.handle()` identifies error types via `instanceof` against the `AppError` hierarchy. It also handles `ZodError`, `JsonWebTokenError`, Mongoose errors, and Mongo duplicate-key errors.
- Never `throw new AppError(...)` directly — always use a semantic subclass.
- Never call `res.json(...)` inside a service's catch block. Let errors propagate to the middleware.
- Auth failure messages must never reveal whether the email or password was wrong.

```ts
// correct — semantic, isOperational = true
throw new AuthError("Invalid credentials");

// wrong — raw AppError, not semantic
throw new AppError(401, "Invalid credentials");

// wrong — old class, no longer exists
throw new ApiError(401, "Invalid credentials");
```

---

## Global Utilities (`src/utils/`)

| File | What it provides |
|---|---|
| `asyncHandler.ts` | `AsyncHandler.wrap(handler)` — wraps async route handlers, forwards errors to Express |
| `logger.ts` | Winston logger — use this everywhere, never `console.log` |
| `crypto.ts` | `EncryptionService.encryptToken` / `EncryptionService.decryptToken` — AES-256-GCM for Instagram access tokens |

`ApiError`, `ApiResponse`, `jwt.ts`, and `mailer.ts` no longer exist here — those concerns are now handled by `core/errors/`, `core/responses/ApiResponse.ts`, `TokenService`, and `EmailService` respectively.

`core/responses/ApiError.ts` exports `ErrorResponse` class with `ErrorResponse.build(message, code?, errors?)` static factory — used exclusively by `ErrorHandlerMiddleware`.

---

## Response and Error Shapes — Never Break These

Success:
```json
{ "success": true, "message": "Human-readable string", "data": { ... } }
```

Error:
```json
{ "success": false, "message": "Human-readable string", "code": "OPTIONAL_CODE", "errors": [ ... ] }
```

Use `new ApiResponse(message, data)` from `src/core/responses/ApiResponse.ts` for all success responses.  
Throw a typed `AppError` subclass for all expected failures — never construct a raw error JSON in a service or controller.

---

## Auth System — Already Implemented, Do Not Rewrite

| Method | Route | Guard |
|---|---|---|
| POST | `/api/v1/auth/brand/register` | rate limiter |
| POST | `/api/v1/auth/creator/register` | rate limiter |
| POST | `/api/v1/auth/verify-otp` | rate limiter |
| POST | `/api/v1/auth/login` | rate limiter |
| POST | `/api/v1/auth/refresh` | rate limiter |
| POST | `/api/v1/auth/logout` | rate limiter + `authenticate` |
| POST | `/api/v1/auth/resend-otp` | resend limiter + rate limiter |

Health: `GET /health`

Token behaviour:
- Access token: 15 min, `Authorization: Bearer <token>`, carries `jti` for blacklisting.
- Refresh token: 7 days, httpOnly secure strict cookie `refreshToken`, rotated on every login and refresh.
- Only the SHA-256 hash of the refresh token is stored in MongoDB.

---

## Security Rules

- **Never return `passwordHash` or `refreshToken`** in any response. `BaseAuthService.toSafeUser()` is the primary defence; `toJSON.transform` on models is a safety net.
- **Store only the SHA-256 hash** of refresh tokens via `TokenService.hashToken()`. Never the raw token.
- **`select: false`** on `passwordHash` and `refreshToken`. Access via `findByEmailWithSecrets` / `findByIdWithRefreshToken` only.
- **Access token `jti` blacklist**: on logout `TokenService.blacklistAccessToken(jti, ttl)` writes to Redis. `AuthMiddleware` checks `TokenService.isBlacklisted(jti)` on every request.
- **Refresh token family invalidation**: hash mismatch → null the stored token → throw `AuthError`. Prevents replay after theft.
- **OTP comparison** uses `crypto.timingSafeEqual` inside `OtpService`. Do not switch to `===`.
- JWT and cookie secrets: minimum 32 chars, enforced by `envalid` at startup.
- Body size capped at 10 kb in `App.initialiseMiddleware()`. Do not raise it.
- `app.set("trust proxy", 1)` must stay — rate limiting depends on accurate `req.ip`.
- CORS origin driven by `ALLOWED_ORIGINS` env var. Never hardcode origins.

---

## Adding a New Module — Checklist

Follow this order. Do not skip steps.

1. **Create the folder**: `src/modules/<feature>/`
2. **Model** (if new data): `src/models/<Feature>.model.ts`
   - Export plain interface, `HydratedDocument` alias, and Mongoose model.
   - Sensitive fields: `select: false`. Add `toJSON.transform`.
3. **Constants** (if the module has named values): `src/modules/<feature>/<feature>.constants.ts`
   - Cookie names, timing values, config objects. All `UPPER_SNAKE_CASE`.
   - Never define these inside a class body or alongside class code in the same file.
4. **Validator**: `src/modules/<feature>/<feature>.validator.ts`
   - Private reusable field schemas. Export schemas + `z.infer<>` types.
5. **Repository**: `src/infrastructure/repositories/<Feature>Repository.ts`
   - `extends BaseRepository<FeatureDocument>`. All Mongoose queries here.
6. **Service class**: `src/modules/<feature>/<Feature>Service.ts`
   - Constructor receives all dependencies via DI (repositories, token service, etc.).
   - Public methods return typed results. Throw typed `AppError` subclasses.
7. **Controller class**: `src/modules/<feature>/<Feature>Controller.ts`
   - Handler methods as bound arrow functions. Parse → call service → respond.
   - `asyncHandler` wraps each handler.
8. **Routes factory**: `src/modules/<feature>/<feature>.routes.ts`
   - `export const create<Feature>Router = (controller, ...) => Router`
9. **Wire up in `src/app.ts`**: mount `create<Feature>Router(...)` in `initialiseRoutes()`.
10. **Wire up in `src/server.ts`** (composition root): instantiate repository, service, controller; pass to `App`.
11. **Run checks**: `npm run build && npm run lint`

---

## Adding a New Auth Strategy (Social Login)

Adding Instagram or Google OAuth must NOT require changes to `BaseAuthService`, `AuthController`, or any middleware.

Steps:
1. Create `src/modules/auth/strategies/<Provider>Strategy.ts` implementing `IAuthStrategy`.
2. Add any new repository methods needed to `BrandRepository` or `CreatorRepository` (stubs already exist: `findByGoogleId`, `findByInstagramId`).
3. Wire the new strategy into the relevant service at the composition root in `server.ts`.

That is all.

---

## RabbitMQ Event Publishing

Exchange: `creatorlane.events` (durable topic).  
Use `this.eventPublisher.publish(routingKey, payload)` inside service classes.  
`EventPublisher.publish()` is fire-and-forget (returns `boolean`). Do not `await` it.  
Current events: `user.registered`.  
New events follow the pattern `<noun>.<past-tense-verb>` — e.g. `campaign.created`, `bid.submitted`.  
If RabbitMQ channel is unavailable, `publish()` logs a warning and returns `false` — it never throws.

---

## Redis Key Naming

Redis keys are always built by **private methods inside the class that owns them**. Never inline a string template in a call site.

```ts
// correct — private key builder inside OtpService
private otpKey(role: UserRole, email: string): string {
  return `otp:${role}:${email}`;
}
await this.redisClient.set(this.otpKey(role, email), otp, OTP_TTL_SECONDS);

// wrong — inline template, pattern can drift across call sites
await this.redisClient.set(`otp:${role}:${email}`, otp, OTP_TTL_SECONDS);
```

Global Redis key namespaces in use:

| Prefix | Owner class |
|---|---|
| `otp:*` | `OtpService` |
| `otp:attempts:*` | `OtpService` |
| `otp:lock:*` | `OtpService` |
| `otp:cooldown:*` | `OtpService` |
| `blacklist:at:*` | `TokenService` |

When adding a new namespace, add it to this table.

---

## Startup and Shutdown

Boot order in `Server.start()`: `DatabaseConnection.getInstance().connect()` → `RedisClient.getInstance().connect()` → `RabbitMQConnection.getInstance().connect()` → `app.getExpressApp().listen()`.  
Graceful shutdown handles `SIGINT`, `SIGTERM`, `unhandledRejection`, `uncaughtException`.  
Shutdown order: HTTP server → MongoDB → Redis → RabbitMQ.  
Force-exit after 10 s if any step hangs.  
Do not add infrastructure connections without also closing them in `gracefulShutdown`.

---

## Environment Variables

All validated at startup by `envalid` in `src/config/env.ts`. Server will not start if any are missing or invalid.  
When adding a new env var: add it to `env.ts`, add it to `.env.example`, and document it here.

| Variable | Rule |
|---|---|
| `JWT_ACCESS_SECRET` | ≥32 chars (`secret()` validator) |
| `JWT_REFRESH_SECRET` | ≥32 chars (`secret()` validator) |
| `COOKIE_SECRET` | ≥32 chars (`secret()` validator) |
| `INSTAGRAM_TOKEN_ENCRYPTION_KEY` | 64 hex chars — 32-byte AES-256-GCM key (`hexKey32()` validator) |
| `ALLOWED_ORIGINS` | Comma-separated, set per environment |
| `NODE_ENV` | `development` \| `test` \| `production` only |

---

## What Is NOT Built Yet — Do Not Add

- Social auth (Instagram OAuth for creators, Google OAuth for brands)
- Campaign posting and browsing
- Creator bidding
- Collaboration workflows
- Escrow and payments
- Admin dashboard
- Password reset
- Push or in-app notifications
- Automated tests
- Docker Compose
- CI pipeline
- OpenAPI / Swagger docs
