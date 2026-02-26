"use client"

import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"
import { useEffect, useState } from "react"

interface VoiceControlProps {
    text: string
}

export function VoiceControl({ text }: VoiceControlProps) {
    const [speaking, setSpeaking] = useState(false)
    const [supported] = useState(
        typeof window !== "undefined" && "speechSynthesis" in window
    )

    const speak = () => {
        if (!supported) return

        window.speechSynthesis.cancel() // Stop any current speech

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)

        setSpeaking(true)
        window.speechSynthesis.speak(utterance)
    }

    const stop = () => {
        window.speechSynthesis.cancel()
        setSpeaking(false)
    }

    if (!supported) return null

    return (
        <Button variant="outline" size="icon" onClick={speaking ? stop : speak}>
            {speaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
    )
}
