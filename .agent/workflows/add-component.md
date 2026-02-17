---
description: Add a new UI component using shadcn/ui
---

# Add UI Component

Use this workflow to add new components from shadcn/ui to the design system.

1. Add Component
   ```bash
   bunx shadcn-ui@latest add [component-name]
   # Example: bunx shadcn-ui@latest add accordion
   ```

2. Verify Component
   Check `components/ui/[component-name].tsx` for any type errors.
   
3. Update Design System Page (Optional)
   Add a demo of the component to `app/design-system/page.tsx`.

4. Run Verification
   // turbo
   ```bash
   bun run type-check
   ```
