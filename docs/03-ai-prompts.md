---
title: CookWise AI Prompt Engineering Guide
description: Kitchen-OS Documentation
---

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **Model:** Google Gemini 1.5 Flash

---

## Table of Contents

1. [System Instruction](#system-instruction)
2. [JSON Schema Specification](#json-schema-specification)
3. [Few-Shot Learning Examples](#few-shot-learning-examples)
4. [Prompt Templates](#prompt-templates)
5. [Validation & Error Handling](#validation--error-handling)

---

## System Instruction

```
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
- Ensure all arrays have at least empty arrays if no data
- Quantities must be numeric (convert fractions: "1/2" → 0.5)
```

---

## JSON Schema Specification

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["title", "ingredients", "instructions"],
  "properties": {
    "title": {
      "type": "string",
      "description": "Recipe title"
    },
    "description": {
      "type": "string",
      "description": "Brief recipe description"
    },
    "prepTime": {
      "type": "integer",
      "description": "Preparation time in minutes"
    },
    "cookTime": {
      "type": "integer",
      "description": "Cooking time in minutes"
    },
    "servings": {
      "type": "integer",
      "description": "Number of servings",
      "default": 4
    },
    "difficulty": {
      "type": "string",
      "enum": ["Easy", "Medium", "Hard"]
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "ingredients": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["item", "quantity", "unit", "category"],
        "properties": {
          "item": {
            "type": "string",
            "description": "Ingredient name (normalized)"
          },
          "quantity": {
            "type": "number",
            "description": "Numeric quantity"
          },
          "unit": {
            "type": "string",
            "enum": ["piece", "gram", "kilogram", "milliliter", "liter", 
                     "cup", "tablespoon", "teaspoon", "ounce", "pound", 
                     "pinch", "to_taste"]
          },
          "category": {
            "type": "string",
            "enum": ["PRODUCE", "DAIRY", "MEAT", "SEAFOOD", "GRAINS", 
                     "CANNED", "SPICES", "OILS", "BAKING", "BEVERAGES", 
                     "FROZEN", "CONDIMENTS", "OTHER"]
          },
          "originalText": {
            "type": "string",
            "description": "Original ingredient text from source"
          },
          "notes": {
            "type": "string",
            "description": "Preparation notes (chopped, diced, etc.)"
          }
        }
      }
    },
    "instructions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["stepNumber", "instruction"],
        "properties": {
          "stepNumber": {
            "type": "integer"
          },
          "instruction": {
            "type": "string"
          },
          "imageUrl": {
            "type": "string",
            "format": "uri"
          }
        }
      }
    }
  }
}
```

---

## Few-Shot Learning Examples

### Example 1: Standard Recipe

**Input:**
```
Classic Tomato Soup

Ingredients:
- 2 lbs ripe tomatoes
- 1 medium onion, diced
- 3 cloves garlic, minced
- 2 tbsp olive oil
- 1 cup vegetable broth
- Salt and pepper to taste
- Fresh basil leaves for garnish

Instructions:
1. Heat olive oil in a large pot over medium heat
2. Add onions and cook until translucent, about 5 minutes
3. Add garlic and cook for 1 minute
4. Add tomatoes and broth, bring to boil
5. Simmer for 20 minutes
6. Blend until smooth
7. Season with salt and pepper
8. Garnish with fresh basil
```

**Expected Output:**
```json
{
  "title": "Classic Tomato Soup",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "Easy",
  "tags": ["soup", "vegetarian", "comfort food"],
  "ingredients": [
    {
      "item": "tomatoes",
      "quantity": 907,
      "unit": "gram",
      "category": "PRODUCE",
      "originalText": "2 lbs ripe tomatoes",
      "notes": "ripe"
    },
    {
      "item": "onion",
      "quantity": 1,
      "unit": "piece",
      "category": "PRODUCE",
      "originalText": "1 medium onion, diced",
      "notes": "diced"
    },
    {
      "item": "garlic",
      "quantity": 3,
      "unit": "piece",
      "category": "PRODUCE",
      "originalText": "3 cloves garlic, minced",
      "notes": "minced"
    },
    {
      "item": "olive oil",
      "quantity": 2,
      "unit": "tablespoon",
      "category": "OILS",
      "originalText": "2 tbsp olive oil",
      "notes": null
    },
    {
      "item": "vegetable broth",
      "quantity": 240,
      "unit": "milliliter",
      "category": "CANNED",
      "originalText": "1 cup vegetable broth",
      "notes": null
    },
    {
      "item": "salt",
      "quantity": 1,
      "unit": "pinch",
      "category": "SPICES",
      "originalText": "Salt and pepper to taste",
      "notes": "to taste"
    },
    {
      "item": "black pepper",
      "quantity": 1,
      "unit": "pinch",
      "category": "SPICES",
      "originalText": "Salt and pepper to taste",
      "notes": "to taste"
    },
    {
      "item": "fresh basil",
      "quantity": 1,
      "unit": "piece",
      "category": "PRODUCE",
      "originalText": "Fresh basil leaves for garnish",
      "notes": "for garnish"
    }
  ],
  "instructions": [
    { "stepNumber": 1, "instruction": "Heat olive oil in a large pot over medium heat" },
    { "stepNumber": 2, "instruction": "Add onions and cook until translucent, about 5 minutes" },
    { "stepNumber": 3, "instruction": "Add garlic and cook for 1 minute" },
    { "stepNumber": 4, "instruction": "Add tomatoes and broth, bring to boil" },
    { "stepNumber": 5, "instruction": "Simmer for 20 minutes" },
    { "stepNumber": 6, "instruction": "Blend until smooth" },
    { "stepNumber": 7, "instruction": "Season with salt and pepper" },
    { "stepNumber": 8, "instruction": "Garnish with fresh basil" }
  ]
}
```

---

### Example 2: Edge Cases (Informal Recipe)

**Input:**
```
Grandma's Secret Pasta Sauce

You'll need:
- A good glug of olive oil (don't be shy!)
- Like 4-5 tomatoes, whatever you have
- Salt to taste
- Maybe some red pepper flakes if you like it spicy
- A handful of fresh parsley
- 2-3 cloves of garlic

Just cook it down until it looks right.
```

**Expected Output:**
```json
{
  "title": "Grandma's Secret Pasta Sauce",
  "prepTime": 10,
  "cookTime": 45,
  "servings": 4,
  "difficulty": "Easy",
  "tags": ["pasta", "sauce", "italian"],
  "ingredients": [
    {
      "item": "olive oil",
      "quantity": 30,
      "unit": "milliliter",
      "category": "OILS",
      "originalText": "A good glug of olive oil (don't be shy!)",
      "notes": "approximate"
    },
    {
      "item": "tomatoes",
      "quantity": 4.5,
      "unit": "piece",
      "category": "PRODUCE",
      "originalText": "Like 4-5 tomatoes, whatever you have",
      "notes": "approximate"
    },
    {
      "item": "salt",
      "quantity": 1,
      "unit": "to_taste",
      "category": "SPICES",
      "originalText": "Salt to taste",
      "notes": "to taste"
    },
    {
      "item": "red pepper flakes",
      "quantity": 0.5,
      "unit": "teaspoon",
      "category": "SPICES",
      "originalText": "Maybe some red pepper flakes if you like it spicy",
      "notes": "optional"
    },
    {
      "item": "fresh parsley",
      "quantity": 1,
      "unit": "piece",
      "category": "PRODUCE",
      "originalText": "A handful of fresh parsley",
      "notes": "handful"
    },
    {
      "item": "garlic",
      "quantity": 2.5,
      "unit": "piece",
      "category": "PRODUCE",
      "originalText": "2-3 cloves of garlic",
      "notes": "approximate"
    }
  ],
  "instructions": [
    { "stepNumber": 1, "instruction": "Heat olive oil in a large pan over medium heat" },
    { "stepNumber": 2, "instruction": "Add garlic and cook until fragrant" },
    { "stepNumber": 3, "instruction": "Add tomatoes, breaking them up with a spoon" },
    { "stepNumber": 4, "instruction": "Simmer and cook down until sauce thickens, about 45 minutes" },
    { "stepNumber": 5, "instruction": "Season with salt and red pepper flakes to taste" },
    { "stepNumber": 6, "instruction": "Garnish with fresh parsley before serving" }
  ]
}
```

---

### Example 3: Baking Recipe with Fractions

**Input:**
```
Chocolate Chip Cookies

Ingredients:
- 2¼ cups all-purpose flour
- 1 tsp baking soda
- 1 tsp salt
- 1 cup butter, softened
- ¾ cup granulated sugar
- ¾ cup packed brown sugar
- 2 large eggs
- 2 tsp vanilla extract
- 2 cups chocolate chips

Directions:
1. Preheat oven to 375°F
2. Mix flour, baking soda and salt in small bowl
3. Beat butter, granulated sugar, brown sugar and vanilla in large mixer bowl
4. Add eggs one at a time
5. Gradually beat in flour mixture
6. Stir in chocolate chips
7. Drop rounded tablespoon of dough onto ungreased baking sheets
8. Bake for 9 to 11 minutes or until golden brown
```

**Expected Output:**
```json
{
  "title": "Chocolate Chip Cookies",
  "prepTime": 15,
  "cookTime": 10,
  "servings": 48,
  "difficulty": "Medium",
  "tags": ["dessert", "cookies", "baking", "chocolate"],
  "ingredients": [
    {
      "item": "all-purpose flour",
      "quantity": 281,
      "unit": "gram",
      "category": "BAKING",
      "originalText": "2¼ cups all-purpose flour",
      "notes": null
    },
    {
      "item": "baking soda",
      "quantity": 1,
      "unit": "teaspoon",
      "category": "BAKING",
      "originalText": "1 tsp baking soda",
      "notes": null
    },
    {
      "item": "salt",
      "quantity": 1,
      "unit": "teaspoon",
      "category": "SPICES",
      "originalText": "1 tsp salt",
      "notes": null
    },
    {
      "item": "butter",
      "quantity": 227,
      "unit": "gram",
      "category": "DAIRY",
      "originalText": "1 cup butter, softened",
      "notes": "softened"
    },
    {
      "item": "granulated sugar",
      "quantity": 150,
      "unit": "gram",
      "category": "BAKING",
      "originalText": "¾ cup granulated sugar",
      "notes": null
    },
    {
      "item": "brown sugar",
      "quantity": 165,
      "unit": "gram",
      "category": "BAKING",
      "originalText": "¾ cup packed brown sugar",
      "notes": "packed"
    },
    {
      "item": "eggs",
      "quantity": 2,
      "unit": "piece",
      "category": "DAIRY",
      "originalText": "2 large eggs",
      "notes": "large"
    },
    {
      "item": "vanilla extract",
      "quantity": 2,
      "unit": "teaspoon",
      "category": "BAKING",
      "originalText": "2 tsp vanilla extract",
      "notes": null
    },
    {
      "item": "chocolate chips",
      "quantity": 340,
      "unit": "gram",
      "category": "BAKING",
      "originalText": "2 cups chocolate chips",
      "notes": null
    }
  ],
  "instructions": [
    { "stepNumber": 1, "instruction": "Preheat oven to 375°F (190°C)" },
    { "stepNumber": 2, "instruction": "Mix flour, baking soda and salt in small bowl" },
    { "stepNumber": 3, "instruction": "Beat butter, granulated sugar, brown sugar and vanilla in large mixer bowl" },
    { "stepNumber": 4, "instruction": "Add eggs one at a time, beating well after each addition" },
    { "stepNumber": 5, "instruction": "Gradually beat in flour mixture" },
    { "stepNumber": 6, "instruction": "Stir in chocolate chips" },
    { "stepNumber": 7, "instruction": "Drop rounded tablespoon of dough onto ungreased baking sheets" },
    { "stepNumber": 8, "instruction": "Bake for 9 to 11 minutes or until golden brown" }
  ]
}
```

---

## Prompt Templates

### Image OCR Prompt

```
Analyze this recipe image and extract all recipe information.

Return ONLY valid JSON matching the schema. Do not include any explanation,
markdown formatting, or additional text.

If the image contains multiple recipes, extract the primary/first recipe only.

If any field cannot be determined from the image, use null for optional fields
or reasonable defaults for required fields.

For handwritten text, do your best to interpret the content.

JSON Output:
```

### URL Scraper Prompt

```
You are receiving cleaned HTML content from a recipe webpage.

Extract the recipe data and return ONLY valid JSON.

Ignore all navigation, ads, comments, and unrelated content.

If the page contains multiple recipes, extract the main recipe only.

Preserve any dietary tags or cuisine type mentioned.

JSON Output:
```

---

## Validation & Error Handling

### Zod Validation Schema

```typescript
// lib/ai/validation.ts
import { z } from 'zod'

const IngredientSchema = z.object({
  item: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(['piece', 'gram', 'kilogram', 'milliliter', 'liter', 
                'cup', 'tablespoon', 'teaspoon', 'ounce', 'pound', 
                'pinch', 'to_taste']),
  category: z.enum(['PRODUCE', 'DAIRY', 'MEAT', 'SEAFOOD', 'GRAINS', 
                    'CANNED', 'SPICES', 'OILS', 'BAKING', 'BEVERAGES', 
                    'FROZEN', 'CONDIMENTS', 'OTHER']),
  originalText: z.string().optional(),
  notes: z.string().nullable().optional(),
})

const RecipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  prepTime: z.number().int().positive().nullable().optional(),
  cookTime: z.number().int().positive().nullable().optional(),
  servings: z.number().int().positive().default(4),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).nullable().optional(),
  tags: z.array(z.string()).default([]),
  ingredients: z.array(IngredientSchema).min(1),
  instructions: z.array(
    z.object({
      stepNumber: z.number().int().positive(),
      instruction: z.string().min(1),
      imageUrl: z.string().url().nullable().optional(),
    })
  ).min(1),
})

export function validateRecipeOutput(data: unknown) {
  try {
    return RecipeSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AIValidationError('Invalid recipe format', error.errors)
    }
    throw error
  }
}
```

### Error Types

| Error | Cause | Handling |
|-------|-------|----------|
| `AIValidationError` | Invalid JSON schema | Return error to user, allow manual edit |
| `TimeoutError` | Gemini API timeout | Retry with exponential backoff |
| `RateLimitError` | API quota exceeded | Queue for later processing |
| `ParsingError` | Malformed response | Log and alert, fallback to manual entry |

---

## Related Documents

- [Technical Specification](02-technical-spec.md) - Data flow architecture
- [Database Schema](01-database-schema.md) - Data models
- [API Reference](05-api-reference.md) - Recipe parsing endpoints

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
