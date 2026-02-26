"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { userGeminiKeySchema } from "@/lib/validations/user"
import { buttonVariants } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { updateUserGeminiKey } from "@/app/actions/user"

interface UserGeminiFormProps extends React.HTMLAttributes<HTMLFormElement> {
    user: Pick<User, "id"> & { geminiApiKey: string | null }
}

type FormData = z.infer<typeof userGeminiKeySchema>

export function UserGeminiForm({ user, className, ...props }: UserGeminiFormProps) {
    const router = useRouter()
    const {
        handleSubmit,
        register,
        formState: { errors, isDirty },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(userGeminiKeySchema),
        defaultValues: {
            geminiApiKey: user?.geminiApiKey || "",
        },
    })
    const [isSaving, setIsSaving] = React.useState<boolean>(false)

    async function onSubmit(data: FormData) {
        setIsSaving(true)

        const response = await updateUserGeminiKey(data)

        setIsSaving(false)

        if (!response.success) {
            return toast({
                title: "Something went wrong.",
                description: response.error || "Your API key was not updated. Please try again.",
                variant: "destructive",
            })
        }

        toast({
            description: "Your Gemini API key has been securely saved.",
        })

        reset({ geminiApiKey: data.geminiApiKey })
        router.refresh()
    }

    return (
        <form
            className={cn(className)}
            onSubmit={handleSubmit(onSubmit)}
            {...props}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Gemini API Key</CardTitle>
                    <CardDescription>
                        Enter your personal Google Gemini API key to enable AI recipe importing.
                        Your key is safely stored in the database.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="geminiApiKey">
                            API Key
                        </Label>
                        <Input
                            id="geminiApiKey"
                            className="w-[400px] font-mono text-sm"
                            size={32}
                            type="password"
                            placeholder="AIzaSy..."
                            {...register("geminiApiKey")}
                        />
                        {errors?.geminiApiKey && (
                            <p className="px-1 text-xs text-red-600">{errors.geminiApiKey.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <button
                        type="submit"
                        className={cn(buttonVariants(), className)}
                        disabled={isSaving || !isDirty}
                    >
                        {isSaving && (
                            <Icons.spinner className="mr-2 size-4 animate-spin" />
                        )}
                        <span>Save API Key</span>
                    </button>
                </CardFooter>
            </Card>
        </form>
    )
}
