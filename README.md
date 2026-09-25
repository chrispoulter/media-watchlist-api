# Media Watchlist API

A REST API for tracking movies and TV shows you want to watch. Built with Hono, TypeScript, and PostgreSQL.

## Features

- Email/password authentication and social login (Google OAuth)
- Email verification and password reset flows
- Two-factor authentication (TOTP)
- Search for movies and TV shows via The Movie Database (TMDB)
- Personal watchlist management — add, remove, and reorder items
- Transactional emails with React Email templates
- Interactive API documentation (Scalar) at the root route
- Docker Compose for local development

## Tech Stack

| Layer            | Technology                  |
| ---------------- | --------------------------- |
| Runtime          | Node.js 24, TypeScript      |
| Framework        | Hono 4                      |
| Database         | PostgreSQL 17 + Drizzle ORM |
| Authentication   | Better Auth                 |
| Media Search     | TMDB API                    |
| Email            | Nodemailer + React Email    |
| API Docs         | Scalar (OpenAPI)            |
| Logging          | Pino                        |
| Containerisation | Docker, Docker Compose      |

## Prerequisites

- [Node.js 24+](https://nodejs.org)
- [Docker](https://www.docker.com) (for local dev via Docker Compose)
- [TMDB API read token](https://developer.themoviedb.org/docs/getting-started) (for search)
- Google OAuth credentials (optional — for social login)

## Getting Started

### Docker Compose

Starts the API, a PostgreSQL database, and [Mailpit](https://mailpit.axllent.org) for local email testing:

```bash
cp .env.example .env
# Fill in required values in .env (see Environment Variables below)
docker-compose up
```

| Service | URL                   |
| ------- | --------------------- |
| API     | http://localhost:3000 |
| Mailpit | http://localhost:8025 |

### Manual Setup

```bash
npm install
cp .env.example .env
# Fill in required values in .env

npm run db:migrate
npm run dev
```

## Environment Variables

| Variable               | Required | Default                 | Description                                                         |
| ---------------------- | -------- | ----------------------- | ------------------------------------------------------------------- |
| `PORT`                 | No       | `3000`                  | Port the server listens on                                          |
| `DATABASE_URL`         | Yes      | —                       | PostgreSQL connection string                                        |
| `BETTER_AUTH_SECRET`   | Yes      | —                       | Auth signing secret (min 32 chars)                                  |
| `BETTER_AUTH_URL`      | No       | `http://localhost:3000` | Public base URL of the API                                          |
| `CLIENT_ORIGIN`        | No       | `http://localhost:5173` | Allowed CORS origin(s), comma-separated                             |
| `GOOGLE_CLIENT_ID`     | No       | —                       | Google OAuth client ID                                              |
| `GOOGLE_CLIENT_SECRET` | No       | —                       | Google OAuth client secret                                          |
| `TMDB_API_READ_TOKEN`  | Yes      | —                       | TMDB API read access token                                          |
| `SMTP_HOST`            | No       | `localhost`             | SMTP server host                                                    |
| `SMTP_PORT`            | No       | `587`                   | SMTP server port                                                    |
| `SMTP_SECURE`          | No       | `false`                 | Use TLS/SSL for SMTP                                                |
| `SMTP_FROM`            | Yes      | —                       | From address for outgoing emails                                    |
| `SMTP_USER`            | No       | —                       | SMTP username                                                       |
| `SMTP_PASS`            | No       | —                       | SMTP password                                                       |
| `LOG_LEVEL`            | No       | `info`                  | Log level: `fatal`, `error`, `warning`, `info`, `debug`, or `trace` |

## API Documentation

Interactive documentation with a request explorer is served at [`/reference`](http://localhost:3000/reference).

The raw OpenAPI specs are also available:

| Path                 | Description                            |
| -------------------- | -------------------------------------- |
| `/openapi.json`      | App routes (health, search, watchlist) |
| `/auth-openapi.json` | Authentication routes (Better Auth)    |

## Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start development server with hot reload |
| `npm run build`       | Compile TypeScript to `dist/`            |
| `npm run start`       | Run the compiled server                  |
| `npm run typecheck`   | Run TypeScript type checking             |
| `npm run lint`        | Run ESLint                               |
| `npm run format`      | Format code with Prettier                |
| `npm run db:generate` | Generate a new Drizzle migration         |
| `npm run db:migrate`  | Apply pending migrations                 |
| `npm run db:studio`   | Open Drizzle Studio                      |
| `npm run email:dev`   | Preview email templates (port 3001)      |

## CI/CD

A single CI workflow runs on every push and pull request to any branch. It type checks, lints, and builds the project using Node.js 24.

## License

[MIT](LICENSE)
