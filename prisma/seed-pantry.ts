import { PrismaClient, IngredientCategory, UnitType, PantryStatus } from "@prisma/client"

const db = new PrismaClient()

async function main() {
    console.log("Seeding pantry items...")

    const user = await db.user.findFirst({
        include: { household: true }
    })

    if (!user || !user.householdId) {
        console.log("No user with household found. Please run seed-recipes.ts first.")
        return
    }

    console.log(`Found user: ${user.email} in household: ${user.household?.name}`)

    // Create an ingredient if not exists
    const ingredient = await db.ingredient.upsert({
        where: { name: "Test Apple" },
        update: {},
        create: {
            name: "Test Apple",
            category: IngredientCategory.PRODUCE,
        }
    })

    // Add to pantry
    const pantryItem = await db.pantryItem.create({
        data: {
            householdId: user.householdId,
            ingredientId: ingredient.id,
            quantity: 5,
            unit: UnitType.PIECE,
            location: "Fridge",
            status: PantryStatus.IN_STOCK,
            minQuantity: 1,
            userId: user.id,
        }
    })

    console.log("Created pantry item:", pantryItem)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
