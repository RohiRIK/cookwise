---
title: CookWise Changelog
description: Kitchen-OS Documentation
---

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io

---

## [Unreleased]

### Planned Features
- Recipe scaling (adjust servings)
- Nutritional information tracking
- Meal prep mode (batch cooking)
- Recipe sharing between households
- Mobile app (iOS/Android)
- Barcode scanning for pantry items
- Price tracking across stores

---

## [0.1.0] - 2026-02-17

### Added
- **Initial documentation structure**
  - Product Requirements Document (PRD)
  - Database schema with Prisma
  - Technical specification
  - AI prompt engineering guide
  - User flows for cooking and shopping
  - API reference
  - Development setup guide
  - Template customization guide
  - Component library
  - Server actions guide
  - Authentication guide
  - AI integration guide
  - Feature guides (Recipes, Pantry, Meal Planning, Shopping)
  - Operations guides (Deployment, Migrations, Monitoring)
  - User-facing docs (User Guide, FAQ)

- **Core architecture designed**
  - Multi-tenant household model
  - Next.js App Router structure
  - PostgreSQL + Prisma ORM
  - Google Gemini AI integration
  - shadcn/ui component library

### Technical Foundation
- Database schema with 11 models
- 6 enums for type safety
- Household-based data isolation
- Optimistic UI patterns
- Wake lock for shopping mode
- OCR recipe parsing
- URL scraping capability

---

## Future Versions

### [1.0.0] - MVP (Planned)
- Recipe management (CRUD + OCR)
- Pantry tracking
- Meal planning calendar
- Shopping list generation
- Mobile shopping mode
- Household authentication

### [1.1.0] - Enhancements
- Recipe rating and reviews
- Advanced search filters
- Meal plan templates
- Shopping list sharing improvements
- Pantry expiry tracking

### [1.2.0] - Intelligence
- Smart recipe recommendations
- Automated meal suggestions
- Pantry-first recipe filtering
- Waste reduction insights

### [2.0.0] - Platform Expansion
- Native mobile apps
- Recipe video support
- Social features (optional sharing)
- Integration with grocery delivery
- Price comparison across stores

---

## Version Numbering

CookWise follows [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH**
- **MAJOR:** Breaking changes
- **MINOR:** New features (backwards compatible)
- **PATCH:** Bug fixes (backwards compatible)

---

## Release Notes Format

Each release includes:
- **Added:** New features
- **Changed:** Changes to existing functionality
- **Deprecated:** Soon-to-be removed features
- **Removed:** Removed features
- **Fixed:** Bug fixes
- **Security:** Security improvements

---

*Last Updated: 2026-02-17 | CookWise Technical Team*
