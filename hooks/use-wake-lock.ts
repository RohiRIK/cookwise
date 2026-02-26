"use client"

import { useEffect, useState, useCallback } from "react"

export function useWakeLock() {
    const [isLocked, setIsLocked] = useState(false)
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)
    const [isSupported, setIsSupported] = useState(
        typeof window !== "undefined" && "wakeLock" in navigator
    )

    const requestLock = useCallback(async () => {
        if (!isSupported) return

        try {
            const lock = await navigator.wakeLock.request("screen")
            setWakeLock(lock)
            setIsLocked(true)

            lock.addEventListener("release", () => {
                setIsLocked(false)
                setWakeLock(null)
            })
        } catch (err) {
            console.error(`${err.name}, ${err.message}`)
        }
    }, [isSupported])

    const releaseLock = useCallback(async () => {
        if (wakeLock) {
            await wakeLock.release()
            setWakeLock(null)
            setIsLocked(false)
        }
    }, [wakeLock])

    // Re-acquire lock if visibility changes (e.g. user tabs away and back)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
                await requestLock()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            if (wakeLock) wakeLock.release()
        }
    }, [wakeLock, requestLock])

    return { isLocked, requestLock, releaseLock, isSupported }
}
