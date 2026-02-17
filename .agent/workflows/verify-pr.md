---
description: Verify code quality before pushing (Lint, Type-Check, Test)
---

# Verify Pull Request

Run this workflow before pushing changes to ensure CI compliance.

1. Linting (Auto-fix)
   // turbo
   ```bash
   bun run lint -- --fix
   ```

2. Build Contentlayer (Required for types)
   // turbo
   ```bash
   bunx contentlayer build
   ```

3. Type Checking
   // turbo
   ```bash
   bun run type-check
   ```

4. Run Tests
   // turbo
   ```bash
   bun test
   ```
