import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"

import { db } from "@/lib/db"

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password } = userSchema.parse(body)

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: {
                email,
            },
        })

        if (existingUser) {
            return NextResponse.json(
                { user: null, message: "User with this email already exists" },
                { status: 409 }
            )
        }

        const hashedPassword = await hash(password, 10)

        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        })

        const { password: newUserPassword, ...rest } = newUser

        return NextResponse.json(
            { user: rest, message: "User created successfully" },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Invalid input", errors: error.issues },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { message: "Something went wrong", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
