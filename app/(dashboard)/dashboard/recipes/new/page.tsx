import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import { RecipeForm } from "@/components/forms/recipe-form"

export default function NewRecipePage() {
    return (
        <DashboardShell>
            <DashboardHeader
                heading="Create Recipe"
                text="Add a new recipe to your collection."
            />
            <div className="grid gap-10">
                <RecipeForm />
            </div>
        </DashboardShell>
    )
}
