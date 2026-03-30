# Next.js + NestJS Turborepo Template

Opinionated **monorepo starter template** for modern full-stack TypeScript projects.

Built to **avoid setup fatigue** and enforce sane defaults:
- one repo
- one package manager
- clear boundaries
- fast local dev

---

## ✨ Tech Stack

- **Turborepo** – task orchestration & caching
- **pnpm** – fast, deterministic package manager
- **Next.js** – frontend (App Router)
- **NestJS** – backend API
- **Prisma** – database ORM (shared client)
- **PostgreSQL** – via Docker
- **TypeScript** – everywhere

---

## 📁 Repository Structure

```
apps/
  web/        # Next.js frontend
  api/        # NestJS backend
packages/
  db/         # Prisma schema + generated client
  config/     # Shared tsconfig / eslint (optional)
docker/
docker-compose.yml
turbo.json
pnpm-workspace.yaml
```

**Apps = runnable services**  
**Packages = shared code only**

---

## 🚀 Getting Started

### 1. Use this template

Click **“Use this template”** on GitHub  
or create a new repo from it.

---

### 2. Install dependencies

```bash
pnpm install
```

---

### 3. Start the database

```bash
pnpm db:up
```

Postgres will be available on `localhost:5432`.

---

### 4. Run Prisma

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

---

### 5. Start development

```bash
pnpm dev
```

This starts:
- Next.js (`apps/web`)
- NestJS (`apps/api`)

in parallel via **Turborepo**.

---

## 🌍 Environment Variables

Each app manages its own `.env`.

### Root
Used for Docker only.

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
```

### `apps/api/.env`
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
JWT_SECRET=changeme
```

### `apps/web/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🧠 Design Decisions (Read This)

### Why Prisma as a shared package?
- single schema
- single client
- no duplication
- consistent types across backend

Import anywhere:
```ts
import { PrismaClient } from "@acme/db";
```

---

### Why NestJS as an app, not a package?
Because it:
- runs a server
- owns runtime config
- has lifecycle hooks

Treating it as a lib causes pain later.

---

### Why pnpm?
- fastest installs
- best monorepo support
- strict dependency boundaries

Mixing package managers = guaranteed problems.

---

## 🛠 Useful Commands

```bash
pnpm dev              # start all apps
pnpm build            # build everything
pnpm lint
pnpm typecheck

pnpm db:up
pnpm db:down

pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:studio
```

---

## 🧩 What This Template Does NOT Include (On Purpose)

- ❌ Auth (too opinionated early)
- ❌ Payments
- ❌ Microservices
- ❌ NextAuth
- ❌ Background jobs
- ❌ UI framework lock-in

Add these **per project**, not globally.

---

## 📌 Recommended Next Steps Per Project

- add Auth (JWT or NextAuth)
- add API client (OpenAPI / fetch wrapper)
- add Zod schemas
- add CI deployment
- add UI package if needed

---

## 🧼 Renaming / Customizing

Before starting a real project:
- replace `@acme/*` with your org name
- update repo name
- update README title
- update package.json names

---

## 🧠 Philosophy

> “Templates should remove friction, not creativity.”

This repo gives you:
- speed
- structure
- consistency

Everything else is your call.

---

## 📄 License

MIT – do whatever you want.
