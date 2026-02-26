"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { LLMProvider } from "@/lib/llm"

export async function validateAndFetchModels(provider: LLMProvider, apiKey: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    try {
        if (provider === "openai") {
            const res = await fetch("https://api.openai.com/v1/models", {
                headers: { Authorization: `Bearer ${apiKey}` },
            })
            if (!res.ok) throw new Error("Invalid OpenAI API Key")
            const data = await res.json()
            // Filter to gpt models
            const models = data.data
                .filter((m: any) => m.id.startsWith("gpt-") && !m.id.includes("vision") && !m.id.includes("instruct"))
                .map((m: any) => m.id)
                .sort()
            return { success: true, models }
        }

        if (provider === "anthropic") {
            // Anthropic doesn't have a public models endpoint, test with a very cheap message request
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 1,
                    messages: [{ role: "user", content: "hi" }]
                })
            })
            if (!res.ok) {
                if (res.status === 401) throw new Error("Invalid Anthropic API Key")
                // Note: It might fail if no billing setup, but that's a valid key error the user should see.
            }
            return {
                success: true,
                models: ["claude-3-5-sonnet-20240620", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"]
            }
        }

        if (provider === "gemini") {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
            if (!res.ok) throw new Error("Invalid Gemini API Key")
            const data = await res.json()
            const models = data.models
                .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
                .map((m: any) => m.name.replace("models/", ""))
            return { success: true, models }
        }

        return { success: false, error: "Unknown provider" }
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to validate API key" }
    }
}

export async function saveLlmSettings(provider: LLMProvider, apiKey: string, model: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const dataToUpdate: any = {
        llmProvider: provider,
    }

    if (provider === "gemini") {
        dataToUpdate.geminiApiKey = apiKey
        dataToUpdate.geminiModel = model
    } else if (provider === "openai") {
        dataToUpdate.openaiApiKey = apiKey
        dataToUpdate.openaiModel = model
    } else if (provider === "anthropic") {
        dataToUpdate.anthropicApiKey = apiKey
        dataToUpdate.anthropicModel = model
    }

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: dataToUpdate,
        })
        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to save LLM settings:", error)
        return { success: false, error: "Failed to save settings" }
    }
}
