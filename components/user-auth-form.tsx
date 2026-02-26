"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { userAuthSchema } from "@/lib/validations/auth"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

type FormData = z.infer<typeof userAuthSchema>

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const isRegister = pathname === "/register"

  async function onSubmit(data: FormData) {
    setIsLoading(true)

    if (isRegister) {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email.toLowerCase(),
            password: data.password,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Registration failed")
        }

        toast({
          title: "Account created",
          description: "You can now sign in with your password.",
        })

        router.push("/login")
      } catch (error) {
        toast({
          title: "Something went wrong.",
          description: error instanceof Error ? error.message : "Registration failed. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      const signInResult = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
        callbackUrl: searchParams?.get("from") || "/dashboard",
      })

      setIsLoading(false)

      if (!signInResult?.ok) {
        if (signInResult?.error === "CallbackRouteError") {
          // This might be the JSON error workaround? But usually it's just "Configuration" or "AccessDenied"
        }
        return toast({
          title: "Something went wrong.",
          description: "Your sign in request failed. Please check your credentials.",
          variant: "destructive",
        })
      }

      router.push(searchParams?.get("from") || "/dashboard")
      router.refresh()
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect="off"
              disabled={isLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            {isRegister ? "Sign Up with Email" : "Sign In with Email"}
          </button>
        </div>
      </form>
    </div>
  )
}
