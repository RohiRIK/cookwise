"use client"

import * as React from "react"
import { Loader2, Upload, Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { parseRecipeImage, RecipeInput } from "@/app/actions/recipe"

interface RecipeImportProps {
    onImport: (data: RecipeInput) => void
}

export function RecipeImport({ onImport }: RecipeImportProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isParsing, setIsParsing] = React.useState(false)
    const [preview, setPreview] = React.useState<string | null>(null)
    const inputFileRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Create preview
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
    }

    const handleUpload = async () => {
        const file = inputFileRef.current?.files?.[0]
        if (!file) return

        setIsParsing(true)

        try {
            const formData = new FormData()
            formData.append("image", file)

            const result = await parseRecipeImage(formData)

            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to parse recipe")
            }

            toast({
                title: "Recipe parsed!",
                description: "Review the details and make any necessary corrections.",
            })

            onImport(result.data)
            setIsOpen(false)
        } catch (error) {
            console.error(error)
            toast({
                title: "Import failed",
                description: "Could not parse the recipe image. Please try again or enter manually.",
                variant: "destructive",
            })
        } finally {
            setIsParsing(false)
            // Cleanup preview
            if (preview) {
                URL.revokeObjectURL(preview)
                setPreview(null)
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ImageIcon className="mr-2 size-4" />
                    Import from Image
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Recipe from Image</DialogTitle>
                    <DialogDescription>
                        Upload a photo of a recipe (cookbook, card, or screenshot).
                        AI will attempt to extract the details.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Recipe Image</Label>
                        <Input
                            ref={inputFileRef}
                            id="picture"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {preview && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={preview}
                                alt="Recipe preview"
                                className="size-full object-cover"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isParsing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!preview || isParsing}
                        >
                            {isParsing && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isParsing ? "Analyzing..." : "Import"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
