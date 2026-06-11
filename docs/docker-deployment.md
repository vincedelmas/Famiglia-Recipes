# Docker Deployment

This deployment setup is intended to run from this repository root with
`docker compose`.

Persistent storage should live outside the repository, one directory above it,
so database and uploaded image files are not mixed with source files.

## Directory Layout

```text
parent-folder/
  data/
    db/
    images/
  Famiglia-Recipes/
    ...
```

## Environment File

Copy the example file and fill in the secrets:

```bash
cp .env.docker.example .env.docker
```

## Build-Time Env File

The current `Dockerfile` reads `.env.docker` during `bun run build`:

```dockerfile
RUN --mount=type=bind,source=.env.docker,target=/app/.env \
    SKIP_ENV_VALIDATION=true \
    bun run build
```

Because the Docker build context is the repository root, `.env.docker` must
exist at the repo root when building.

## Run

Start the app:

```bash
docker compose up --build -d
```

View logs:

```bash
docker compose logs -f recipes
```

Stop the app:

```bash
docker compose down
```

## Migrations

The container entrypoint runs database migrations on startup:

```sh
bun run dk migrate
```

Migration files are expected at `/app/drizzle` inside the image.

## Network

The Compose file expects an external Docker network named `web_net`:

```yaml
networks:
  web_net:
    external: true
```

Create it once if it does not already exist:

```bash
docker network create web_net
```
