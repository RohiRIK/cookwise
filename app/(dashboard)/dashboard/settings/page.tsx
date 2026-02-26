import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { UserNameForm } from "@/components/user-name-form"
import { UserGeminiForm } from "@/components/user-gemini-form"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
}

export default async function SettingsPage() {
  const sessionUser = await getCurrentUser()

  if (!sessionUser) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true, geminiApiKey: true },
  })

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="grid gap-10">
        <UserNameForm user={{ id: user.id, name: user.name || "" }} />
        <UserGeminiForm user={{ id: user.id, geminiApiKey: user.geminiApiKey }} />
      </div>
    </DashboardShell>
  )
}
