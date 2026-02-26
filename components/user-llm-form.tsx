"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { cn } from "@/lib/utils"
import { buttonVariants, Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { validateAndFetchModels, saveLlmSettings } from "@/app/actions/llm"
import { LLMProvider } from "@/lib/llm"

interface UserLlmFormProps extends React.HTMLAttributes<HTMLFormElement> {
    user: Pick<User, "id"> & {
        llmProvider?: string | null
        geminiApiKey?: string | null
        geminiModel?: string | null
        openaiApiKey?: string | null
        openaiModel?: string | null
        anthropicApiKey?: string | null
        anthropicModel?: string | null
    }
}

const llmFormSchema = z.object({
    provider: z.enum(["gemini", "openai", "anthropic"]),
    apiKey: z.string().min(1, "API Key is required"),
    model: z.string().min(1, "Model is required"),
})

type FormData = z.infer<typeof llmFormSchema>

export function UserLlmForm({ user, className, ...props }: UserLlmFormProps) {
    const router = useRouter()
    const initialProvider = (user?.llmProvider as LLMProvider) || "gemini"

    const getInitialKey = (p: string) => {
        if (p === "gemini") return user?.geminiApiKey || ""
        if (p === "openai") return user?.openaiApiKey || ""
        if (p === "anthropic") return user?.anthropicApiKey || ""
        return ""
    }

    const getInitialModel = (p: string) => {
        if (p === "gemini") return user?.geminiModel || ""
        if (p === "openai") return user?.openaiModel || ""
        if (p === "anthropic") return user?.anthropicModel || ""
        return ""
    }

    const {
        handleSubmit,
        register,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(llmFormSchema),
        defaultValues: {
            provider: initialProvider,
            apiKey: getInitialKey(initialProvider),
            model: getInitialModel(initialProvider),
        },
    })

    const [isValidating, setIsValidating] = React.useState<boolean>(false)
    const [isSaving, setIsSaving] = React.useState<boolean>(false)
    const [availableModels, setAvailableModels] = React.useState<string[]>([])

    const selectedProvider = watch("provider")
    const currentApiKey = watch("apiKey")
    const currentModel = watch("model")

    React.useEffect(() => {
        // Reset key and model when provider changes
        setValue("apiKey", getInitialKey(selectedProvider))
        setValue("model", getInitialModel(selectedProvider))
        setAvailableModels([]) // Reset models since we changed provider
    }, [selectedProvider, setValue, user])

    async function onValidate() {
        if (!currentApiKey) {
            toast({ title: "Error", description: "Please enter an API key first.", variant: "destructive" })
            return
        }

        setIsValidating(true)
        const result = await validateAndFetchModels(selectedProvider, currentApiKey)
        setIsValidating(false)

        if (!result.success || !result.models) {
            toast({
                title: "Validation Failed",
                description: result.error || "Could not validate key or fetch models.",
                variant: "destructive"
            })
            setAvailableModels([])
        } else {
            toast({ title: "Success", description: "API Key validated successfully!" })
            setAvailableModels(result.models)

            // Auto-select a model if none is set, or if the current isn't in the list
            if (!currentModel || !result.models.includes(currentModel)) {
                setValue("model", result.models[0])
            }
        }
    }

    async function onSubmit(data: FormData) {
        setIsSaving(true)
        const response = await saveLlmSettings(data.provider, data.apiKey, data.model)
        setIsSaving(false)

        if (!response.success) {
            return toast({
                title: "Something went wrong.",
                description: response.error || "Settings were not saved. Please try again.",
                variant: "destructive",
            })
        }

        toast({ description: "Your LLM settings have been securely saved." })
        router.refresh()
    }

    return (
        <form className={cn(className)} onSubmit={handleSubmit(onSubmit)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>AI Provider Settings</CardTitle>
                    <CardDescription>
                        Choose your preferred AI provider for generating recipes from URLs and images.
                        Your API key is securely stored in your database row.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-1">
                        <Label htmlFor="provider">Provider</Label>
                        <Select
                            value={selectedProvider}
                            onValueChange={(v) => setValue("provider", v as LLMProvider)}
                        >
                            <SelectTrigger className="w-[400px]">
                                <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gemini">Google Gemini</SelectItem>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="anthropic">Anthropic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="apiKey">API Key</Label>
                        <div className="flex gap-2">
                            <Input
                                id="apiKey"
                                className="w-[300px] font-mono text-sm"
                                type="password"
                                placeholder={selectedProvider === "openai" ? "sk-..." : "API Key..."}
                                {...register("apiKey")}
                            />
                            <Button type="button" variant="secondary" onClick={onValidate} disabled={isValidating}>
                                {isValidating ? <Icons.spinner className="mr-2 size-4 animate-spin" /> : null}
                                Validate Key
                            </Button>
                        </div>
                        {errors?.apiKey && (
                            <p className="px-1 text-xs text-red-600">{errors.apiKey.message}</p>
                        )}
                    </div>

                    {availableModels.length > 0 && (
                        <div className="grid gap-1">
                            <Label htmlFor="model">Model</Label>
                            <Select
                                value={currentModel}
                                onValueChange={(v) => setValue("model", v)}
                            >
                                <SelectTrigger className="w-[400px]">
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableModels.map(m => (
                                        <SelectItem key={m} value={m}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors?.model && (
                                <p className="px-1 text-xs text-red-600">{errors.model.message}</p>
                            )}
                        </div>
                    )}

                    {/* Show the selected model if they haven't validated but have one saved */}
                    {availableModels.length === 0 && currentModel && (
                        <div className="grid gap-1">
                            <Label>Current Model</Label>
                            <Input className="w-[400px]" disabled value={currentModel} />
                            <p className="text-xs text-muted-foreground">Click Validate Key to change models.</p>
                        </div>
                    )}

                </CardContent>
                <CardFooter>
                    <button
                        type="submit"
                        className={cn(buttonVariants(), className)}
                        disabled={isSaving || !currentModel || !currentApiKey}
                    >
                        {isSaving && <Icons.spinner className="mr-2 size-4 animate-spin" />}
                        <span>Save Settings</span>
                    </button>
                </CardFooter>
            </Card>
        </form>
    )
}
