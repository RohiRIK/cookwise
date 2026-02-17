# CookWise FAQ

> **Product:** CookWise - The AI-Powered Kitchen Operating System  
> **Domain:** cookwise.io  
> **Version:** 1.0

---

## Table of Contents

1. [General](#general)
2. [Recipes](#recipes)
3. [Pantry](#pantry)
4. [Meal Planning](#meal-planning)
5. [Shopping](#shopping)
6. [Household & Account](#household--account)
7. [Technical](#technical)

---

## General

### What is CookWise?

CookWise is an AI-powered kitchen management app that helps you organize recipes, track pantry inventory, plan meals, and generate shopping lists.

### Is CookWise free?

Currently in development. Pricing will be announced at launch.

### What platforms are supported?

CookWise is a web application that works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome)
- Can be installed as PWA (Progressive Web App)

### Can I use CookWise offline?

Limited offline functionality:
- ✅ View saved recipes
- ✅ View current meal plan
- ✅ Check shopping list
- ❌ Upload new recipes (requires internet)
- ❌ Sync changes (requires internet)

---

## Recipes

### How does recipe OCR work?

Upload a photo of a recipe, and our AI (Google Gemini) extracts:
- Recipe title
- Ingredients with quantities
- Step-by-step instructions
- Prep/cook times

Accuracy is typically 90%+ for clear, typed recipes.

### Can I import recipes from websites?

Yes! Paste any recipe URL and we'll scrape and format the recipe. Works with most recipe blogs and cooking sites.

### What image formats are supported?

- JPG/JPEG
- PNG
- PDF (multi-page recipes)

Max file size: 10MB

### Can I edit AI-parsed recipes?

Absolutely! All OCR/imported recipes open in edit mode for review before saving.

### How do I organize recipes?

Use tags and categories:
- Add custom tags (e.g., "quick", "vegetarian")
- Filter by difficulty, cuisine, meal type
- Search by title or ingredients

---

## Pantry

### How do I track pantry items?

1. Add items manually
2. Set quantities and units
3. Update as you use items
4. Automatic deduction when you cook meals

### What are pantry statuses?

- **In Stock (Green):** Quantity above minimum
- **Low Stock (Yellow):** At or below minimum threshold
- **Out of Stock (Red):** Quantity is zero

### Can I set expiration reminders?

Yes! Add expiry dates to items and get notified before they expire.

### How do I handle staples (salt, oil, etc.)?

Mark items as "staples" to hide them from main shopping list. Toggle "Show Staples" when needed.

---

## Meal Planning

### How far in advance can I plan?

Plan as far ahead as you want! Calendar view shows one week at a time, but you can navigate to any future date.

### What is the "Surprise Me" button?

Auto-fill empty meal slots with recipes from your collection. Option to prioritize recipes using ingredients you already have.

### Can I plan for specific dietary needs?

Yes! Filter recipes by tags when adding to meal plan:
- Vegetarian
- Vegan
- Gluten-free
- Low-carb
- etc.

### What happens when I mark a meal as cooked?

Ingredients are automatically deducted from your pantry, and inventory is updated.

### Can I reschedule meals?

Yes! Drag and drop meals to different days/times, or edit and change the date.

---

## Shopping

### How is the shopping list generated?

Shopping list = (Ingredients needed for meal plan) - (Items in pantry)

Automatically deduplicates and aggregates quantities.

### Can I add items not from meal plans?

Yes! Manually add any item to your shopping list.

### Is the shopping list shareable?

Yes! Everyone in your household sees the same list in real-time. Changes sync instantly.

### What is Shopping Mode?

Mobile-optimized view with:
- Larger touch targets
- Screen stays awake (wake lock)
- Progress tracking
- Simplified navigation

### Can I organize by store aisle?

Items are grouped by category (Produce, Dairy, etc.). You can customize aisle assignments.

---

## Household & Account

### What is a household?

A household is a family/unit that shares recipes, pantry, and shopping lists. All members have full access.

### How many people can be in a household?

No limit! Add as many members as needed.

### How do I invite someone?

1. Go to Settings → Household
2. Click "Generate Invite Code"
3. Share code with family member
4. They enter code during signup

### Can I be in multiple households?

Currently, users can only belong to one household at a time.

### What happens if I leave a household?

You retain access to recipes you created, but shared pantry and meal plans remain with the household.

---

## Technical

### What browser should I use?

Latest versions of:
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Is my data backed up?

Yes! Database is backed up daily. All changes are saved in real-time.

### Can I export my data?

Yes! Export options:
- Recipes (JSON, PDF)
- Pantry inventory (CSV)
- Full data export (Settings → Export)

### How do I delete my account?

Settings → Account → Delete Account

This permanently removes all your data. This action cannot be undone.

### Is my data secure?

Yes! We use:
- HTTPS encryption
- Secure authentication (NextAuth.js)
- Household data isolation
- Regular security audits

### Do you sell my data?

No! Your data is private and never sold to third parties.

---

## Troubleshooting

### Recipe OCR failed

Try these:
1. Ensure image is clear and well-lit
2. Crop to recipe area only
3. Check file size (< 10MB)
4. Try manual entry as backup

### Shopping list not updating

1. Refresh the page
2. Check internet connection
3. Ensure household members have sync enabled

### Can't login

1. Reset password
2. Clear browser cache
3. Check for typos in email
4. Contact support if issue persists

### App is slow

1. Clear browser cache
2. Close unused tabs
3. Check internet speed
4. Try latest browser version

---

## Still Have Questions?

**Email:** support@cookwise.io  
**Help Center:** cookwise.io/help  
**Twitter:** @cookwise_app

---

*Document Version: 1.0 | Last Updated: 2026-02-17 | CookWise Technical Team*
