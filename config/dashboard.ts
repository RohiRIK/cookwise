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
      title: "Posts",
      href: "/dashboard",
      icon: "post",
    },
    {
      title: "Recipes",
      href: "/dashboard/recipes",
      icon: "pizza",
    },
    {
      title: "Pantry",
      href: "/dashboard/pantry",
      icon: "post", // Using 'post' as a placeholder or maybe 'package' if available? 'post' is generic file-text like.
      // Let's check icons available.
      // In icons.tsx, we have 'post', 'page', 'media', 'settings', 'billing', 'ellipsis', 'add', 'warning', 'user', 'arrowRight', 'laptop', 'moon', 'sun', 'pizza'.
      // I'll stick to 'post' or maybe add a 'package' icon later.
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: "billing",
    },
    {
      title: "Cook",
      href: "/dashboard/cook",
      icon: "pizza", // Using pizza as a placeholder for cooking/chef hat
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ],
}
