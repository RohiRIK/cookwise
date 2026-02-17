# CookWise API Reference

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0  
> **Base URL:** `/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Recipes](#recipes)
3. [Pantry](#pantry)
4. [Meal Plans](#meal-plans)
5. [Shopping Lists](#shopping-lists)
6. [Error Responses](#error-responses)

---

## Authentication

All API requests require authentication via NextAuth.js session.

### Session Header

```
Authorization: Bearer <session-token>
X-Household-ID: <household-uuid>
```

---

## Recipes

### List All Recipes

**GET** `/api/recipes`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by title or tags |
| `category` | string | Filter by ingredient category |
| `difficulty` | string | Filter by difficulty |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "title": "Classic Tomato Soup",
      "description": "A comforting homemade soup",
      "prepTime": 15,
      "cookTime": 30,
      "servings": 4,
      "difficulty": "Easy",
      "tags": ["soup", "vegetarian"],
      "imageUrl": "https://...",
      "createdAt": "2026-02-17T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### Get Recipe by ID

**GET** `/api/recipes/:id`

**Response:**
```json
{
  "id": "uuid",
  "title": "Classic Tomato Soup",
  "description": "A comforting homemade soup",
  "sourceType": "OCR_IMAGE",
  "sourceUrl": null,
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "Easy",
  "tags": ["soup", "vegetarian", "comfort food"],
  "rating": 5,
  "notes": null,
  "imageUrl": "https://...",
  "ingredients": [
    {
      "id": "uuid",
      "ingredient": {
        "id": "uuid",
        "name": "tomatoes",
        "category": "PRODUCE"
      },
      "quantity": 907,
      "unit": "GRAM",
      "originalText": "2 lbs ripe tomatoes",
      "notes": "ripe"
    }
  ],
  "instructionSteps": [
    {
      "id": "uuid",
      "stepNumber": 1,
      "instruction": "Heat olive oil in a large pot over medium heat",
      "imageUrl": null
    }
  ],
  "createdAt": "2026-02-17T10:00:00Z",
  "updatedAt": "2026-02-17T10:00:00Z"
}
```

---

### Create Recipe

**POST** `/api/recipes`

**Request Body:**
```json
{
  "title": "Classic Tomato Soup",
  "description": "A comforting homemade soup",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "Easy",
  "tags": ["soup", "vegetarian"],
  "ingredients": [
    {
      "ingredientId": "uuid",
      "quantity": 907,
      "unit": "GRAM",
      "notes": "ripe"
    }
  ],
  "instructionSteps": [
    {
      "stepNumber": 1,
      "instruction": "Heat olive oil in a large pot..."
    }
  ]
}
```

**Response:** `201 Created` with recipe object

---

### Update Recipe

**PUT** `/api/recipes/:id`

**Request Body:** Same as Create Recipe (partial update supported)

**Response:** `200 OK` with updated recipe object

---

### Delete Recipe

**DELETE** `/api/recipes/:id`

**Response:** `204 No Content`

---

### Parse Recipe from Image

**POST** `/api/recipes/parse/image`

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `image` | File | Recipe image (JPG, PNG, PDF) |
| `recipeId` | string? | Existing recipe ID to update |

**Response:**
```json
{
  "recipeId": "uuid",
  "status": "pending_review",
  "parsedData": {
    "title": "Classic Tomato Soup",
    "ingredients": [...],
    "instructions": [...]
  }
}
```

**Status Values:**
- `pending_review` - AI parsed, needs user confirmation
- `created` - Recipe created directly (if recipeId provided)

---

### Parse Recipe from URL

**POST** `/api/recipes/parse/url`

**Request Body:**
```json
{
  "url": "https://example.com/recipe/tomato-soup"
}
```

**Response:** Same as Parse from Image

---

## Pantry

### Get All Pantry Items

**GET** `/api/pantry`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (IN_STOCK, LOW, OUT) |
| `location` | string | Filter by storage location |
| `category` | string | Filter by ingredient category |

**Response:**
```json
{
  "pantryItems": [
    {
      "id": "uuid",
      "ingredient": {
        "id": "uuid",
        "name": "tomatoes",
        "category": "PRODUCE"
      },
      "quantity": 5,
      "unit": "PIECE",
      "minQuantity": 2,
      "status": "IN_STOCK",
      "expiryDate": "2026-03-01",
      "location": "Pantry",
      "updatedAt": "2026-02-17T10:00:00Z"
    }
  ],
  "summary": {
    "totalItems": 45,
    "lowStock": 3,
    "outOfStock": 1
  }
}
```

---

### Get Low Stock Items

**GET** `/api/pantry/low-stock`

**Response:**
```json
{
  "lowStockItems": [
    {
      "id": "uuid",
      "ingredient": {
        "id": "uuid",
        "name": "onions",
        "category": "PRODUCE"
      },
      "quantity": 1,
      "unit": "PIECE",
      "minQuantity": 2,
      "status": "LOW",
      "suggestedQuantity": 5
    }
  ]
}
```

---

### Update Pantry Item

**PUT** `/api/pantry/:ingredientId`

**Request Body:**
```json
{
  "quantity": 10,
  "unit": "PIECE",
  "minQuantity": 2,
  "expiryDate": "2026-03-15",
  "location": "Pantry"
}
```

**Response:** `200 OK` with updated pantry item

---

### Bulk Update Pantry

**POST** `/api/pantry/bulk-update`

**Request Body:**
```json
{
  "items": [
    {
      "ingredientId": "uuid",
      "quantity": 10,
      "unit": "PIECE"
    },
    {
      "ingredientId": "uuid",
      "quantity": 500,
      "unit": "GRAM"
    }
  ]
}
```

**Response:** `200 OK` with updated items array

---

## Meal Plans

### Get Meal Plans

**GET** `/api/meal-plans`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | date | Start of date range |
| `endDate` | date | End of date range |
| `mealType` | string | Filter by meal type |

**Response:**
```json
{
  "mealPlans": [
    {
      "id": "uuid",
      "recipe": {
        "id": "uuid",
        "title": "Classic Tomato Soup",
        "imageUrl": "https://..."
      },
      "date": "2026-02-17",
      "mealType": "DINNER",
      "servings": 4,
      "notes": null,
      "isCooked": false,
      "cookedAt": null
    }
  ],
  "weekSummary": {
    "totalMeals": 14,
    "cookedMeals": 3,
    "plannedMeals": 11
  }
}
```

---

### Add to Meal Plan

**POST** `/api/meal-plans`

**Request Body:**
```json
{
  "recipeId": "uuid",
  "date": "2026-02-17",
  "mealType": "DINNER",
  "servings": 4,
  "notes": "Double the recipe"
}
```

**Response:** `201 Created` with meal plan object

---

### Remove from Meal Plan

**DELETE** `/api/meal-plans/:id`

**Response:** `204 No Content`

---

### Auto-Fill Meal Plan

**POST** `/api/meal-plans/auto-fill`

**Request Body:**
```json
{
  "weekOf": "2026-02-17",
  "options": {
    "usePantryFirst": true,
    "excludeRecipeIds": ["uuid1", "uuid2"]
  }
}
```

**Response:**
```json
{
  "mealPlans": [...],
  "filledSlots": 5,
  "emptySlots": 2
}
```

---

### Mark Meal as Cooked

**PUT** `/api/meal-plans/:id/cook`

**Request Body:**
```json
{
  "isCooked": true,
  "deductPantry": true
}
```

**Response:**
```json
{
  "success": true,
  "deductedItems": [
    {
      "ingredient": "tomatoes",
      "quantityDeducted": 2,
      "remainingQuantity": 3
    }
  ],
  "lowStockWarnings": [
    {
      "ingredient": "onions",
      "remainingQuantity": 1
    }
  ]
}
```

---

## Shopping Lists

### Get Active Shopping List

**GET** `/api/shopping-lists`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `weekOf` | date | Week starting date |

**Response:**
```json
{
  "shoppingList": {
    "id": "uuid",
    "name": "Weekly List",
    "weekOf": "2026-02-17",
    "isActive": true,
    "items": [
      {
        "id": "uuid",
        "ingredient": {
          "id": "uuid",
          "name": "tomatoes",
          "category": "PRODUCE"
        },
        "name": "tomatoes",
        "quantity": 5,
        "unit": "PIECE",
        "category": "PRODUCE",
        "aisle": "Produce",
        "estimatedPrice": 3.99,
        "is_checked": false,
        "recipe": {
          "id": "uuid",
          "title": "Classic Tomato Soup"
        }
      }
    ],
    "summary": {
      "totalItems": 15,
      "checkedItems": 0,
      "estimatedTotal": 47.32
    }
  }
}
```

---

### Generate Shopping List

**POST** `/api/shopping-lists/generate`

**Request Body:**
```json
{
  "weekOf": "2026-02-17",
  "includeLowStock": true,
  "includeStaples": false
}
```

**Response:**
```json
{
  "shoppingList": {
    "id": "uuid",
    "name": "Weekly List",
    "weekOf": "2026-02-17",
    "items": [...],
    "generatedFrom": {
      "mealPlans": 10,
      "lowStockItems": 3
    }
  }
}
```

---

### Add Item to Shopping List

**POST** `/api/shopping-lists/items`

**Request Body:**
```json
{
  "shoppingListId": "uuid",
  "name": "Paper towels",
  "quantity": 2,
  "unit": "PIECE",
  "category": "OTHER",
  "aisle": "Household",
  "notes": "Get the bulk pack"
}
```

**Response:** `201 Created` with shopping list item

---

### Update Shopping Item

**PUT** `/api/shopping-lists/items/:id`

**Request Body:**
```json
{
  "is_checked": true,
  "quantity": 3,
  "notes": "On sale this week"
}
```

**Response:** `200 OK` with updated item

---

### Complete Shopping Trip

**POST** `/api/shopping-lists/complete`

**Request Body:**
```json
{
  "shoppingListId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "restockedItems": [
    {
      "ingredient": "tomatoes",
      "quantityAdded": 5,
      "newQuantity": 8
    }
  ],
  "newShoppingList": {
    "id": "uuid",
    "weekOf": "2026-02-24"
  }
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {...}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | User doesn't have access to resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate meal) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Example Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "issues": [
        {
          "field": "quantity",
          "message": "Quantity must be a positive number"
        }
      ]
    }
  }
}
```

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/api/recipes/parse/*` | 10 requests/minute |
| `/api/*` (general) | 100 requests/minute |

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645097400
```

---

## Related Documents

- [Technical Specification](02-technical-spec.md) - Server actions implementation
- [Database Schema](01-database-schema.md) - Data models
- [Development Setup](06-development-setup.md) - API configuration

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
