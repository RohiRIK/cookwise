# CookWise AI Integration Guide

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **AI Provider:** Google Gemini API

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Gemini Client](#gemini-client)
4. [OCR Image Parsing](#ocr-image-parsing)
5. [URL Scraping](#url-scraping)
6. [Validation](#validation)
7. [Error Handling](#error-handling)
8. [Cost Optimization](#cost-optimization)

---

## Overview

CookWise uses **Google Gemini 1.5 Flash** for:
- **Recipe OCR**: Extract structured data from recipe images
- **URL Parsing**: Extract recipes from cooking blogs
- **Ingredient Normalization**: Standardize ingredient names and units

### Why Gemini 1.5 Flash?

| Factor | Reason |
|--------|--------|
| **Speed** | Fast inference for real-time UX |
| **Cost** | Lower cost than Gemini Pro |
| **Multimodal** | Native image + text understanding |
| **Context** | 1M token context for long recipes |

---

## Setup

### Environment Variables

```env
# .env.local
GEMINI_API_KEY="your-api-key"
```

### Install Dependencies

```bash
bun add @google/generative-ai
```

---

## Gemini Client

### Create Client Instance

```typescript
// lib/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured")
}

const genAI = new GoogleGenerativeAI(apiKey)

export const geminiClient = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
You are a Culinary Data Architect AI. Your purpose is to extract structured 
recipe data from unstructured text, images, or URLs and output strictly 
formatted JSON.

EXTRACTION RULES:
1. Extract ALL ingredients with quantities, units, and preparation notes
2. Normalize units to metric where possible (grams, milliliters)
3. Map ingredients to standard categories (Produce, Dairy, Meat, etc.)
4. Handle ambiguous quantities ("to taste", "as needed") appropriately
5. Preserve original text for reference alongside normalized values
6. Extract step-by-step instructions in sequential order
7. Identify prep time, cook time, and servings from the source

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON, no markdown, no explanations
- Use null for missing optional fields
- Quantities must be numeric (convert fractions: "1/2" → 0.5)
`
})
```

### Generation Config

```typescript
const generationConfig = {
  temperature: 0.1, // Low temperature for consistent extraction
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
  responseMimeType: "application/json", // Force JSON response
}
```

---

## OCR Image Parsing

### Parse Recipe Image

```typescript
// lib/ai/recipe-parser.ts
import { geminiClient } from "./gemini"
import { validateRecipeOutput } from "./validation"

export async function parseRecipeImage(
  imageFile: File
): Promise<ParsedRecipe> {
  // Convert file to base64
  const arrayBuffer = await imageFile.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64Image = buffer.toString("base64")

  // Determine MIME type
  const mimeType = imageFile.type || "image/jpeg"

  // Create prompt
  const prompt = `
Analyze this recipe image and extract all recipe information.

Return ONLY valid JSON matching the schema. Do not include any explanation,
markdown formatting, or additional text.

If the image contains multiple recipes, extract the primary/first recipe only.

For handwritten text, do your best to interpret the content.

JSON Output:
`

  // Call Gemini API
  const result = await geminiClient.generateContent({
    contents: [{
      role: "user",
      parts: [
        { text: prompt },
        { 
          inlineData: { 
            mimeType, 
            data: base64Image 
          } 
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: "application/json"
    }
  })

  // Parse response
  const jsonText = result.response.text()
  const parsed = JSON.parse(jsonText)

  // Validate against schema
  const validated = validateRecipeOutput(parsed)

  return validated
}
```

### Handle Multi-Page PDF

```typescript
export async function parseRecipePDF(
  pdfFile: File
): Promise<ParsedRecipe[]> {
  // Convert PDF to images (one per page)
  const pages = await pdfToImages(pdfFile)
  
  const results = await Promise.all(
    pages.map(async (pageImage) => {
      return parseRecipeImage(pageImage)
    })
  )

  // Merge results if multiple pages are part of same recipe
  return mergeRecipeResults(results)
}

async function pdfToImages(pdfFile: File): Promise<File[]> {
  // Use pdf-parse or similar library
  // Implementation depends on your PDF processing setup
  return []
}
```

---

## URL Scraping

### Scrape Recipe from URL

```typescript
// lib/ai/url-scraper.ts
import * as cheerio from "cheerio"

export async function scrapeRecipeUrl(url: string): Promise<string> {
  // Fetch HTML
  const response = await fetch(url, {
    headers: {
      "User-Agent": "CookWise/1.0 (Recipe Parser Bot)"
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`)
  }

  const html = await response.text()

  // Parse with Cheerio
  const $ = cheerio.load(html)

  // Extract recipe content
  // Look for common recipe structures
  const recipeData = {
    title: $("h1").first().text().trim(),
    ingredients: [] as string[],
    instructions: [] as string[]
  }

  // Find ingredients (common selectors)
  $("li:contains('cup'), li:contains('tbsp'), li:contains('tsp')")
    .each((_, el) => {
      recipeData.ingredients.push($(el).text().trim())
    })

  // Find instructions
  $(".instructions li, .directions li, ol li")
    .each((_, el) => {
      recipeData.instructions.push($(el).text().trim())
    })

  // Format for Gemini
  const textToParse = `
Recipe Title: ${recipeData.title}

Ingredients:
${recipeData.ingredients.map(i => `- ${i}`).join("\n")}

Instructions:
${recipeData.instructions.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}
`

  return textToParse
}
```

### Parse Scraped Text

```typescript
// lib/ai/recipe-parser.ts
export async function parseScrapedRecipe(
  scrapedText: string
): Promise<ParsedRecipe> {
  const prompt = `
You are receiving cleaned HTML content from a recipe webpage.

Extract the recipe data and return ONLY valid JSON.

Ignore all navigation, ads, comments, and unrelated content.

If the page contains multiple recipes, extract the main recipe only.

Preserve any dietary tags or cuisine type mentioned.

Scraped Content:
${scrapedText}

JSON Output:
`

  const result = await geminiClient.generateContent({
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: "application/json"
    }
  })

  const jsonText = result.response.text()
  const parsed = JSON.parse(jsonText)

  return validateRecipeOutput(parsed)
}
```

---

## Validation

### Zod Schema

```typescript
// lib/ai/validation.ts
import { z } from "zod"

const IngredientSchema = z.object({
  item: z.string().min(1, "Ingredient name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.enum([
    "piece", "gram", "kilogram", "milliliter", "liter",
    "cup", "tablespoon", "teaspoon", "ounce", "pound",
    "pinch", "to_taste"
  ]),
  category: z.enum([
    "PRODUCE", "DAIRY", "MEAT", "SEAFOOD", "GRAINS",
    "CANNED", "SPICES", "OILS", "BAKING", "BEVERAGES",
    "FROZEN", "CONDIMENTS", "OTHER"
  ]),
  originalText: z.string().optional(),
  notes: z.string().nullable().optional()
})

const InstructionSchema = z.object({
  stepNumber: z.number().int().positive(),
  instruction: z.string().min(1, "Instruction is required"),
  imageUrl: z.string().url().nullable().optional()
})

const RecipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  prepTime: z.number().int().positive().nullable().optional(),
  cookTime: z.number().int().positive().nullable().optional(),
  servings: z.number().int().positive().default(4),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).nullable().optional(),
  tags: z.array(z.string()).default([]),
  ingredients: z.array(IngredientSchema).min(1, "At least one ingredient required"),
  instructions: z.array(InstructionSchema).min(1, "At least one instruction required")
})

export function validateRecipeOutput(data: unknown): ParsedRecipe {
  try {
    return RecipeSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join(".")}: ${e.message}`)
      throw new AIValidationError("Invalid recipe format", messages)
    }
    throw error
  }
}

export class AIValidationError extends Error {
  constructor(message: string, public errors: string[]) {
    super(message)
    this.name = "AIValidationError"
  }
}
```

---

## Error Handling

### Retry Logic

```typescript
// lib/ai/retry.ts
import { geminiClient } from "./gemini"

export async function generateContentWithRetry(
  prompt: string,
  options?: { maxRetries?: number }
) {
  const maxRetries = options?.maxRetries ?? 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await geminiClient.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors
      if (isClientError(error)) {
        throw error
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000
      await sleep(delay)
    }
  }

  throw lastError
}

function isClientError(error: unknown): boolean {
  // Check if error is 4xx (client error)
  // Don't retry on these
  return false // Implementation depends on error structure
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

### Error Types

```typescript
// lib/ai/errors.ts
export class AIError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = "AIError"
  }
}

export class RateLimitError extends AIError {
  constructor(message: string) {
    super(message, "RATE_LIMIT")
    this.name = "RateLimitError"
  }
}

export class TimeoutError extends AIError {
  constructor(message: string) {
    super(message, "TIMEOUT")
    this.name = "TimeoutError"
  }
}

export class ParsingError extends AIError {
  constructor(message: string, public rawOutput: string) {
    super(message, "PARSING_FAILED")
    this.name = "ParsingError"
  }
}
```

---

## Cost Optimization

### Token Counting

```typescript
// lib/ai/cost-tracker.ts
class CostTracker {
  private tokenCount = 0
  private readonly costPerToken = 0.000000075 // Gemini Flash pricing

  addTokens(tokens: number) {
    this.tokenCount += tokens
  }

  getEstimatedCost(): number {
    return this.tokenCount * this.costPerToken
  }

  reset() {
    this.tokenCount = 0
  }
}

export const costTracker = new CostTracker()
```

### Optimize Prompts

```typescript
// ✅ DO: Use concise prompts
const efficientPrompt = `
Extract recipe as JSON:
- title, ingredients[], instructions[]
- ingredients: item, quantity, unit, category
- No explanations, JSON only
`

// ❌ DON'T: Verbose prompts waste tokens
const verbosePrompt = `
Hello AI! I hope you're doing well today. I need your help with 
something very important. I have this recipe image and I was wondering 
if you could possibly extract all the information from it...
`
```

### Cache Results

```typescript
// lib/ai/cache.ts
import { cache } from "react"

export const parseRecipeImageCached = cache(
  async (imageHash: string, imageFile: File) => {
    // Check cache first
    const cached = await getCachedResult(imageHash)
    if (cached) return cached

    // Parse if not cached
    const result = await parseRecipeImage(imageFile)

    // Cache for 24 hours
    await cacheResult(imageHash, result, 60 * 60 * 24)

    return result
  }
)

async function getCachedResult(hash: string) {
  // Implement caching (Redis, database, etc.)
  return null
}

async function cacheResult(hash: string, result: any, ttl: number) {
  // Implement caching
}
```

---

## Related Documents

- [AI Prompts](03-ai-prompts.md) - Prompt engineering guide
- [Server Actions](09-server-actions-guide.md) - AI action implementations
- [API Reference](05-api-reference.md) - AI endpoints

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
