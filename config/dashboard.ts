import { DashboardConfig } from "types"

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Support",
      href: "/support",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Overview",
      href: "/dashboard",
      icon: "laptop",
    },
    {
      title: "Recipes",
      href: "/dashboard/recipes",
      icon: "pizza",
    },
    {
      title: "Pantry",
      href: "/dashboard/pantry",
      icon: "listChecks",
    },
    {
      title: "Planner",
      href: "/dashboard/planner",
      icon: "calendar",
    },
    {
      title: "Shopping",
      href: "/dashboard/shopping",
      icon: "shopping",
    },
    {
      title: "What to Cook",
      href: "/dashboard/cook",
      icon: "chefHat",
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: "billing",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ],
}
