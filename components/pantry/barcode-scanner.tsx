"use client"

import * as React from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BarcodeScannerProps {
    onScan: (result: string) => void
    onError?: (error: unknown) => void
    onClose: () => void
}

export function BarcodeScanner({ onScan, onError, onClose }: BarcodeScannerProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
            <div className="absolute right-4 top-4 z-10">
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                    <X className="size-6" />
                </Button>
            </div>
            <div className="flex flex-1 items-center justify-center p-4">
                <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-black">
                    <Scanner
                        onScan={(result) => {
                            if (result && result.length > 0) {
                                onScan(result[0].rawValue)
                            }
                        }}
                        onError={(error) => {
                            if (onError) onError(error)
                        }}
                        formats={[
                            'qr_code',
                            'ean_13',
                            'ean_8',
                            'upc_a',
                            'upc_e',
                            'code_128',
                            'code_39'
                        ]}
                    />
                    <div className="absolute inset-x-0 bottom-4 text-center text-sm text-white/70">
                        Point camera at a barcode
                    </div>
                </div>
            </div>
        </div>
    )
}
