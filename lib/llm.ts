import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateObject, generateText } from "ai"
import { env } from "@/env.mjs"

export type LLMProvider = "gemini" | "openai" | "anthropic"

interface LLMSettings {
    provider: LLMProvider
    geminiApiKey?: string | null
    geminiModel?: string | null
    openaiApiKey?: string | null
    openaiModel?: string | null
    anthropicApiKey?: string | null
    anthropicModel?: string | null
}

export function getLLMClient(settings: LLMSettings) {
    const provider = settings.provider

    if (provider === "openai") {
        const apiKey = settings.openaiApiKey
        if (!apiKey) throw new Error("Missing OpenAI API Key")
        const openai = createOpenAI({ apiKey })
        return openai(settings.openaiModel || "gpt-4o-mini")
    }

    if (provider === "anthropic") {
        const apiKey = settings.anthropicApiKey
        if (!apiKey) throw new Error("Missing Anthropic API Key")
        const anthropic = createAnthropic({ apiKey })
        return anthropic(settings.anthropicModel || "claude-3-5-sonnet-20240620")
    }

    // Fallback to Gemini
    const apiKey = settings.geminiApiKey || env.GEMINI_API_KEY
    if (!apiKey) throw new Error("Missing Gemini API Key")
    const google = createGoogleGenerativeAI({ apiKey })
    return google(settings.geminiModel || "gemini-1.5-flash")
}
