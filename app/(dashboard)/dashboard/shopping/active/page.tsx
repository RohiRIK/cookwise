"use client"

import { useEffect, useState } from "react"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { ShoppingListItem } from "@prisma/client"
import { getShoppingList, toggleShoppingItem } from "@/app/actions/shopping-list"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Lock, Unlock } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function ShoppingActivePage() {
    const { isLocked, requestLock, releaseLock, isSupported } = useWakeLock()
    const [items, setItems] = useState<ShoppingListItem[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        requestLock()

        getShoppingList().then(list => {
            if (list?.items) setItems(list.items)
            setLoading(false)
        })

        return () => {
            releaseLock()
        }
    }, [requestLock, releaseLock])

    const handleToggle = async (id: string, checked: boolean) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, isChecked: checked } : item
        ))
        await toggleShoppingItem(id, checked)
    }

    const sortedItems = [...items].sort((a, b) => {
        if (a.isChecked === b.isChecked) return 0
        return a.isChecked ? 1 : -1
    })

    const progress = items.length > 0
        ? Math.round((items.filter(i => i.isChecked).length / items.length) * 100)
        : 0

    if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading list...</div>

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 px-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                {isSupported && (
                    <Button variant="ghost" size="icon" onClick={isLocked ? releaseLock : requestLock}>
                        {isLocked ? <Lock className="h-4 w-4 text-primary" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                )}
            </header>

            <main className="flex-1 space-y-4 p-4 pb-20 md:container md:py-8">
                {sortedItems.map(item => (
                    <div
                        key={item.id}
                        className={cn(
                            "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all active:scale-[0.98]",
                            item.isChecked
                                ? "bg-muted/50 border-transparent opacity-60"
                                : "bg-card border-border shadow-sm hover:shadow-md"
                        )}
                        onClick={() => handleToggle(item.id, !item.isChecked)}
                    >
                        <div className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border ring-offset-background",
                            item.isChecked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground"
                        )}>
                            {item.isChecked && <CheckCircle2 className="h-4 w-4" />}
                        </div>

                        <div className="flex-1">
                            <span className={cn(
                                "block text-base font-medium",
                                item.isChecked && "line-through text-muted-foreground"
                            )}>
                                {item.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {item.quantity} {item.unit.toLowerCase()} • {item.category}
                            </span>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                        <p>No items in list.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
