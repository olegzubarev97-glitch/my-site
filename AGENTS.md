# Agent Guidelines

## Docker-First Deployment Rule

**After every completed task, the application server must be run ONLY via Docker.**

Never start `npm run dev` or `node dist/boot.js` directly on the host. Always use `docker compose`.

### Why
- The project relies on a Docker Compose stack (`db` + `app`).
- Running locally creates inconsistency (different Node versions, missing env vars, port conflicts).
- The old project (`papkasait`) was the same codebase before rename; it must not be resurrected locally.

### Correct workflow

1. **Apply DB schema changes locally** (safe — connects to the Docker DB via `localhost:3306`):
   ```bash
   npx drizzle-kit push
   ```

2. **Seed data (if needed)**:
   ```bash
   npx tsx db/seed.ts
   ```

3. **Build and start the full stack**:
   ```bash
   docker compose up --build -d
   ```

4. **Stop the stack**:
   ```bash
   docker compose down
   ```

### Port mapping
- App: `http://localhost:3000`
- DB: `localhost:3306` (MySQL inside Docker, exposed to host for local tools)

### If the old `papkasait` containers exist
Remove them before starting this project:
```bash
docker stop papkasait-app-1 papkasait-db-1
docker rm papkasait-app-1 papkasait-db-1
docker volume rm papkasait_mysql_data
```
