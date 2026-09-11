# Postgram Backend

Backend API for **Postgram** — a social media app (posts, likes, comments, profiles) built with NestJS, Prisma, and PostgreSQL, containerized with Docker.

## Tech Stack

- **Backend:** NestJS (Node.js)
- **ORM:** Prisma 5
- **Database:** PostgreSQL
- **Containerization:** Docker & Docker Compose

## Prerequisites

1. **Docker Desktop** — [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
   - Check your chip: `uname -m` (Mac) — `arm64` = Apple Silicon, `x86_64` = Intel
   - Open it once, wait for the whale icon to show "running"
   - Verify: `docker --version` and `docker run hello-world`

2. **Git** — verify with `git --version`

3. Code editor (VS Code, Antigravity, etc.) — optional but recommended

You do **not** need Node.js, npm, or PostgreSQL installed separately — Docker handles all of that.

## Getting the Code

```bash
git clone https://github.com/HiLITE-Technologies/postgram-backend
cd postgram-backend
```

## Project Structure
postgram-backend/
├── src/
│ ├── auth/ # login, signup, JWT
│ ├── users/
│ ├── profiles/ # first/last name, dob, address, bio, visibility
│ ├── posts/
│ ├── comments/
│ ├── likes/
│ ├── media/ # image upload handling
│ ├── common/ # shared guards, decorators, filters, pipes, utils
│ ├── config/
│ ├── database/ # Prisma service/module
│ ├── app.module.ts
│ └── main.ts
│
├── prisma/
│ ├── schema.prisma # data model (User, Profile, Post, PostImage, Like, Comment)
│ └── migrations/
│
├── Dockerfile
├── docker-compose.yml # orchestrates backend + database (2 containers)
└── .env # DATABASE_URL, JWT_SECRET (not committed)

**This repo only runs the backend + database — it does not include or start the frontend.** The frontend lives in its own fully separate repo with its own standalone Docker setup: [postgram-frontend](https://github.com/HiLITE-Technologies/postgram-frontend).

## Running This Repo

```bash
docker compose up --build
```

Starts two containers: `backend` (NestJS, port 3000) and `database` (Postgres, port 5432).

Stop everything:
```bash
docker compose down
```
(Database data persists in a Docker volume — use `docker compose down -v` to wipe it completely.)

## First-Time Database Setup

After the containers are running for the first time:
```bash
docker compose exec backend npx prisma migrate dev
```
This applies the schema and creates all tables.

## Keeping Your Local Setup in Sync

Whenever `Dockerfile`, `docker-compose.yml`, `package.json`, or `prisma/schema.prisma` change on `main`, pull and rebuild — a plain `git pull` alone won't update your running containers.

```bash
git pull origin main
docker compose down --remove-orphans
docker compose up --build
```

If the schema changed:
```bash
docker compose exec backend npx prisma migrate dev
```

**Rule of thumb:** if you only edited files inside `src/`, hot-reload handles it automatically — no rebuild needed. If you touched `Dockerfile`, `docker-compose.yml`, `package.json`, or `prisma/schema.prisma`, rebuild.

## Day-to-Day Workflow

```bash
git pull
docker compose up --build
```
Edit code in `src/` — hot-reloads automatically.

```bash
docker compose down
```
When done for the day.

## Database Access

```bash
docker compose exec database psql -U postgres -d postgram_db
```
Default local credentials (dev only): user `postgres`, password `postgres`, database `postgram_db`.

## Useful Commands

| Command | What it does |
|---|---|
| `docker compose ps` | Check running containers |
| `docker compose logs -f backend` | Stream backend logs |
| `docker compose exec backend sh` | Shell into the backend container |
| `docker compose exec backend npx prisma studio` | Visual database browser (port 5555) |
| `docker compose exec backend npx prisma migrate dev` | Apply schema changes |

## Environment Variables

`.env` (not committed) must contain:
DATABASE_URL="postgresql://postgres:postgres@database:5432/postgram_db"
JWT_SECRET="change-this-in-real-use"

## Contributing

1. `git checkout -b feature/your-feature-name`
2. Make changes, test locally
3. `git push origin feature/your-feature-name`
4. Open a Pull Request

## Troubleshooting

- **"command not found: docker"** → Docker Desktop isn't running.
- **Port already in use** → something else is using 3000 or 5432; stop it or change the port mapping.
- **Old/orphaned containers lingering** → `docker compose down --remove-orphans`
- **Prisma errors after pulling** → run `docker compose exec backend npx prisma generate` and `npx prisma migrate dev`
