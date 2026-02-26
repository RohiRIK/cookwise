"use client"

import * as React from "react"
import { Loader2, Upload, Image as ImageIcon, Link as LinkIcon } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { parseRecipeImage, parseRecipeUrl, RecipeInput } from "@/app/actions/recipe"

interface RecipeImportProps {
    onImport: (data: RecipeInput) => void
}

export function RecipeImport({ onImport }: RecipeImportProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isParsing, setIsParsing] = React.useState(false)
    const [preview, setPreview] = React.useState<string | null>(null)
    const [url, setUrl] = React.useState("")
    const inputFileRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
    }

    const handleImageUpload = async () => {
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
            if (preview) {
                URL.revokeObjectURL(preview)
                setPreview(null)
            }
        }
    }

    const handleUrlImport = async () => {
        if (!url.trim()) return

        setIsParsing(true)

        try {
            const result = await parseRecipeUrl(url.trim())

            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to parse recipe URL")
            }

            toast({
                title: "Recipe imported!",
                description: "Review the details and make any necessary corrections.",
            })

            onImport(result.data)
            setUrl("")
            setIsOpen(false)
        } catch (error) {
            console.error(error)
            const message =
                error instanceof Error
                    ? error.message
                    : "Could not import from this URL."
            toast({
                title: "Import failed",
                description: message,
                variant: "destructive",
            })
        } finally {
            setIsParsing(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 size-4" />
                    Import Recipe
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Import Recipe</DialogTitle>
                    <DialogDescription>
                        Import a recipe from an image or a website URL.
                        AI will extract the details automatically.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url">
                            <LinkIcon className="mr-2 size-4" />
                            From URL
                        </TabsTrigger>
                        <TabsTrigger value="image">
                            <ImageIcon className="mr-2 size-4" />
                            From Image
                        </TabsTrigger>
                    </TabsList>

                    {/* URL Tab */}
                    <TabsContent value="url" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipe-url">Recipe URL</Label>
                            <Input
                                id="recipe-url"
                                type="url"
                                placeholder="https://www.example.com/recipe/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isParsing}
                            />
                            <p className="text-xs text-muted-foreground">
                                Paste a link to any recipe page. Works best with
                                structured recipe sites.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isParsing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUrlImport}
                                disabled={!url.trim() || isParsing}
                            >
                                {isParsing && <Loader2 className="mr-2 size-4 animate-spin" />}
                                {isParsing ? "Scraping..." : "Import"}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Image Tab */}
                    <TabsContent value="image" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipe-image">Recipe Image</Label>
                            <Input
                                ref={inputFileRef}
                                id="recipe-image"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isParsing}
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
                                onClick={handleImageUpload}
                                disabled={!preview || isParsing}
                            >
                                {isParsing && <Loader2 className="mr-2 size-4 animate-spin" />}
                                {isParsing ? "Analyzing..." : "Import"}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
