import { User } from "next-auth"
import { JWT } from "next-auth/jwt"

type UserId = string

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId
  }
}

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    householdId?: string | null
  }
  interface Session {
    user: User & {
      id: UserId
      householdId?: string | null
    }
  }
}
