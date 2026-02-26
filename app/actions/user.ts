"use server"

import { revalidatePath } from "next/cache"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { userGeminiKeySchema } from "@/lib/validations/user"

export async function updateUserGeminiKey(data: z.infer<typeof userGeminiKeySchema>) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    const { geminiApiKey } = userGeminiKeySchema.parse(data)

    try {
        await db.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                geminiApiKey: geminiApiKey === "" ? null : geminiApiKey,
            },
        })

        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update user gemini key:", error)
        return { success: false, error: "Failed to update API key" }
    }
}
