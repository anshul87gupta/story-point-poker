# Docker + WSL Setup — Linting, Formatting, Testing

This project runs two separate environments, and the new tooling (ESLint, Prettier, Vitest,
Playwright, Husky) doesn't fit into just one of them cleanly. Read this before running anything.

## How your two environments relate

- **Docker container** (`node:22-alpine`, defined by your `Dockerfile`/`docker-compose.yml`) —
  this is what runs the actual app (`npm run dev`). `npm install` happens once, at image build
  time.
- **WSL** (the host, outside any container) — this is a real Linux filesystem. `git commit`
  happens **here**, directly on the host, never inside the container.
- Your compose file's `- /app/node_modules` anonymous volume deliberately keeps the container's
  own `node_modules` separate from the folder bind-mounted from WSL (`- .:/app`). That's correct
  and intentional — but it also means **your WSL folder has no `node_modules` of its own**, only
  the container does.

## Why that matters for the new tooling

- **ESLint / Prettier / Vitest can run inside the container just fine.** `npm install` at image
  build time already pulls in devDependencies, so these work via `docker compose exec`.
- **Husky (git hooks) cannot run inside the container.** `git commit` happens on the WSL host,
  so the hook script needs `node_modules` to exist _there_ — which means a native `npm install`
  in WSL, separate from Docker, just for this.
- **Playwright (E2E) should not run inside this Alpine image.** Playwright's bundled Chromium
  expects a glibc-based Linux (Debian/Ubuntu) and doesn't officially support Alpine/musl. Run E2E
  natively in WSL instead — or let CI handle it (GitHub Actions' Ubuntu runners are glibc-based,
  which is exactly why the CI workflow doesn't use your Docker image at all — see below).

## One-time setup

**1. Rebuild the Docker image** (picks up the new devDependencies added to `package.json`):

```
docker compose build
```

**2. Install natively in WSL too** (for git hooks + your editor's ESLint/Prettier integration):

```
npm install
```

Run this directly in your WSL terminal, in the project folder — not inside the container.

**3. Initialize Husky** (native, WSL):

```
npx husky init
```

**4. Install Playwright's browser** (native, WSL — not in Docker):

```
npx playwright install --with-deps chromium
```

## Day-to-day commands

| Task                 | Where        | Command                                                                      |
| -------------------- | ------------ | ---------------------------------------------------------------------------- |
| Start the app        | WSL          | `docker compose up`                                                          |
| Lint                 | either       | `docker compose exec react npm run lint` _or_ `npm run lint`                 |
| Format check         | either       | `docker compose exec react npm run format:check` _or_ `npm run format:check` |
| Unit/component tests | either       | `docker compose exec react npm run test` _or_ `npm run test`                 |
| E2E tests            | **WSL only** | `npm run test:e2e`                                                           |
| Git commit           | WSL          | `git commit -m "..."` — lint-staged runs automatically                       |

## CI (GitHub Actions)

CI intentionally does **not** use your Docker image — it installs Node directly on Ubuntu
runners and runs `npm ci`. This sidesteps the Alpine/Playwright mismatch entirely and skips an
image-build step, so it's both simpler and faster. Your Docker setup and CI's environment are
allowed to differ, since `package.json` (not the OS underneath) is the real source of truth for
what gets installed and run.

## If you'd rather not maintain two install locations

The dual native-WSL + Docker install above is the standard, low-effort pattern most teams use —
but if it bothers you, the alternative is rewriting `.husky/pre-commit` to shell out to
`docker compose exec react npx lint-staged` instead of running bare `npx lint-staged`. That
couples every commit to the container being up (`docker compose up -d` first), which is more
moving parts for an MVP-stage project — not recommended unless the duplication genuinely becomes
a pain point.
