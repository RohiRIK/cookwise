# Product Requirements Document: CookWise

| Metadata | Details |
| :--- | :--- |
| **Product Name** | CookWise |
| **Tagline** | The AI-Powered Kitchen Operating System |
| **Domain** | cookwise.io |
| **Version** | 1.1 |
| **Status** | Draft |
| **Target Audience** | Household members (Couples/Partners) |

## 1. Executive Summary

### 1.1 Problem Statement
Managing the household food lifecycle—from recipe organization and pantry tracking to meal planning and grocery shopping—is currently a disjointed process involving physical books, scattered notes, and mental checklists. This leads to decision fatigue, food waste from overbuying, and inefficient shopping trips.

### 1.2 Proposed Solution
CookWise is a centralized web application designed to digitize and automate the culinary workflow. It features AI-powered recipe ingestion (OCR), intelligent pantry management, automated meal scheduling, and dynamic shopping list aggregation with price comparison.

### 1.3 Success Criteria
- **Efficiency**: Reduce weekly meal planning and list generation time by 50%.
- **Accuracy**: Achieve >90% accuracy in parsing ingredients from recipe images via Gemini API.
- **Cost Savings**: Users save money through the "Basket Price Comparison" feature across local retailers.
- **Adoption**: Daily Active Usage (DAU) by both partners for shopping and cooking tasks.

## 2. Branding & Naming Rationale

### 2.1 Chosen Name: CookWise

**Domain:** cookwise.io

### 2.2 Naming Criteria

| Criterion | Rationale |
|-----------|-----------|
| **Short & Memorable** | 8 characters, 2 syllables, easy to recall |
| **Descriptive** | "Cook" immediately signals the product category |
| **Implies Intelligence** | "Wise" reflects AI-powered features (Gemini OCR, smart suggestions) |
| **Tech-Forward** | .io extension signals modern tech product |
| **Brandable** | Unique enough to stand out, pronounceable |
| **Audience-Aligned** | Appeals to tech-savvy couples managing their kitchen |

### 2.3 Why CookWise?

1. **Captures Core Value**: The name embodies "cooking smarter, not harder"
2. **AI Differentiation**: "Wise" subtly communicates the intelligent features without being generic like "Smart"
3. **Verb + Adjective Structure**: Follows successful SaaS naming patterns (MailChimp, TurboTax, QuickBooks)
4. **Domain Availability**: cookwise.io is available and aligns with developer-tool positioning
5. **Scalable Brand**: Can expand to sub-brands (CookWise Shop, CookWise Plan, CookWise Pantry)

### 2.4 Brand Positioning

> *"CookWise is your kitchen's operating system—turning recipes, ingredients, and meal plans into a seamless, intelligent workflow."*

## 3. User Experience & Functionality

### 3.1 User Personas
- **The Planner (User A)**: Focuses on digitizing recipes, organizing the weekly schedule, and managing the high-level inventory. Uses Desktop primarily.
- **The Executor (User B)**: Focuses on the shopping trip and cooking execution. Needs a streamlined, interactive Mobile interface.

### 3.2 User Stories

#### Core: Recipe Management
- **Story**: As a user, I want to upload a photo of a cookbook page or a PDF.
  - **Goal**: To have the system automatically extract the title, ingredients, and instructions without manual typing.
- **Story**: As a user, I want to paste a URL from a recipe blog.
  - **Goal**: To scrape and format the recipe into a consistent, ad-free layout.

#### Core: Inventory & Planning
- **Story**: As a user, I want to drag and drop recipes into a weekly calendar.
  - **Goal**: To visually plan meals for Breakfast, Lunch, and Dinner.
- **Story**: As a user, I want to click a "Lazy Button" (Surprise Me).
  - **Goal**: To have the system auto-fill empty meal slots based on what is currently in my pantry to minimize shopping.
- **Story**: As a user, I want items in my pantry to be automatically deducted when I mark a meal as "Cooked".
  - **Goal**: To keep inventory levels accurate without manual counting.

#### Core: Shopping
- **Story**: As a shopper, I want my shopping list to aggregate ingredients (e.g., "5 eggs" instead of "2 eggs + 3 eggs").
  - **Goal**: To pick up items efficiently in one go.
- **Story**: As a shopper, I want the list sorted by supermarket aisle (Produce, Dairy, etc.).
  - **Goal**: To navigate the store without backtracking.
- **Story**: As a shopper, I want to compare the total price of my current list across local supermarkets.
  - **Goal**: To decide where to shop for the best value.

### 3.3 Acceptance Criteria
- **Recipe Parsing**: System must normalize ingredients (e.g., mapping "2 large tomatoes" to Item: "Tomato", Qty: 2, Unit: "Large", Category: "Produce").
- **Smart Deduplication**: Shopping list generation must calculate (Recipe Requirements - Pantry Stock) to determine buy quantity.
- **Real-time Sync**: When Partner A checks off an item on their phone, Partner B's screen must update within <1 second.
- **Staples Logic**: Common items (salt, oil) must be hidden from the main list unless the "Show Staples" toggle is active.

### 3.4 Non-Goals
- **Social Sharing**: No public profile or recipe sharing features in V1.
- **Direct Delivery**: Integration with grocery delivery APIs (Instacart/UberEats) is out of scope for V1; price comparison is informational only.

## 4. AI System Requirements

### 4.1 Tools & Models
- **Provider**: Google Gemini API.
- **Model**: `gemini-1.5-flash` (Optimized for speed and cost-efficiency).
- **Capabilities**: Multimodal (Vision + Text) for OCR and structural data extraction.

### 4.2 Prompt Engineering Strategy
- **Input**: Raw image/PDF or raw text from scraper.
- **System Prompt**: "You are a culinary data architect. Extract the following JSON schema: `{ title, ingredients: [{ item, qty, unit, category }], instructions, prep_time, tags }`. Normalize all units to metric where possible."

### 4.3 Evaluation Strategy
- **Validation**: Implementation of a "Review" stage where the user verifies AI-parsed data before saving to the DB.
- **Feedback Loop**: User edits to parsed data should be logged to refine future prompt structures.

## 5. Technical Specifications

### 5.1 Technology Stack
- **Runtime**: Bun (Package manager & runtime).
- **Framework**: Next.js (App Router).
- **Language**: TypeScript.
- **Database**: PostgreSQL.
- **ORM**: Prisma.
- **Styling**: Tailwind CSS + shadcn/ui.
- **Starting Template**: Taxonomy by shadcn (Open Source Next.js 16+ Starter).

### 5.2 Architecture Overview
- **Client (Mobile/Desktop)**: Responsive UI. Uses optimistic updates for shopping list interactions to ensure perceived zero-latency.
- **API Layer**: Next.js Server Actions for secure database mutations.
- **Intelligence Layer**:
  - **OCR Service**: Transmits file buffers to Gemini API.
  - **Scraper Service**: Fetches HTML, sanitizes via DOM parser, then passes to LLM for structuring.
- **Database Layer**: Relational data model handling many-to-many relationships between Recipes and Ingredients.

### 5.3 Key Data Entities
- **User**: `id`, `household_id`, `preferences`.
- **Recipe**: `id`, `json_content` (ingredients, steps), `source_type` (OCR/URL/Manual).
- **PantryItem**: `id`, `ingredient_name`, `quantity`, `status` (In/Low/Out).
- **MealPlan**: `date`, `slot_type` (Breakfast/Lunch/Dinner), `recipe_id`.
- **ShoppingList**: `id`, `week_of`, `items` (Aggregated view of MealPlan - Pantry).

### 5.4 Mobile-Specific Requirements
- **Wake Lock API**: Prevent screen dimming while on the `/shopping-mode` route.
- **Touch Targets**: Checkboxes must have a minimum touch target of 44x44px.

## 6. Risks & Roadmap

### 6.1 Project Phasing
- **Phase 1 (MVP)**: Infrastructure (Bun/Next.js), DB Schema, Manual Recipe Entry, Gemini OCR integration.
- **Phase 2 (Core Logic)**: Pantry inventory tracking and Basic Meal Planning (Calendar view).
- **Phase 3 (Intelligence)**: Shopping List Aggregation logic, "Lazy Button" algorithm, and "Pantry-First" recipe filtering.
- **Phase 4 (Market)**: Basket Price Comparison module (requires external data sources/scrapers).

### 6.2 Technical Risks
- **Risk**: Gemini API Latency.
  - **Mitigation**: Implement optimistic UI for uploads and background processing queues for heavy OCR tasks.
- **Risk**: Price Comparison Data Accuracy.
  - **Mitigation**: Supermarket prices fluctuate daily. Implement a disclaimer that prices are "estimates" and allow manual price overrides.
- **Risk**: Ingredient Normalization.
  - **Mitigation**: "Tomatoes" vs "Tomato, chopped". The system needs a fuzzy matching algorithm to link recipe ingredients to pantry items effectively.