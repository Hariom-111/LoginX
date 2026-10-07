# Express TypeScript Auth API

Small Express API using Prisma with Supabase Postgres. A first login creates the user; later logins verify the stored bcrypt password hash.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`. Replace the Supabase project reference, region, and database password in both connection strings. Set `JWT_SECRET` to a long random secret.
3. Create the Prisma client and database tables: `npm run prisma:generate`, then `npm run prisma:migrate -- --name init`.
4. Start the development server: `npm run dev`.

Use the Supabase transaction pooler connection string (port `6543`) for `DATABASE_URL` and the direct database connection string (port `5432`) for `DIRECT_URL`. You can copy both from **Supabase Dashboard → Project Settings → Database → Connection string**. URL-encode special characters in the database password. Keep these values private.

## API

### `POST /api/auth/login`

Send a username or email in `username` and a password. If that username or email is new, the API creates the user and stores a bcrypt hash. New passwords must be at least 8 characters.

```json
{
  "username": "sam@example.com",
  "password": "a-long-password"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt>",
    "user": {
      "id": "<user-id>",
      "username": null
    }
  }
}
```

The response never includes the password or password hash. When a user is first created with an email address in `username`, the returned `username` is `null`; send a username value if the frontend needs one.

### `POST /api/auth/logout`

Protected endpoint. Send the access token in the `Authorization: Bearer <token>` header. The token is stored as revoked in the database, and cannot be used again. Tokens also expire according to `JWT_EXPIRES_IN`.

Successful response:

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

Errors use the same envelope with `success: false`, a safe `message`, and `data: null`. Requests to logout without a valid bearer token return HTTP `401 Unauthorized`.

## Production build

Run `npm run build`, then `npm start`. The TypeScript entry point is `src/index.ts`; the build produces `dist/index.js`.