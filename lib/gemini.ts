import { GoogleGenerativeAI } from "@google/generative-ai"

import { env } from "@/env.mjs"

export function getGeminiModel(apiKey?: string | null) {
    const keyToUse = apiKey || env.GEMINI_API_KEY
    if (!keyToUse) {
        throw new Error("Missing Gemini API Key. Please add it in Settings or .env")
    }

    const genAI = new GoogleGenerativeAI(keyToUse)
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
}
