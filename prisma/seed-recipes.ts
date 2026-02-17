import { PrismaClient, RecipeSourceType, IngredientCategory, UnitType, MealType, Ingredient } from "@prisma/client"

const prisma = new PrismaClient()

export async function seedRecipes(householdId: string, userId: string) {
    console.log("Seeding recipes...")

    // 1. Create Ingredients (Global)
    const ingredients = [
        { name: "Chicken Breast", category: IngredientCategory.MEAT },
        { name: "Olive Oil", category: IngredientCategory.OILS },
        { name: "Garlic", category: IngredientCategory.PRODUCE },
        { name: "Onion", category: IngredientCategory.PRODUCE },
        { name: "Tomato Sauce", category: IngredientCategory.CANNED },
        { name: "Spaghetti", category: IngredientCategory.GRAINS },
        { name: "Dried Oregano", category: IngredientCategory.SPICES },
        { name: "Salt", category: IngredientCategory.SPICES },
        { name: "Black Pepper", category: IngredientCategory.SPICES },
        { name: "Parmesan Cheese", category: IngredientCategory.DAIRY },
    ]

    const createdIngredients: Ingredient[] = []
    for (const ing of ingredients) {
        const created = await prisma.ingredient.upsert({
            where: { name: ing.name },
            update: {},
            create: ing,
        })
        createdIngredients.push(created)
    }
    console.log(`Created ${createdIngredients.length} ingredients.`)

    // 2. Create Recipe: Chicken Pasta
    const chickenPasta = await prisma.recipe.create({
        data: {
            title: "Simple Chicken Pasta",
            description: "A quick and easy weeknight dinner.",
            sourceType: RecipeSourceType.MANUAL,
            prepTime: 15,
            cookTime: 20,
            servings: 4,
            difficulty: "Easy",
            tags: ["dinner", "pasta", "chicken", "quick"],
            householdId,
            creatorId: userId,
            ingredients: {
                create: [
                    {
                        ingredient: { connect: { name: "Chicken Breast" } },
                        quantity: 500,
                        unit: UnitType.GRAM,
                        originalText: "500g Chicken Breast, diced",
                        notes: "Diced",
                    },
                    {
                        ingredient: { connect: { name: "Spaghetti" } },
                        quantity: 400,
                        unit: UnitType.GRAM,
                        originalText: "400g Spaghetti",
                    },
                    {
                        ingredient: { connect: { name: "Tomato Sauce" } },
                        quantity: 1,
                        unit: UnitType.CUP, // Assuming jar/can but using cup for now or unit adjustment
                        originalText: "1 jar Tomato Sauce",
                        notes: "Any brand",
                    },
                    {
                        ingredient: { connect: { name: "Olive Oil" } },
                        quantity: 2,
                        unit: UnitType.TABLESPOON,
                        originalText: "2 tbsp Olive Oil",
                    },
                ],
            },
            steps: {
                create: [
                    { stepNumber: 1, instruction: "Boil water in a large pot and cook spaghetti according to package instructions." },
                    { stepNumber: 2, instruction: "Meanwhile, heat olive oil in a pan over medium heat." },
                    { stepNumber: 3, instruction: "Add diced chicken and cook until browned and cooked through." },
                    { stepNumber: 4, instruction: "Stir in tomato sauce and simmer for 5 minutes." },
                    { stepNumber: 5, instruction: "Drain pasta and toss with the sauce. Serve with parmesan." },
                ],
            },
        },
    })
    console.log(`Created recipe: ${chickenPasta.title}`)

    // 3. Create Meal Plan
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize to midnight

    await prisma.mealPlan.create({
        data: {
            date: today,
            mealType: MealType.DINNER,
            recipeId: chickenPasta.id,
            householdId,
            userId,
            servings: 4,
            isCooked: false,
        },
    })
    console.log("Created meal plan for today.")
}
