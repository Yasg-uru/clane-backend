# CLAUDE.md — CreatorLane Frontend

> These rules are **non-negotiable**. Read this file completely before writing or editing any code.
> When in doubt: less magic, more explicit. Prefer boring correctness over clever shortcuts.

---

## 1. PROJECT OVERVIEW

CreatorLane is a two-sided influencer-marketing marketplace.
- **Brand** side: create campaigns, review bids, fund escrow, approve deliverables, release payment.
- **Creator** side: discover campaigns, submit bids, deliver content, withdraw earnings via Razorpay.

**Tech stack:** Next.js 15 (App Router) · TypeScript (strict) · TanStack Query v5 · TanStack Form v1 · Zustand · shadcn/ui · Tailwind CSS v4 · Zod · Axios · NextAuth v5 · Razorpay · nuqs

---

## 2. DIRECTORY STRUCTURE — NEVER BREAK THIS

```
src/
├── app/             # Next.js routes ONLY — no business logic here
├── components/      # React UI — presentational + feature components
│   ├── ui/          # shadcn/ui primitives — DO NOT EDIT
│   ├── common/      # Shared across the whole app
│   ├── layout/      # Sidebar, topbar, providers
│   └── [feature]/   # campaign/ bid/ collab/ payment/ creator/ auth/ review/
├── domain/          # ★ OOP business logic — Services, Repositories, Entities
├── hooks/           # React hooks — thin wrappers over domain + TanStack Query
├── lib/             # Pure infra utilities (api client, query setup, formatters)
├── schemas/         # Zod schemas — the ONLY source of truth for validation + types
├── stores/          # Zustand stores — UI state ONLY
├── types/           # TypeScript types and interfaces
└── config/          # App-wide constants and configuration
```

### Hard rules on structure

- **Never** put business logic in a `page.tsx` or `layout.tsx`. Pages are thin shells that import components and hooks.
- **Never** import from `domain/` directly inside a component. Always go through a `hook`.
- **Never** add a new top-level folder under `src/` without a documented reason in this file.
- **Never** add files to `components/ui/` manually — only via `npx shadcn@latest add <component>`.
- Feature folders inside `components/` mirror the `domain/` modules exactly: `domain/campaign/` ↔ `components/campaign/`.

---

## 3. TYPESCRIPT — STRICT MODE, NO EXCEPTIONS

- `tsconfig.json` has `"strict": true`. Never disable it or add `// @ts-ignore` / `// @ts-nocheck`.
- **No `any`** — ever. Use `unknown` and narrow it. If you're tempted to use `any`, you need a better type.
- Every function, method, and exported constant must have an explicit return type annotation.
- Use `type` for shapes and unions. Use `interface` only for objects that will be implemented by a class.
- All IDs are `string` (UUID). Never use `number` for entity IDs.

```ts
// ✅ CORRECT
export async function getCampaign(id: string): Promise<Campaign> { ... }

// ❌ WRONG
export async function getCampaign(id: any) { ... }
```

---

## 4. ENUMS — NEVER USE HARDCODED STRINGS

Every status, role, type, platform, or category that appears more than once **must** be a TypeScript `const enum` or a Zod `z.enum()`. Define them in `src/types/` or inside the relevant `schema`.

```ts
// ✅ CORRECT — src/types/campaign.types.ts
export const CampaignStatus = {
  DRAFT:      'DRAFT',
  ACTIVE:     'ACTIVE',
  PAUSED:     'PAUSED',
  COMPLETED:  'COMPLETED',
  CANCELLED:  'CANCELLED',
} as const;
export type CampaignStatus = typeof CampaignStatus[keyof typeof CampaignStatus];

// ✅ CORRECT — src/schemas/campaign.schema.ts
export const campaignStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']);

// ❌ WRONG — anywhere in the codebase
if (campaign.status === 'active') { ... }
if (user.role === 'brand') { ... }
```

### Enums that already exist — always import, never re-declare:
- `UserRole` → `src/types/auth.types.ts`
- `CampaignStatus` → `src/types/campaign.types.ts`
- `BidStatus` → `src/types/bid.types.ts`
- `CollabStatus` → `src/types/collab.types.ts`
- `PaymentStatus` → `src/types/payment.types.ts`
- `SocialPlatform` → `src/types/creator.types.ts`
- `DeliverableStatus` → `src/types/collab.types.ts`
- `EscrowStatus` → `src/types/payment.types.ts`

---

## 5. DOMAIN LAYER — OOP RULES

This is the most critical layer. Every bounded context has a fixed structure:

```
domain/
└── [feature]/
    ├── [Feature]Service.ts      # Orchestrates use-cases. No HTTP, no React.
    ├── [Feature]Repository.ts   # Interface + HTTP implementation.
    └── entities/
        └── [Entity].ts          # Class with typed props + business methods.
```

### Service rules
- A `Service` class receives its `Repository` via **constructor injection** (DI pattern).
- Services contain all business logic: validation, orchestration, error handling.
- Services are **framework-agnostic** — no React imports, no `useState`, no `useRouter`.
- Each method corresponds to exactly one use-case (`createCampaign`, `acceptBid`, `releaseEscrow`).

```ts
// ✅ CORRECT
export class CampaignService {
  constructor(private readonly repo: ICampaignRepository) {}

  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
    // validation, business rules, then repo call
    return this.repo.create(payload);
  }
}

// ❌ WRONG — business logic inside a hook
export function useCreateCampaign() {
  return useMutation({
    mutationFn: async (data) => {
      if (data.budget < 1000) throw new Error('...'); // ← business logic does NOT belong here
      return apiClient.post('/campaigns', data);
    }
  });
}
```

### Repository rules
- Always define an **interface** first (`ICampaignRepository`), then a concrete class (`CampaignRepository`).
- The concrete class uses `apiClient` from `lib/api/client.ts`. Nothing else.
- No component or hook may import a Repository directly — only the Service uses it.

### Entity rules
- Entities are plain TypeScript classes with `readonly` properties.
- Business methods live on the entity: `campaign.isExpired()`, `bid.canBeWithdrawn()`, `collab.isDeadlinePast()`.
- Entities do **not** call APIs. They are pure data + logic.
- Use a static `fromApiResponse()` factory method to construct entities from raw API data.

```ts
// ✅ CORRECT
export class Campaign {
  constructor(
    public readonly id: string,
    public readonly status: CampaignStatus,
    public readonly deadline: Date,
    public readonly budget: number,
  ) {}

  isExpired(): boolean {
    return new Date() > this.deadline;
  }

  static fromApiResponse(raw: CampaignApiResponse): Campaign {
    return new Campaign(raw.id, raw.status, new Date(raw.deadline), raw.budget);
  }
}
```

---

## 6. SHADCN/UI — ALWAYS BEFORE BUILDING FROM SCRATCH

**Before writing any UI element from scratch**, check if shadcn/ui has it:

| Need | shadcn component |
|---|---|
| Any button | `Button` |
| Any text input | `Input` |
| Any form field with label + error | `Form` + `FormField` + `FormItem` |
| Modal / popup | `Dialog` |
| Dropdown menu | `DropdownMenu` |
| Select box | `Select` |
| Date picker | `Calendar` + `Popover` |
| Data display in rows | `Table` |
| Tag / pill | `Badge` |
| Loading placeholder | `Skeleton` |
| Notification | `Sonner` (toast) |
| Tabs | `Tabs` |
| Profile picture | `Avatar` |
| Tooltip | `Tooltip` |
| Accordion | `Accordion` |
| Sidebar navigation | `Sidebar` (shadcn sidebar) |
| Command / search palette | `Command` |
| Multi-step stepper | `Stepper` (if added) or `Tabs` with controlled state |

### Adding a new shadcn component
```bash
npx shadcn@latest add <component-name>
# This writes to src/components/ui/ — never edit that file afterward.
```

### Extending shadcn components
Create a **wrapper** in `components/common/` or the relevant feature folder. Never modify `components/ui/` files.

```ts
// ✅ CORRECT — components/common/status-badge.tsx
import { Badge } from '@/components/ui/badge';
import { CampaignStatus } from '@/types/campaign.types';

const statusVariantMap: Record<CampaignStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [CampaignStatus.ACTIVE]:    'default',
  [CampaignStatus.DRAFT]:     'secondary',
  [CampaignStatus.PAUSED]:    'outline',
  [CampaignStatus.COMPLETED]: 'secondary',
  [CampaignStatus.CANCELLED]: 'destructive',
};

// ❌ WRONG — building a badge component from scratch when Badge exists
```

---

## 7. FORMS — TANSTACK FORM + ZOD ONLY

- **All** forms use TanStack Form v1 (`@tanstack/react-form`).
- **All** validation uses Zod schemas from `src/schemas/`.
- **Never** use `react-hook-form`, controlled `useState` for form values, or manual validation logic.
- The Zod schema is the **single source of truth** — TypeScript types are inferred from it.

```ts
// ✅ CORRECT pattern

// 1. Define schema in src/schemas/bid.schema.ts
export const createBidSchema = z.object({
  amount:   z.number().min(500, 'Minimum bid is ₹500'),
  message:  z.string().min(20).max(500),
  timeline: z.number().int().min(1).max(90),
});
export type CreateBidPayload = z.infer<typeof createBidSchema>;

// 2. Use in component with TanStack Form
const form = useForm({
  defaultValues: { amount: 0, message: '', timeline: 7 } satisfies CreateBidPayload,
  validators: { onChange: zodValidator(createBidSchema) },
  onSubmit: async ({ value }) => submitBid.mutateAsync(value),
});
```

---

## 8. DATA FETCHING — TANSTACK QUERY RULES

- **All** server data lives in TanStack Query. No `useState` + `useEffect` for fetching.
- All query keys come from `src/lib/query/query-keys.ts` — never write inline string arrays.
- All mutations call a `domain/XxxService` method — never call `apiClient` directly from a hook.

```ts
// ✅ CORRECT — hooks/campaign/useCampaigns.ts
export function useCampaigns(filters: CampaignFilters) {
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn:  () => campaignService.getCampaigns(filters),
    staleTime: QueryConfig.LIST_STALE_TIME,
  });
}

// ❌ WRONG — calling API directly in hook
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => axios.get('/api/campaigns'),
  });
}
```

### Cache invalidation — always use key factories
```ts
// After creating a campaign:
queryClient.invalidateQueries({ queryKey: campaignKeys.all() });

// After accepting a bid on a specific campaign:
queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
queryClient.invalidateQueries({ queryKey: bidKeys.list({ campaignId }) });
```

### Loading and error states — always handle both
Every component that uses a query **must** render a `<Skeleton>` during loading and an `<EmptyState>` or error UI on failure. Never leave these cases unhandled.

---

## 9. STATE MANAGEMENT — STRICT SEPARATION

| State type | Tool | Location |
|---|---|---|
| Server / async data | TanStack Query | `hooks/` |
| URL-driven filters & search params | `nuqs` | `hooks/` or page-level |
| Multi-step wizard progress | Zustand | `stores/campaign-wizard.store.ts` |
| Auth user + role | NextAuth + Zustand | `stores/auth.store.ts` |
| UI chrome (sidebar, modals, theme) | Zustand | `stores/ui.store.ts` |
| Local component state (toggle, input focus) | `useState` | component file |

**Rule:** If data comes from or must sync with the server → TanStack Query. If it's ephemeral UI state → `useState`. If it must persist across pages within a session → Zustand. Never use Zustand as a cache for server data.

---

## 10. COMPONENT RULES

### Naming
- Feature components: `kebab-case.tsx` — e.g., `campaign-card.tsx`, `bid-form.tsx`
- Component functions: `PascalCase` — e.g., `export function CampaignCard`
- Hooks: `camelCase` starting with `use` — e.g., `useCampaigns`
- Domain classes: `PascalCase` — e.g., `CampaignService`, `BidRepository`
- Stores: `camelCase` ending with `.store.ts` — e.g., `ui.store.ts`
- Schemas: `camelCase` ending with `.schema.ts` — e.g., `campaign.schema.ts`

### Component structure (in this order)
```tsx
// 1. Imports (external, then internal, then types)
// 2. Types / interfaces local to this file
// 3. Component function
//    a. Hooks (query, store, form)
//    b. Derived state / computed values
//    c. Handlers (prefix with `handle`)
//    d. Early returns (loading, error, empty)
//    e. JSX return
// 4. Sub-components (if small and tightly coupled)
```

### Props
- Every component has an explicit `Props` type — no inline typing in function signatures.
- Required props first, optional props last, with `?` and a default where sensible.

```ts
// ✅ CORRECT
type CampaignCardProps = {
  campaign: Campaign;
  onSelect: (id: string) => void;
  isSelected?: boolean;
  className?: string;
};

export function CampaignCard({ campaign, onSelect, isSelected = false, className }: CampaignCardProps) {
```

### `"use client"` directive
- Default to **Server Components** (no directive).
- Add `"use client"` only when the component uses: `useState`, `useEffect`, `useRef`, event handlers, browser APIs, TanStack Query hooks, or Zustand.
- Never add `"use client"` to a layout unless absolutely necessary.

---

## 11. ROUTING & NAVIGATION

- **Never** use hardcoded route strings like `router.push('/brand/campaigns')`.
- All routes are defined in `src/config/routes.config.ts` as a typed map.

```ts
// ✅ CORRECT
import { Routes } from '@/config/routes.config';
router.push(Routes.brand.campaign(campaignId));

// ❌ WRONG
router.push(`/brand/campaigns/${campaignId}`);
```

- Route groups: `(auth)`, `(onboarding)`, `(brand)`, `(creator)` — never add a new group without updating `middleware.ts` and `routes.config.ts`.
- `middleware.ts` enforces role-based access. Any new protected route must be listed there.

---

## 12. API CLIENT & ERROR HANDLING

- The **only** place to make HTTP calls is `src/lib/api/client.ts` (Axios instance).
- All API endpoint paths live in `src/lib/api/endpoints.ts` as constants — never inline URL strings in service or repository files.
- All API errors are normalized through `src/lib/api/error-handler.ts` into a typed `ApiError` class.

```ts
// ✅ CORRECT — lib/api/endpoints.ts
export const Endpoints = {
  campaigns: {
    list:   '/campaigns',
    create: '/campaigns',
    detail: (id: string) => `/campaigns/${id}`,
    bids:   (id: string) => `/campaigns/${id}/bids`,
  },
} as const;

// ✅ CORRECT — domain/campaign/CampaignRepository.ts
async getCampaigns(filters: CampaignFilters): Promise<Campaign[]> {
  const { data } = await apiClient.get(Endpoints.campaigns.list, { params: filters });
  return data.map(Campaign.fromApiResponse);
}
```

---

## 13. ZOD SCHEMAS — SINGLE SOURCE OF TRUTH

- Every schema lives in `src/schemas/[feature].schema.ts`.
- TypeScript payload types are **always** inferred from Zod: `type X = z.infer<typeof xSchema>` — never write them separately.
- Schemas used in forms = TanStack Form validation. Schemas used for API response parsing = Repository layer.
- Never duplicate validation logic in a service if a schema already validates it.

---

## 14. STYLING RULES

- Use **Tailwind CSS utility classes** for all styling. No CSS modules, no inline `style={{}}` props except for dynamic values that cannot be done with Tailwind (e.g., CSS custom properties for charts).
- All color references use the design token CSS variables from `tailwind.config.ts` — never hardcode hex values.
- Use `cn()` from `src/lib/utils/cn.ts` (clsx + tailwind-merge) for conditional class merging.

```ts
// ✅ CORRECT
import { cn } from '@/lib/utils/cn';
<div className={cn('rounded-lg border p-4', isSelected && 'border-primary bg-primary/5', className)} />

// ❌ WRONG
<div style={{ backgroundColor: '#f0f0f0', borderRadius: 8 }} />
<div className={`rounded-lg ${isSelected ? 'border-blue-500' : 'border-gray-200'}`} />
```

---

## 15. PAYMENTS & RAZORPAY

- All Razorpay interactions go through `domain/payment/RazorpayAdapter.ts`.
- **Never** initialise the Razorpay JS object directly in a component — always use `useRazorpayCheckout` hook.
- Webhook signature verification happens **only** in `app/api/webhooks/razorpay/route.ts` using `lib/razorpay/verify.ts`.
- Escrow state transitions are managed by `domain/payment/EscrowService.ts` — no component may call a payment endpoint directly.

---

## 16. FILE UPLOADS

- All uploads go through `app/api/upload/route.ts` which returns a signed URL.
- Components use the `FileUpload` component from `components/common/file-upload/`.
- Never upload directly to S3/R2 from a component — always get a signed URL from the BFF first.

---

## 17. WHAT NOT TO DO — QUICK REFERENCE

| ❌ Never do this | ✅ Do this instead |
|---|---|
| `if (status === 'active')` | `if (status === CampaignStatus.ACTIVE)` |
| Business logic in `page.tsx` | Put it in a `Service` class |
| `axios.get('/campaigns')` in a hook | Call `campaignService.getCampaigns()` |
| `useState` + `useEffect` for server data | `useQuery` from TanStack Query |
| Inline query key `['campaigns', id]` | `campaignKeys.detail(id)` |
| Build a `<Select>` from scratch | Use `Select` from `components/ui/select` |
| Edit `components/ui/*.tsx` | Create a wrapper component |
| `type: any` anywhere | Use `unknown` and narrow, or model the type |
| Hardcoded route string `/brand/campaigns` | `Routes.brand.campaigns()` |
| Hardcoded API path `/api/campaigns` | `Endpoints.campaigns.list` |
| Duplicate Zod schema + TypeScript type | `type X = z.infer<typeof xSchema>` |
| Zustand store holding API response data | TanStack Query cache |
| `"use client"` on every component by default | Only add when browser APIs or hooks require it |
| Multiple `z.object({...})` for the same entity in different files | One canonical schema in `src/schemas/` |

---

## 18. BEFORE WRITING ANY CODE — CHECKLIST

1. **Does this feature already exist** somewhere in `domain/`, `hooks/`, or `components/`? Search first.
2. **Is there a shadcn/ui component** that covers this UI need? Check section 6.
3. **Is the status/type/role a string literal?** Convert it to an enum in `src/types/`.
4. **Is there a Zod schema** for this data shape? Use it. Don't create a new one for the same entity.
5. **Where does the business logic live?** It lives in a `Service` class in `domain/`. Not in the hook, not in the component.
6. **Does the new query key follow the factory pattern** in `lib/query/query-keys.ts`?
7. **Is the new route protected?** Update `middleware.ts` and `routes.config.ts`.
8. **Have you handled loading + error + empty states** in every component that fetches data?