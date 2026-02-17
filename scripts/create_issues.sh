#!/bin/bash

# Create Labels first
gh label create "Phase 1" --color "0E8A16" --description "Foundation & CI/CD" --force
gh label create "Phase 2" --color "FBCA04" --description "Recipe Engine" --force
gh label create "Phase 3" --color "D93F0B" --description "Smart Pantry" --force
gh label create "Phase 4" --color "1D76DB" --description "Planner & Shopping" --force
gh label create "Phase 5" --color "0052CC" --description "Verification & Launch" --force
gh label create "CI/CD" --color "5319E7" --force
gh label create "Database" --color "BFD4F2" --force
gh label create "Auth" --color "E99695" --force
gh label create "UI" --color "C5DEF5" --force
gh label create "AI" --color "D93F0B" --force
gh label create "Feature" --color "A2EEEF" --force
gh label create "Logic" --color "006B75" --force
gh label create "Quality" --color "C2E0C6" --force
gh label create "Performance" --color "F9D0C4" --force
gh label create "Testing" --color "FEF2C0" --force
gh label create "Docs" --color "0075ca" --force

# Phase 1: Foundation & Infrastructure
gh issue create --title "Phase 1: CI/CD Pipeline Setup" --body "**Goal**: Set up automated workflows.\n**Tech**: \`github-actions-templates\`\n**Definition of Done**: Actions for linting, testing, and build checks are active." --label "Phase 1" --label "CI/CD"
gh issue create --title "Phase 1: Database Initialization" --body "**Goal**: Initialize Postgres DB.\n**Tech**: Prisma / Postgres\n**Definition of Done**: Schema applied, local DB running, seed script created." --label "Phase 1" --label "Database"
gh issue create --title "Phase 1: Authentication Flow" --body "**Goal**: Implement user auth.\n**Tech**: NextAuth.js\n**Definition of Done**: Google Auth working, protected routes established." --label "Phase 1" --label "Auth"
gh issue create --title "Phase 1: Design System Setup" --body "**Goal**: Establish UI foundation.\n**Tech**: Tailwind / shadcn\n**Definition of Done**: Theme tokens defined, layout components created." --label "Phase 1" --label "UI"

# Phase 2: Recipe Engine
gh issue create --title "Phase 2: Recipe Data Model" --body "**Goal**: Define recipe schema.\n**Tech**: Prisma\n**Definition of Done**: Models for Recipe, Ingredient, Instruction created." --label "Phase 2" --label "Database"
gh issue create --title "Phase 2: AI Parsing Service" --body "**Goal**: Extract recipes from text.\n**Tech**: Gemini API\n**Definition of Done**: Server action to extract JSON from text/URL." --label "Phase 2" --label "AI"
gh issue create --title "Phase 2: Recipe View UI" --body "**Goal**: Display recipes.\n**Tech**: \`vercel-react-best-practices\`\n**Definition of Done**: Optimized images, responsive layout." --label "Phase 2" --label "UI"
gh issue create --title "Phase 2: Manual Entry Form" --body "**Goal**: Edit/Create recipes manually.\n**Tech**: React Hook Form\n**Definition of Done**: Complex form for editing ingredients/steps." --label "Phase 2" --label "UI"
gh issue create --title "Phase 2: Image OCR Integration" --body "**Goal**: Parse recipes from images.\n**Tech**: Gemini Vision\n**Definition of Done**: Upload image -> Parse text -> Auto-fill form." --label "Phase 2" --label "AI"

# Phase 3: Smart Pantry
gh issue create --title "Phase 3: Pantry Schema & API" --body "**Goal**: Backend for inventory.\n**Tech**: Prisma\n**Definition of Done**: PantryItem model with expiration and status logic." --label "Phase 3" --label "Database"
gh issue create --title "Phase 3: Inventory Dashboard" --body "**Goal**: Manage pantry items.\n**Tech**: Recoil / Zustand\n**Definition of Done**: Real-time view of stock levels with optimistic updates." --label "Phase 3" --label "UI"
gh issue create --title "Phase 3: Barcode Scanner" --body "**Goal**: Easy item entry.\n**Tech**: QuaggaJS / API\n**Definition of Done**: Scan barcode -> fetch product metadata." --label "Phase 3" --label "Feature"
gh issue create --title "Phase 3: Recipe-Pantry Matching" --body "**Goal**: Link recipes to stock.\n**Tech**: Logic\n**Definition of Done**: 'Can I cook this?' indicator based on stock." --label "Phase 3" --label "Logic"

# Phase 4: Meal Planner & Shopping
gh issue create --title "Phase 4: Drag-and-Drop Planner" --body "**Goal**: Weekly meal scheduling.\n**Tech**: dnd-kit\n**Definition of Done**: Calendar view to schedule recipes for meal slots." --label "Phase 4" --label "UI"
gh issue create --title "Phase 4: Shopping List Gen" --body "**Goal**: Auto-generate lists.\n**Tech**: Logic\n**Definition of Done**: Planner + Pantry delta = Shopping List." --label "Phase 4" --label "Logic"
gh issue create --title "Phase 4: Shopping Mode" --body "**Goal**: In-store helper.\n**Tech**: PWA / Wake Lock\n**Definition of Done**: Mobile-first view with wake lock." --label "Phase 4" --label "UI"
gh issue create --title "Phase 4: Cooking Mode" --body "**Goal**: Kitchen assistant.\n**Tech**: PWA / Wake Lock\n**Definition of Done**: Step-by-step view with timers." --label "Phase 4" --label "UI"

# Phase 5: Verification & Launch
gh issue create --title "Phase 5: UI/UX Audit" --body "**Goal**: Ensure quality.\n**Tech**: \`web-design-guidelines\`\n**Definition of Done**: Full pass on all pages for consistency and a11y." --label "Phase 5" --label "Quality"
gh issue create --title "Phase 5: Performance Tuning" --body "**Goal**: Optimize speed.\n**Tech**: \`vercel-react-best-practices\`\n**Definition of Done**: Lighthouse score > 90, eliminate waterfall requests." --label "Phase 5" --label "Performance"
gh issue create --title "Phase 5: End-to-End Testing" --body "**Goal**: Verify flows.\n**Tech**: Playwright\n**Definition of Done**: Critical flows (Auth -> Cook -> Shop) verified." --label "Phase 5" --label "Testing"
gh issue create --title "Phase 5: Documentation" --body "**Goal**: Finalize knowledge base.\n**Tech**: \`documentation-engineer\`\n**Definition of Done**: Final logic documentation and user guides." --label "Phase 5" --label "Docs"

echo "All issues created!"
