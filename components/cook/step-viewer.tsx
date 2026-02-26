"use client"

import { useState, useEffect } from "react"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { VoiceControl } from "./voice-control"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

interface StepViewerProps {
    recipe: {
        title: string
        ingredients: { name: string, quantity: number, unit: string }[]
        instructions: { step: number, text: string }[]
    }
}

export function StepViewer({ recipe }: StepViewerProps) {
    const [currentStep, setCurrentStep] = useState(0) // 0 = Ingredients, 1+ = Steps
    const { requestLock, releaseLock } = useWakeLock()
    const router = useRouter()

    useEffect(() => {
        requestLock()
        return () => { releaseLock() }
    }, [requestLock, releaseLock])

    const totalSteps = recipe.instructions.length
    const progress = (currentStep / totalSteps) * 100

    const next = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    const prev = () => setCurrentStep(prev => Math.max(0, prev - 1))

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold leading-none">{recipe.title}</h2>
                    <p className="text-sm text-muted-foreground">
                        {currentStep === 0 ? "Prep" : `Step ${currentStep} of ${totalSteps}`}
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <Progress value={progress} className="h-1 rounded-none" />

            {/* Content */}
            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 text-center">

                {currentStep === 0 ? (
                    <div className="w-full max-w-md space-y-6 text-left">
                        <h3 className="flex items-center justify-between text-2xl font-bold tracking-tight">
                            Ingredients
                            <VoiceControl text={`Ingredients for ${recipe.title}. ${recipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`).join('. ')}`} />
                        </h3>
                        <ul className="space-y-3">
                            {recipe.ingredients.map((ing, i) => (
                                <li key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span className="text-base">
                                        <span className="font-semibold">{ing.quantity} {ing.unit.toLowerCase()}</span> {ing.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="max-w-2xl space-y-8">
                        <div className="text-6xl font-black text-primary/10">
                            {currentStep}
                        </div>
                        <p className="text-3xl font-medium leading-normal md:text-4xl">
                            {recipe.instructions[currentStep - 1].text}
                        </p>
                        <div className="flex justify-center">
                            <VoiceControl text={recipe.instructions[currentStep - 1].text} />
                        </div>
                    </div>
                )}

            </div>

            {/* Footer Navigation */}
            <div className="flex gap-4 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={prev}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                    size="lg"
                    className="flex-1"
                    onClick={next}
                    disabled={currentStep === totalSteps}
                >
                    {currentStep === totalSteps ? "Finish" : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
