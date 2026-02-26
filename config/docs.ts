import { DocsConfig } from "types"

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Guides",
      href: "/guides",
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs/documentation",
        },
        {
          title: "Development Setup",
          href: "/docs/development-setup",
        },
        {
          title: "Database Schema",
          href: "/docs/database-schema",
        },
        {
          title: "Technical Spec",
          href: "/docs/technical-spec",
        },
      ],
    },
    {
      title: "Core Features",
      items: [
        {
          title: "Recipe Management",
          href: "/docs/recipe-management",
        },
        {
          title: "Pantry Management",
          href: "/docs/pantry-management",
        },
        {
          title: "Meal Planning",
          href: "/docs/meal-planning",
        },
        {
          title: "Shopping List",
          href: "/docs/shopping-list",
        },
      ],
    },
    {
      title: "Guides",
      items: [
        {
          title: "Authentication",
          href: "/docs/authentication-guide",
        },
        {
          title: "AI Integration",
          href: "/docs/ai-integration-guide",
        },
        {
          title: "Server Actions",
          href: "/docs/server-actions-guide",
        },
      ],
    },
    {
      title: "Reference",
      items: [
        {
          title: "API Reference",
          href: "/docs/api-reference",
        },
        {
          title: "Component Library",
          href: "/docs/component-library",
        },
        {
          title: "PRD",
          href: "/docs/prd",
        },
      ],
    },
  ],
}
