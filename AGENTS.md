# Code Quality Standards

## 1. Readability
- Descriptive, intention-revealing names
- Small, single-purpose functions
- Clarity over cleverness
- Consistent formatting/naming conventions
- Top-down structure: high-level logic first

## 2. Simplicity (KISS)
- Simplest solution that works, no premature abstraction
- Prefer stdlib/built-ins over custom code

## 3. Maintainability
- DRY, no duplicated logic
- Centralize config/constants/magic values
- Low coupling; leave code cleaner than found

## 4. Modularity & Reusability
- Single Responsibility Principle per module
- Reusable, context-agnostic functions/classes
- Minimal public interfaces, hide internals
- Composition over inheritance

## 5. Reliability & Robustness
- No silent error swallowing; fail fast with clear messages
- Validate inputs at boundaries
- Handle edge cases: empty/null/timeout/network failure
- Unit + integration + regression tests

## 6. Performance & Optimization
- Correctness first, optimize measured bottlenecks only
- Right data structures/algorithms for scale
- Avoid redundant computation/calls, memory leaks
- Cache expensive ops when safe

## 7. Scalability
- Design for growth in data/users/load
- No hard coupling to one env/db/infra
- Paginate/batch/stream large data
- Prefer stateless services

## 8. Security
- No hardcoded secrets — use env vars/secret managers
- Sanitize/validate external input (SQL/XSS/injection)
- Least privilege access
- Keep deps updated/audited
- Never log secrets/tokens/PII

## 9. Documentation
- Docstrings on public functions/classes/modules
- Comment "why," not "what"
- Keep README current (setup, usage, architecture)
- Document non-obvious decisions/trade-offs

## 10. Type Safety
- No `any`/loose types; avoid unnecessary `as` casts
- Runtime-validate external/untrusted data
- Explicit, reusable domain types
- Use discriminated unions/enums where useful
- Don't disable TS checks without documented reason
- Inherit/extend types (`extends`, `Pick`, `Omit`, `Partial`) over redefining

## 11. Pre-Commit Checklist
- [ ] No dead code / debug prints
- [ ] No duplicated logic
- [ ] Functions short, testable
- [ ] Clear names
- [ ] Errors handled, not ignored
- [ ] No hardcoded secrets/magic numbers
- [ ] Tests cover new logic + edge cases
- [ ] Public APIs documented

## 12. Package Management & Dev Workflow
- Use **bun** only (`bun install`/`add`/`run`) — no npm/yarn/pnpm
- Don't start dev server if already running
- Don't run build/eslint/prettier/biome checks as routine steps
- After editing a file, explicitly check for errors and fix them
- `bun run build` only as last resort if other error-checks fail

## 13. Folder Structure (per route)
```
apps/
├── home/
│   ├── page.tsx
│   ├── _components/  # private sub-components (underscore = not shared)
│   ├── lib/           # route-scoped utils
│   ├── types/         # route-scoped TS types
│   └── query/         # TanStack Query hooks
│
├── users/
│   ├── page.tsx
│   ├── _components/
│   ├── lib/
│   ├── types/
│   └── query/
│
└── post/
    └── [id]/
        ├── page.tsx
        ├── _components/
        ├── lib/
        ├── types/
        └── query/
```
- Same structure for every route under `apps/` — static or dynamic
- Shared code → top-level `lib/` / `components/` / `types/`; only promote when actually reused elsewhere
- Skip empty folders until needed

## 14. Observability
- Structured logging for key events/failures
- Include request/entity IDs, operation names
- Never log secrets/tokens/PII
- Metrics/tracing on critical workflows
- Errors need enough context to diagnose without local repro

## 15. Git & Change Management
- One logical change per commit
- Never commit secrets/generated files/env files
- Meaningful commit messages
- No unrelated refactors in feature/fix commits
- Review diff before committing
- No leftover debug code

## 16. Architecture & Dependency Direction
- Dependencies flow high-level → low-level
- UI components: no business logic / DB access
- Separate DB access, API clients, business logic, presentation
- Route logic stays route-scoped unless genuinely shared
- Promote to shared modules only when multiple features need it
- No circular deps; no reaching into unrelated modules' internals
- Explicit dependency boundaries over implicit global state

## Server Action and Data fetching

- One `lib/action.ts` per route — do not split into multiple action files.
- Each file in `query/` maps 1:1 to one action in `lib/action.ts`.

### 14.2 Naming convention

Same operation, three layers, three distinct names — suffix identifies the layer:

| Layer | File | Suffix | Example |
|---|---|---|---|
| Server action | `lib/action.ts` | `...Action` | `getPlatformAction` |
| Query options factory (reads only) | `query/get.ts` | `...Query` | `getPlatformQuery` |
| Query hook (reads only) | `query/get.ts` | `use...Query` | `useGetPlatformQuery` |
| Mutation hook (writes) | `query/create.ts`, `update.ts`, `delete.ts` | `use...Mutation` | `useCreatePlatformMutation` |

Rule: only the function calling `useQuery`/`useMutation` gets the `use` prefix. Never reuse the same name across layers.

### 14.3 Server action rules

- Every server action body is wrapped in `try/catch`.
- **Never** annotate the function's return type (no `Promise<ActionResponse<T>>`). Let TypeScript infer it from the actual `db` query result (Drizzle) so schema changes propagate automatically.
- Return shape:
  - Success → `{ success: true, data }` — **no `message` on success.**
  - Failure → `{ success: false, message }` — generic, user-safe message. Never leak the raw error to the client.
- In the `catch` block: `console.error("<actionName> error", error)` — always the action's own name, always `console.error` (not `console.log`), so logs are filterable and traceable.

```ts
// app/home/lib/action.ts
"use server";

export async function getPlatformAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const platform = await db
      .select()
      .from(platformTable)
      .where(eq(platformTable.userId, session.user.id));

    return { success: true, data: platform };
  } catch (error) {
    console.error("getPlatformAction error", error);
    return { success: false, message: "Failed to fetch platform" };
  }
}

export async function createPlatformAction(input: typeof platformTable.$inferInsert) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [platform] = await db
      .insert(platformTable)
      .values({ ...input, userId: session.user.id })
      .returning();

    return { success: true, data: platform };
  } catch (error) {
    console.error("createPlatformAction error", error);
    return { success: false, message: "Failed to create platform" };
  }
}

export async function updatePlatformAction(id: string, input: Partial<typeof platformTable.$inferInsert>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [platform] = await db
      .update(platformTable)
      .set(input)
      .where(eq(platformTable.id, id))
      .returning();

    return { success: true, data: platform };
  } catch (error) {
    console.error("updatePlatformAction error", error);
    return { success: false, message: "Failed to update platform" };
  }
}

export async function deletePlatformAction(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [platform] = await db
      .delete(platformTable)
      .where(eq(platformTable.id, id))
      .returning();

    return { success: true, data: platform };
  } catch (error) {
    console.error("deletePlatformAction error", error);
    return { success: false, message: "Failed to delete platform" };
  }
}
```

### 14.4 Read hooks (`query/get.ts`)

`queryFn` unwraps `{ success, ... }` and throws on failure — this hands TanStack's own `isError`/`error` state the job, instead of reinventing it.

```ts
// app/home/query/get.ts
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getPlatformAction } from "@/app/home/lib/action";

export function getPlatformQuery() {
  return queryOptions({
    queryKey: ["get-platform"],
    queryFn: async () => {
      const res = await getPlatformAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useGetPlatformQuery() {
  return useQuery(getPlatformQuery());
}

// Always export inferred entity types directly from read hooks in query/get.ts
export type Platform = NonNullable<ReturnType<typeof useGetPlatformQuery>["data"]>[number];
```

### 14.5 Write hooks (`query/create.ts`, `update.ts`, `delete.ts`)

Mutations do **not** throw on failure — `res.success` stays available in `onSuccess` so the UI can branch (toast vs. proceed) without a try/catch at the call site.

```ts
// app/home/query/create.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlatformAction } from "@/app/home/lib/action";

export function useCreatePlatformMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlatformAction,
    onSuccess: (res) => {
      if (!res.success) return; // res.message -> toast
      queryClient.invalidateQueries({ queryKey: ["get-platform"] });
    },
  });
}
```

`update.ts` and `delete.ts` follow the identical shape — swap the imported action, the exported hook name (`useUpdatePlatformMutation`, `useDeletePlatformMutation`), and the invalidated `queryKey`.

### 14.6 Checklist for every new action + query pair

- [ ] Action lives in the route's single `lib/action.ts`
- [ ] Action wrapped in `try/catch`, no return-type annotation
- [ ] `console.error("<actionName> error", error)` in catch
- [ ] Success → `{ success: true, data }` only
- [ ] Failure → `{ success: false, message }` only, generic message
- [ ] Matching file in `query/` named after the verb (`get.ts`/`create.ts`/`update.ts`/`delete.ts`)
- [ ] Names follow `<verb><Entity>Action` / `<verb><Entity>Query` / `use<Verb><Entity>Query|Mutation`
- [ ] Entity types inferred and exported directly from `query/get.ts` (`export type Entity = NonNullable<ReturnType<typeof use...Query>["data"]>[number]`)


## Zustand State management:

---
name: zustand
description: Expert guide for Zustand state management patterns, store organization, and best practices. Use when implementing client state management with Zustand, creating stores, or managing shared UI state across components.
allowed-tools: Read, Grep, Glob
---

# Zustand State Management Guide

This skill provides guidelines, patterns, and best practices for working with Zustand in this project.

## Quick Start

For detailed store patterns, middleware usage, and comprehensive examples, please refer to `references/patterns.md`.

## Core Philosophy

- **Shared Client State Only**: Use Zustand for shared client state, not server state (use TanStack Query for that).
- **Domain-Specific Stores**: Keep stores focused on specific domains.
- **Type Safety**: Leverage TypeScript for fully typed stores.
- **Simplicity**: Prefer simplicity over complex abstractions.

## Store Organization

### Essential Patterns

- Create separate stores for different domains
- Use slices pattern for large stores
- Keep stores close to features that use them
- Export typed selector hooks for better DX and performance

### Recommended Middleware Stack

Use the following middleware combination for production stores:

```typescript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const useExampleStore = create<ExampleState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // state and actions
      })),
      { name: "example-storage" }
    ),
    { name: "example-store" }
  )
);
```

### Store Structure Template

```typescript
interface StoreState {
  // State properties
  data: DataType | null;
  isLoading: boolean;
  // Group actions together
  actions: {
    fetchData: () => Promise<void>;
    updateData: (updates: Partial<DataType>) => void;
    reset: () => void;
  };
}
```

### Selector Hooks Pattern

Always create selector hooks for performance optimization:

```typescript
// Bad - subscribes to entire store
const { user, isLoading } = useAuthStore();

// Good - subscribes only to specific slices
export const useUser = () => useAuthStore((state) => state.user);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthActions = () => useAuthStore((state) => state.actions);
```

## Best Practices

1. **Keep stores focused** on specific domains
2. **Use TypeScript** for full type safety
3. **Leverage middleware** for common patterns (devtools, persist, immer)
4. **Create selector hooks** for performance
5. **Use immer** for complex nested state updates
6. **Persist only necessary state** - use `partialize` option
7. **Test stores thoroughly**
8. **Handle async operations properly** with loading/error states
9. **Implement optimistic updates** when appropriate
10. **Document store structure** and actions

## Common Tasks

### Creating a New Store

1. Define the state interface with typed actions
2. Create the store with appropriate middleware
3. Export selector hooks for each state slice
4. Add to the feature's barrel export

### Persisting State

Use the `persist` middleware with `partialize` to persist only necessary data:

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: "store-key",
    partialize: (state) => ({
      // Only persist these fields
      user: state.user,
      preferences: state.preferences,
    }),
  }
);
```

### Using Immer for Updates

Immer allows mutable-style updates that produce immutable state:

```typescript
immer((set) => ({
  updateNested: (id, value) => {
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.value = value; // Mutable style, but produces immutable state
      }
    });
  },
}));
```

## Validation Checklist

Before finishing a task involving Zustand:

- [ ] Store is domain-specific and focused
- [ ] TypeScript interfaces are properly defined
- [ ] Middleware is applied in correct order (devtools > persist > immer)
- [ ] Selector hooks are created for performance
- [ ] Actions are grouped in an `actions` object
- [ ] Only necessary state is persisted

For detailed rules, examples, and anti-patterns, please consult `references/patterns.md`.

## Guiding Principle
> Code is read far more often than written. Optimize for the next developer.