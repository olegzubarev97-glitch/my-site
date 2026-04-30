# Admin Authentication Guide

## Overview

The admin panel uses **JWT-based authentication** with username and password.
Kimi OAuth has been completely removed from the project.

## Default Admin Credentials

| Field    | Value  |
|----------|--------|
| Username | `admin` |
| Password | `admin` |

These credentials are automatically seeded into the database on first run.

## How to Log In

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/login in your browser

3. Enter the credentials:
   - **Username:** `admin`
   - **Password:** `admin`

4. Click **Sign in** — you will be redirected to the admin panel at `/admin`

## How to Change Admin Password

### Option 1: Directly in the Database

Connect to the MySQL database and update the password hash:

```sql
-- Example: update admin password
-- You need to generate a new hash first using the hashPassword function
```

Or use the Node.js script approach:

```bash
node -e "
import { hashPassword } from './api/lib/password.js';
import { getDb } from './api/queries/connection.js';
import { users } from './db/schema.js';
import { eq } from 'drizzle-orm';

async function changePassword(username, newPassword) {
  const hash = await hashPassword(newPassword);
  const db = getDb();
  await db.update(users).set({ passwordHash: hash }).where(eq(users.unionId, username));
  console.log('Password updated for', username);
}

changePassword('admin', 'your-new-password');
"
```

### Option 2: Add a Password Change Feature in Admin Panel

You can extend the admin panel by adding a "Change Password" form that calls a new tRPC mutation.

## How to Create Additional Admin Users

Insert a new user directly into the database with `role = 'admin'`:

```bash
node -e "
import { hashPassword } from './api/lib/password.js';
import { getDb } from './api/queries/connection.js';
import { users } from './db/schema.js';

async function createAdmin(username, password, name) {
  const hash = await hashPassword(password);
  const db = getDb();
  await db.insert(users).values({
    unionId: username,
    name: name || username,
    passwordHash: hash,
    role: 'admin',
    lastSignInAt: new Date(),
  });
  console.log('Admin created:', username);
}

createAdmin('newadmin', 'securepassword', 'New Admin');
"
```

## Authentication Flow

1. User submits username/password to `auth.login` tRPC mutation
2. Server verifies password using `scrypt` hashing with salt
3. On success, server issues a JWT session token stored in `kimi_sid` cookie
4. The cookie is `HttpOnly`, `SameSite=Lax` on localhost, and valid for 1 year
5. All subsequent requests automatically include the cookie
6. The `auth.me` endpoint returns the current user (without password hash)
7. `auth.logout` clears the session cookie

## Security Notes

- **Change the default password immediately** in production
- Passwords are hashed using `scrypt` with a random 16-byte salt
- Session tokens are JWT signed with `APP_SECRET` from `.env`
- The `passwordHash` field is never exposed in API responses
- On production, cookies are automatically set to `Secure` and `SameSite=None`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid username or password" | Check that the admin user exists in DB and passwordHash is set |
| Redirected back to login | Session cookie may be expired or missing; check browser cookies for `kimi_sid` |
| "Authentication required" on `/admin` | Log in first at `/login` |
| Database connection error | Ensure MySQL Docker container is running: `docker compose up -d db` |

## Files Changed for This Feature

- `db/schema.ts` — added `passwordHash` column to `users`
- `db/seed.ts` — seeds default admin user
- `api/auth-router.ts` — login/logout/me endpoints (replaced OAuth)
- `api/lib/auth.ts` — new request authentication (replaced Kimi OAuth)
- `api/lib/password.ts` — password hashing utilities
- `api/context.ts` — updated to use new auth
- `api/boot.ts` — removed OAuth callback handler
- `src/pages/Login.tsx` — username/password form (replaced Kimi OAuth button)
- `src/pages/Admin.tsx` — redirect to `/login` instead of `/`
