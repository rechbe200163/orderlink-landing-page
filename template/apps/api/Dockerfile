# syntax=docker/dockerfile:1

# ------------------------
# deps
# ------------------------
FROM node:22-alpine AS deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json

# falls du weitere workspace packages importierst:
COPY packages ./packages

RUN pnpm install --frozen-lockfile


# ------------------------
# build
# ------------------------
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NODE_ENV=production

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /repo/packages/database/node_modules ./packages/database/node_modules
COPY . .

RUN pnpm --filter @workspace/database run generate
RUN pnpm --filter @workspace/database run build
RUN pnpm --filter api run build

# ------------------------
# runner
# ------------------------
FROM node:22-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

# ✅ Workspace-Manifests (Root bleibt Root!)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json

# ✅ Workspace code, den pnpm für workspace:* braucht
COPY --from=build /repo/packages/database ./packages/database

# ✅ Nur prod deps installieren (im Workspace-Kontext)
RUN pnpm install --prod --frozen-lockfile
RUN pnpm --filter @workspace/database run generate
# ✅ Build output der API rein
COPY --from=build /repo/apps/api/dist ./apps/api/dist

EXPOSE 3001
CMD ["node", "apps/api/dist/src/main.js"]

