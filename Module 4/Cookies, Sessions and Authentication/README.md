# LU48 — Session-Based Authentication

## Overview

This project implements session-based authentication using Express, Prisma, bcryptjs, and signed HTTP cookies.

## Features

- Login with email and password.
- Password verification using `bcryptjs`.
- Cryptographically random session IDs.
- Server-side session storage with expiration.
- Signed, HTTP-only session cookies.
- Protected user profile endpoint.
- Logout that destroys the server-side session.
- Generic authentication error responses.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Set `COOKIE_SECRET` in `.env` to a random secret containing at least 32 characters.

4. Prepare the database and seed the demo user:

```bash
npm run setup
```

5. Start the development server:

```bash
npm run dev
```

The API runs at `http://localhost:3000` by default.

## Demo Account

- Email: `sam@example.com`
- Password: `SessionDemo!48`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate and create a session |
| GET | `/auth/me` | Get the authenticated user's details |
| POST | `/auth/logout` | Destroy the session and clear the cookie |

## Testing

Use Postman or curl with a cookie jar to preserve the session cookie.

Example login:

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/auth/login
```

Send a JSON body containing the demo email and password with the `Content-Type: application/json` header.

Access the protected endpoint:

```bash
curl -i -b cookies.txt http://localhost:3000/auth/me
```

Logout:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
```

## Session Storage

The current implementation uses an in-memory `Map` for learning and local development. Sessions are lost when the server restarts. A production deployment should use shared, persistent session storage with expiration, such as Redis.

## Security Configuration

- `COOKIE_SECRET` must contain at least 32 characters.
- Use `COOKIE_SECURE=false` for local HTTP development.
- Use `COOKIE_SECURE=true` when deployed over HTTPS.
- Keep `.env` and other secrets out of version control.
- The API returns safe user details and does not expose password hashes.

## Project Structure

- `src/routes/authRoutes.js` — authentication endpoints.
- `src/middleware/requireSession.js` — session authentication middleware.
- `src/session/sessionStore.js` — server-side session management.
- `src/config/cookieConfig.js` — cookie and session configuration.
- `src/repositories/userRepository.js` — Prisma user queries.
- `src/db/prisma.js` — Prisma client.
- `prisma/` — database schema and seed script.