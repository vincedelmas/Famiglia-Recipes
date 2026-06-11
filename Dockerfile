FROM oven/bun:1.3.14 AS build

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

RUN --mount=type=bind,source=.env.docker,target=/app/.env \
    SKIP_ENV_VALIDATION=true \
    bun run build


FROM oven/bun:1.3.14 AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/public /app/public
COPY --from=build /app/public/static/recipe-images/default.png /app/seed-images/default.png
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/bun.lock /app/bun.lock
COPY --from=build /app/server.ts /app/server.ts
COPY --from=build /app/src /app/src
COPY --from=build /app/drizzle /app/drizzle
COPY --from=build /app/drizzle.config.ts /app/drizzle.config.ts
COPY --from=build /app/tsconfig.json /app/tsconfig.json

RUN rm -rf /app/public/static

EXPOSE 3000

CMD uploads_dir="${BASE_UPLOADS_LOCATION:-/app/storage/images}"; \
    mkdir -p /app/instance "$uploads_dir"; \
    echo "[INFO] Running database migrations..."; \
    bun run dk migrate; \
    echo "[SUCCESS] Database migrations complete"; \
    if [ -f /app/seed-images/default.png ]; then \
        cp -n /app/seed-images/default.png "$uploads_dir"/; \
    fi; \
    exec bun server.ts
