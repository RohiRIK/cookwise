"use server"

interface ProductInfo {
    name: string
    image?: string
    brand?: string
    quantity?: number
    unit?: string
}

export async function lookupProduct(barcode: string): Promise<{ success: boolean; data?: ProductInfo; error?: string }> {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
            method: "GET",
            headers: {
                "User-Agent": "KitchenOS/1.0 (kitchen-os@example.com)",
            },
        })

        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: "Product not found" }
            }
            return { success: false, error: `API Error: ${response.statusText}` }
        }

        const data = await response.json()

        if (data.status === 0 || !data.product) {
            return { success: false, error: "Product not found" }
        }

        const product = data.product

        // Attempt to extract quantity and unit
        // OpenFoodFacts has `product_quantity` (number) and `quantity` (string like "500 g")
        let quantity = 1;
        let unit = "PIECE"; // Default

        // Simple heuristic for unit/quantity - this can be improved
        // For now we just return the name and let user fill rest or we try to parse string
        const quantityStr = product.quantity || "";
        // Regex to match "500 g", "1 kg", "500ml" etc.
        const match = quantityStr.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
        if (match) {
            quantity = parseFloat(match[1]);
            const unitStr = match[2].toLowerCase();
            if (['g', 'gram', 'grams'].includes(unitStr)) unit = "G";
            else if (['kg', 'kilogram', 'kilograms'].includes(unitStr)) unit = "KG";
            else if (['ml', 'milliliter', 'milliliters'].includes(unitStr)) unit = "ML";
            else if (['l', 'liter', 'liters'].includes(unitStr)) unit = "L";
            else if (['oz', 'ounce', 'ounces'].includes(unitStr)) unit = "OZ";
            else if (['lb', 'pound', 'pounds'].includes(unitStr)) unit = "LB";
        }

        return {
            success: true,
            data: {
                name: product.product_name || product.product_name_en || "Unknown Product",
                image: product.image_front_url || product.image_url,
                brand: product.brands,
                quantity: quantity,
                unit: unit
            },
        }
    } catch (error) {
        console.error("Product lookup failed:", error)
        return { success: false, error: "Failed to connect to product database" }
    }
}
