# CookWise Authentication Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **Auth Provider:** NextAuth.js

---

## Table of Contents

1. [Overview](#overview)
2. [Household Model](#household-model)
3. [Authentication Flow](#authentication-flow)
4. [Onboarding Flow](#onboarding-flow)
5. [Session Management](#session-management)
6. [Authorization](#authorization)

---

## Overview

CookWise uses **NextAuth.js** for authentication with a **household-based multi-tenant** model. All users belong to a household, and all data is scoped to households.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **User** | Individual account with email/password |
| **Household** | Family/unit that users belong to |
| **Session** | Authenticated user context with household |
| **Multi-tenant** | Data isolated by household |

---

## Household Model

### Database Schema

```prisma
model Household {
  id        String   @id @default(uuid())
  name      String
  users     User[]
  recipes   Recipe[]
  // ... other relations
}

model User {
  id          String    @id @default(uuid())
  email       String    @unique
  householdId String?
  household   Household? @relation(fields: [householdId], references: [id])
  // ... other fields
}
```

### Household Rules

1. **Every user must belong to exactly one household**
2. **Users cannot access data from other households**
3. **New users must create or join a household during onboarding**

---

## Authentication Flow

### Sign Up

```typescript
// app/(auth)/sign-up/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp } from "@/actions/auth"

export function SignUpForm() {
  const router = useRouter()
  const [householdChoice, setHouseholdChoice] = useState<"create" | "join">("create")
  const [householdName, setHouseholdName] = useState("")
  const [inviteCode, setInviteCode] = useState("")

  async function handleSubmit(e: FormData) {
    const result = await signUp({
      email: e.get("email") as string,
      password: e.get("password") as string,
      householdChoice,
      householdName: householdChoice === "create" ? householdName : undefined,
      inviteCode: householdChoice === "join" ? inviteCode : undefined
    })

    if (result.success) {
      router.push("/dashboard")
    }
  }

  return (
    <form action={handleSubmit}>
      {/* Email & Password fields */}
      
      {/* Household choice */}
      <div>
        <label>
          <input
            type="radio"
            checked={householdChoice === "create"}
            onChange={() => setHouseholdChoice("create")}
          />
          Create new household
        </label>
        <label>
          <input
            type="radio"
            checked={householdChoice === "join"}
            onChange={() => setHouseholdChoice("join")}
          />
          Join existing household
        </label>
      </div>

      {householdChoice === "create" ? (
        <input
          type="text"
          placeholder="Household name (e.g., Smith Family)"
          value={householdName}
          onChange={(e) => setHouseholdName(e.target.value)}
          required
        />
      ) : (
        <input
          type="text"
          placeholder="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
        />
      )}

      <button type="submit">Sign Up</button>
    </form>
  )
}
```

### Sign In

```typescript
// actions/auth.ts
"use server"

import { signIn } from "@/lib/auth"

export async function signInAction(formData: FormData) {
  try {
    await signIn("credentials", formData)
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: "Invalid email or password" 
    }
  }
}
```

---

## Onboarding Flow

Users without a household are redirected to onboarding.

### Middleware Redirect

```typescript
// middleware.ts
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const householdId = req.auth?.user.householdId

  // If logged in but no household, redirect to onboarding
  if (isLoggedIn && !householdId) {
    if (!req.nextUrl.pathname.startsWith("/onboarding")) {
      return Response.redirect(new URL("/onboarding", req.url))
    }
  }

  // If on onboarding but has household, redirect to dashboard
  if (isLoggedIn && householdId && req.nextUrl.pathname.startsWith("/onboarding")) {
    return Response.redirect(new URL("/dashboard", req.url))
  }
})
```

### Onboarding Page

```typescript
// app/(auth)/onboarding/page.tsx
"use client"

import { useState } from "react"
import { completeOnboarding } from "@/actions/auth"
import { useRouter } from "next/navigation"

export function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  async function handleCreateHousehold(name: string) {
    const result = await completeOnboarding({
      action: "create",
      householdName: name
    })

    if (result.success) {
      router.push("/dashboard")
    }
  }

  async function handleJoinHousehold(code: string) {
    const result = await completeOnboarding({
      action: "join",
      inviteCode: code
    })

    if (result.success) {
      router.push("/dashboard")
    }
  }

  return (
    <div>
      <h1>Welcome to CookWise!</h1>
      <p>Let's set up your household</p>

      <div className="flex gap-4">
        <Card onClick={() => setStep(2)}>
          <h3>Create Household</h3>
          <p>Start a new household</p>
        </Card>

        <Card onClick={() => setStep(3)}>
          <h3>Join Household</h3>
          <p>Join with invite code</p>
        </Card>
      </div>

      {step === 2 && (
        <form onSubmit={(e) => {
          e.preventDefault()
          handleCreateHousehold(e.target.householdName.value)
        }}>
          <input name="householdName" placeholder="Household name" />
          <button type="submit">Create</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={(e) => {
          e.preventDefault()
          handleJoinHousehold(e.target.inviteCode.value)
        }}>
          <input name="inviteCode" placeholder="Invite code" />
          <button type="submit">Join</button>
        </form>
      )}
    </div>
  )
}
```

---

## Session Management

### Extend NextAuth Session

```typescript
// lib/auth.ts
import NextAuth from "next-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Find user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { household: true }
        })

        if (!user || !verifyPassword(credentials.password as string, user.passwordHash)) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          householdId: user.householdId,
          householdName: user.household?.name
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.householdId = user.householdId
        token.householdName = user.householdName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.householdId = token.householdId as string
        session.user.householdName = token.householdName as string
      }
      return session
    }
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out"
  }
})
```

### Type Augmentation

```typescript
// types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      householdId?: string
      householdName?: string
    } & DefaultSession["user"]
  }

  interface User {
    householdId?: string
    householdName?: string
  }
}
```

---

## Authorization

### Server Action Authorization

```typescript
// actions/recipes.ts
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function getRecipe(recipeId: string) {
  const session = await auth()
  if (!session?.user?.householdId) {
    throw new Error("Unauthorized")
  }

  // Scope query to household
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      householdId: session.user.householdId
    }
  })

  if (!recipe) {
    throw new Error("Recipe not found")
  }

  return recipe
}
```

### API Route Authorization

```typescript
// app/api/recipes/[id]/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.householdId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const recipe = await prisma.recipe.findFirst({
    where: {
      id: params.id,
      householdId: session.user.householdId
    }
  })

  if (!recipe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(recipe)
}
```

### Middleware Household Injection

```typescript
// middleware.ts
export default auth((req) => {
  const householdId = req.auth?.user.householdId

  if (householdId) {
    // Inject household ID into request headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-household-id", householdId)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }
})
```

---

## Invite System

### Generate Invite Code

```typescript
// actions/household.ts
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"

export async function generateInviteCode() {
  const session = await auth()
  if (!session?.user?.householdId) {
    throw new Error("Unauthorized")
  }

  const code = nanoid(8) // Generate 8-char code
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  await prisma.householdInvite.create({
    data: {
      householdId: session.user.householdId,
      code,
      expiresAt
    }
  })

  return code
}
```

### Join Household with Code

```typescript
export async function joinHousehold(code: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Find valid invite
  const invite = await prisma.householdInvite.findUnique({
    where: { code },
    include: { household: true }
  })

  if (!invite || invite.expiresAt < new Date()) {
    throw new Error("Invalid or expired invite code")
  }

  // Add user to household
  await prisma.user.update({
    where: { id: session.user.id },
    data: { householdId: invite.householdId }
  })

  // Invalidate invite
  await prisma.householdInvite.delete({
    where: { id: invite.id }
  })

  revalidatePath("/")
  return { success: true, householdName: invite.household.name }
}
```

---

## Related Documents

- [Database Schema](01-database-schema.md) - User & Household models
- [Server Actions Guide](09-server-actions-guide.md) - Auth patterns in actions
- [Template Customization](07-template-customization.md) - Auth setup

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
