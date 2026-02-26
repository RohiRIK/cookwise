const BASE_URL = "http://localhost:3001"

async function verifyAuth() {
    console.log("Verifying Authentication Flow...")

    // Generate a random email
    const email = `test-${Math.random().toString(36).substring(7)}@example.com`
    const password = "password123"

    console.log(`Attempting to register user: ${email}`)

    try {
        const response = await fetch(`${BASE_URL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })

        console.log(`Response Status: ${response.status}`)
        const data = await response.json()
        console.log("Response Data:", data)

        if (response.ok) {
            console.log("✅ Registration successful!")
        } else {
            console.error("❌ Registration failed:", data)
            process.exit(1)
        }

    } catch (error) {
        console.error("❌ Error during request:", error)
        process.exit(1)
    }
}

verifyAuth()
