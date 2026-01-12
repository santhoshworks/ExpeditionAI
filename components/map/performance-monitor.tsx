"use client"

import { useEffect, useState } from "react"

interface PerformanceMonitorProps {
    enabled?: boolean
}

export function PerformanceMonitor({ enabled = false }: PerformanceMonitorProps) {
    const [metrics, setMetrics] = useState<{
        renderTime: number
        nodeCount: number
        memoryUsage?: number
    } | null>(null)

    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return

        const startTime = performance.now()

        // Monitor render performance
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const renderEntry = entries.find(entry => entry.name.includes('react-flow'))

            if (renderEntry) {
                setMetrics(prev => ({
                    renderTime: renderEntry.duration,
                    nodeCount: prev?.nodeCount ?? 0,
                    memoryUsage: prev?.memoryUsage,
                }))
            }
        })

        observer.observe({ entryTypes: ['measure'] })

        // Monitor memory usage if available
        if ('memory' in performance) {
            const memoryInfo = (performance as any).memory
            setMetrics(prev => ({
                renderTime: prev?.renderTime ?? 0,
                nodeCount: prev?.nodeCount ?? 0,
                memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
            }))
        }

        return () => {
            observer.disconnect()
        }
    }, [enabled])

    if (!enabled || !metrics) return null

    return (
        <div className="fixed top-4 left-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50">
            <div>Render: {metrics.renderTime?.toFixed(2)}ms</div>
            {metrics.memoryUsage && (
                <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
            )}
        </div>
    )
}