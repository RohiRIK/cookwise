---
description: Reset and seed the local development database
---

# Database Reset & Seed

This workflow resets the local PostgreSQL database, pushes the latest schema, and seeds it with test data.

1. Ensure Docker is running
   ```bash
   docker ps
   # If not running:
   # docker-compose up -d
   ```

2. Reset Database (Interactive)
   // turbo
   ```bash
   bun prisma migrate reset --force
   ```
   *Note: Since we are using `db push` for prototyping, we use that instead of migrate for now.*

   Alternative (if not using migrations yet):
   ```bash
   bun prisma db push --force-reset
   ```

3. Seed Database
   // turbo
   ```bash
   bun prisma db seed
   ```

4. Verify Data (Optional)
   ```bash
   bunx prisma studio
   ```
