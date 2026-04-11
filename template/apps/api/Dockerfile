# syntax=docker/dockerfile:1

# ------------------------
# deps
# ------------------------
FROM node:22-alpine AS deps
WORKDIR /repo
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json

# Wenn weitere workspace packages in apps/api oder packages/database verwendet werden,
# hier ebenfalls nur deren package.json gezielt reinkopieren.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm fetch --frozen-lockfile && \
    pnpm install --frozen-lockfile --offline


# ------------------------
# build
# ------------------------
FROM node:22-alpine AS build
WORKDIR /repo
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@latest --activate
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}

COPY apps ./apps
COPY packages ./packages
COPY tsconfig*.json ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm --filter @workspace/database run generate && \
    pnpm --filter @workspace/database run build && \
    pnpm --filter api run build

# ------------------------
# runner
# ------------------------
FROM node:22-alpine AS runner
WORKDIR /repo
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}
RUN apk add --no-cache postgresql-client

RUN corepack enable && corepack prepare pnpm@latest --activate

# ✅ Workspace-Manifests (Root bleibt Root!)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json

# ✅ Workspace code, den pnpm für workspace:* braucht
COPY --from=build /repo/packages/database ./packages/database

# ✅ Nur prod deps installieren (im Workspace-Kontext)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --prod --frozen-lockfile
RUN pnpm --filter @workspace/database run generate
# ✅ Build output der API rein
COPY --from=build /repo/apps/api/dist ./apps/api/dist

EXPOSE 3001
CMD ["node", "apps/api/dist/src/main.js"]
