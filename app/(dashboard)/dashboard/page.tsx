import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { Icons } from "@/components/icons"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your kitchen at a glance.",
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  // Get the user's householdId for filtered counts
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { householdId: true },
  })

  const whereHousehold = dbUser?.householdId
    ? { OR: [{ householdId: dbUser.householdId }, { userId: user.id }] }
    : { userId: user.id }

  const [recipeCount, pantryCount, lowStockCount] = await Promise.all([
    db.recipe.count({
      where: { creatorId: user.id },
    }),
    db.pantryItem.count({
      where: whereHousehold,
    }),
    db.pantryItem.count({
      where: {
        ...whereHousehold,
        status: { in: ["LOW", "OUT"] },
      },
    }),
  ])

  const quickLinks = [
    {
      title: "Recipes",
      description: `${recipeCount} recipe${recipeCount !== 1 ? "s" : ""} saved`,
      href: "/dashboard/recipes",
      icon: "pizza" as const,
      color: "text-violet-500",
    },
    {
      title: "Pantry",
      description: `${pantryCount} item${pantryCount !== 1 ? "s" : ""} tracked${lowStockCount > 0 ? ` · ${lowStockCount} low` : ""}`,
      href: "/dashboard/pantry",
      icon: "listChecks" as const,
      color: "text-kitchen",
    },
    {
      title: "Meal Planner",
      description: "Plan your weekly meals",
      href: "/dashboard/planner",
      icon: "calendar" as const,
      color: "text-blue-500",
    },
    {
      title: "Shopping List",
      description: "Auto-generated from your plan",
      href: "/dashboard/shopping",
      icon: "shopping" as const,
      color: "text-amber-500",
    },
    {
      title: "What to Cook",
      description: "Recipes matched to your pantry",
      href: "/dashboard/cook",
      icon: "chefHat" as const,
      color: "text-rose-500",
    },
  ]

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        text="Here's an overview of your kitchen."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = Icons[link.icon]
          return (
            <Link key={link.href} href={link.href}>
              <Card className="transition-all duration-200 hover:border-kitchen/30 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {link.title}
                  </CardTitle>
                  <Icon className={cn("size-5", link.color)} />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-4">
        <Link
          href="/dashboard/recipes/new"
          className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        >
          <Icons.add className="size-4" />
          Add New Recipe
        </Link>
      </div>
    </DashboardShell>
  )
}
