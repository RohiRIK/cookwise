import { PrismaClient } from "@prisma/client"

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
    await prisma.user.create({
        data: {
            email: userEmail,
            name: "Test User",
            householdId: household.id,
        },
    })

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
