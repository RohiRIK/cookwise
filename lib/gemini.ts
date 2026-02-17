import { GoogleGenerativeAI } from "@google/generative-ai"

import { env } from "@/env.mjs"

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
