ARG BUN_VERSION=1.4.4
FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .


ARG VITE_BASE_URL
RUN test -n "$VITE_BASE_URL"
RUN mkdir -p /tmp/build-db && \
    VITE_BASE_URL="$VITE_BASE_URL" \
    DATABASE_URL=/tmp/build-db/site.db \
    SKIP_ENV_VALIDATION=true \
    REGISTER_KEY=build-only \
    REGISTER_KEY_SALT=build-only \
    REGISTER_KEY_HASH=build-only \
    BETTER_AUTH_SECRET=build-only-not-a-runtime-secret \
    ADMIN_MAIL_USERNAME=build@example.invalid \
    ADMIN_MAIL_PASSWORD=build-only-password \
    OPEN_ROUTER_API_KEY=build-only \
    OPEN_ROUTER_MODEL_ID=build-only \
    bun run build


FROM oven/bun:${BUN_VERSION} AS production-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --omit=peer


FROM oven/bun:${BUN_VERSION}-slim AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=/data/db/site.db \
    BASE_UPLOADS_LOCATION=/data/images \
    UPLOADS_DIR_NAME=images


COPY --from=production-deps --chown=bun:bun /app/node_modules ./node_modules
COPY --from=build --chown=bun:bun /app/dist ./dist
COPY --chown=bun:bun package.json bun.lock server.ts drizzle.config.ts tsconfig.json ./
COPY --chown=bun:bun src ./src
COPY --chown=bun:bun drizzle ./drizzle
COPY --chown=bun:bun public ./public
RUN mkdir -p /data/db /data/images && chown -R bun:bun /data
USER bun
EXPOSE 3000


CMD ["bun", "server.ts"]
