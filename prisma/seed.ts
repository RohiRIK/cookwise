import { PrismaClient } from "@prisma/client"
import { seedRecipes } from "./seed-recipes"

const prisma = new PrismaClient()

async function main() {
    const userEmail = "test@example.com"

    // cleanup
    await prisma.user.deleteMany({ where: { email: userEmail } })
    await prisma.household.deleteMany()

    // create household
    const household = await prisma.household.create({
        data: {
            name: "Test Household",
        },
    })

    // create user
    const user = await prisma.user.create({
        data: {
            email: userEmail,
            name: "Test User",
            householdId: household.id,
        },
    })

    // seed recipes
    await seedRecipes(household.id, user.id)

    console.log("Seeding completed.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
