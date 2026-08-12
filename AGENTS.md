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

## Guiding Principle
> Code is read far more often than written. Optimize for the next developer.