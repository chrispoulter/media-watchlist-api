# Media Watchlist API

A REST API for tracking movies and TV shows you want to watch. Built with Express, TypeScript, and PostgreSQL.

## Features

- Email/password authentication and social login (Google OAuth)
- Email verification and password reset flows
- Two-factor authentication (TOTP)
- Search for movies and TV shows via The Movie Database (TMDB)
- Personal watchlist management — add and remove items
- Transactional emails with React Email templates
- Interactive API documentation (Scalar) at the root route
- Docker Compose for local development

## Tech Stack

| Layer            | Technology                  |
| ---------------- | --------------------------- |
| Runtime          | Node.js 24, TypeScript      |
| Framework        | Express 5                   |
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

### Docker Compose (recommended)

Starts the API, a PostgreSQL database, and [Mailpit](https://mailpit.axllent.org) for local email testing:

```bash
cp .env.example .env
# Fill in required values in .env (see Environment Variables below)
docker-compose up
```

| Service            | URL                   |
| ------------------ | --------------------- |
| API                | http://localhost:3000 |
| Interactive docs   | http://localhost:3000 |
| Mailpit (email UI) | http://localhost:8025 |

### Manual Setup

```bash
npm install
cp .env.example .env
# Fill in required values in .env

npm run db:create
npm run db:migrate
npm run dev
```

## Environment Variables

| Variable               | Required | Default                 | Description                                                      |
| ---------------------- | -------- | ----------------------- | ---------------------------------------------------------------- |
| `PORT`                 | No       | `3000`                  | Port the server listens on                                       |
| `DATABASE_URL`         | Yes      | —                       | PostgreSQL connection string                                     |
| `BETTER_AUTH_SECRET`   | Yes      | —                       | Auth signing secret (min 32 chars)                               |
| `BETTER_AUTH_URL`      | No       | `http://localhost:3000` | Public base URL of the API                                       |
| `CLIENT_ORIGIN`        | Yes      | —                       | Allowed CORS origin(s), comma-separated                          |
| `GOOGLE_CLIENT_ID`     | No       | —                       | Google OAuth client ID                                           |
| `GOOGLE_CLIENT_SECRET` | No       | —                       | Google OAuth client secret                                       |
| `TMDB_API_READ_TOKEN`  | No       | —                       | TMDB API read access token                                       |
| `SMTP_HOST`            | No       | `localhost`             | SMTP server host                                                 |
| `SMTP_PORT`            | No       | `587`                   | SMTP server port                                                 |
| `SMTP_USER`            | No       | —                       | SMTP username                                                    |
| `SMTP_PASS`            | No       | —                       | SMTP password                                                    |
| `SMTP_FROM`            | No       | —                       | From address for outgoing emails                                 |
| `SMTP_SECURE`          | No       | —                       | Use TLS/SSL for SMTP                                             |
| `LOG_LEVEL`            | No       | `info`                  | Log level: `fatal`, `error`, `warn`, `info`, `debug`, or `trace` |

## API Overview

Interactive documentation with a request explorer is available at `GET /` when the server is running.

### Health

| Method | Path          | Auth | Description                                  |
| ------ | ------------- | ---- | -------------------------------------------- |
| GET    | `/api/health` | No   | Returns server status, uptime, and timestamp |

### Authentication (`/api/auth/*`)

All auth routes are handled by Better Auth. Requests requiring authentication use a Bearer token in the `Authorization` header.

| Method | Path                               | Description                           |
| ------ | ---------------------------------- | ------------------------------------- |
| POST   | `/api/auth/sign-up/email`          | Register with email and password      |
| POST   | `/api/auth/sign-in/email`          | Sign in with email and password       |
| POST   | `/api/auth/sign-out`               | Sign out                              |
| GET    | `/api/auth/get-session`            | Get current session                   |
| GET    | `/api/auth/sign-in/social`         | Sign in with Google                   |
| POST   | `/api/auth/forget-password`        | Request password reset                |
| POST   | `/api/auth/reset-password`         | Reset password with token             |
| POST   | `/api/auth/two-factor/enable`      | Enable TOTP two-factor authentication |
| POST   | `/api/auth/two-factor/disable`     | Disable two-factor authentication     |
| POST   | `/api/auth/two-factor/verify-totp` | Verify a TOTP code                    |

### Search

| Method | Path                        | Auth | Description                         |
| ------ | --------------------------- | ---- | ----------------------------------- |
| GET    | `/api/search?query=<query>` | Yes  | Search TMDB for movies and TV shows |

### Watchlist

| Method | Path                 | Auth | Description                       |
| ------ | -------------------- | ---- | --------------------------------- |
| GET    | `/api/watchlist`     | Yes  | Get the current user's watchlist  |
| POST   | `/api/watchlist`     | Yes  | Add an item to the watchlist      |
| DELETE | `/api/watchlist/:id` | Yes  | Remove an item from the watchlist |

**Add item request body:**

```json
{
  "providerId": "tmdb:550",
  "mediaType": "movie",
  "title": "Fight Club",
  "posterUrl": "https://image.tmdb.org/t/p/w300/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg",
  "overview": "...",
  "releaseDate": "1999-10-15"
}
```

## Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start development server with hot reload |
| `npm run build`       | Compile TypeScript to `dist/`            |
| `npm run start`       | Run the compiled server                  |
| `npm run typecheck`   | Run TypeScript type checking             |
| `npm run lint`        | Run ESLint                               |
| `npm run format`      | Format code with Prettier                |
| `npm run db:create`   | Create the database                      |
| `npm run db:drop`     | Drop the database                        |
| `npm run db:generate` | Generate a new Drizzle migration         |
| `npm run db:migrate`  | Apply pending migrations                 |
| `npm run db:studio`   | Open Drizzle Studio                      |
| `npm run email:dev`   | Preview email templates (port 3001)      |

## CI/CD

A single CI workflow runs on every push and pull request to any branch. It type checks, lints, and builds the project using Node.js 24.

## License

[MIT](LICENSE)
