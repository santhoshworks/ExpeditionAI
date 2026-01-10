import { useState, useCallback } from 'react'

export interface IllustrationData {
    id: string
    query: string
    generatedAt: string
    trailTitle: string
}

export interface GenerateIllustrationResponse {
    success: boolean
    imageUrl: string
    query: string
    description: string
    creditsUsed: number
    remainingCredits: number
}

export function useIllustrations() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateIllustration = useCallback(async (
        trailId: string,
        topic: string
    ): Promise<GenerateIllustrationResponse | null> => {
        setIsGenerating(true)
        setError(null)

        try {
            const response = await fetch('/api/illustrations/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trailId, topic }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate illustration')
            }

            return data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsGenerating(false)
        }
    }, [])

    const regenerateIllustration = useCallback(async (
        trailId: string
    ): Promise<GenerateIllustrationResponse | null> => {
        setIsRegenerating(true)
        setError(null)

        try {
            const response = await fetch('/api/illustrations/regenerate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trailId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to regenerate illustration')
            }

            return data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsRegenerating(false)
        }
    }, [])

    const getIllustration = useCallback(async (
        trailId: string
    ): Promise<IllustrationData | null> => {
        setError(null)

        try {
            const response = await fetch(`/api/illustrations/${trailId}`)

            if (response.status === 404) {
                return null // No illustration exists
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get illustration')
            }

            return data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        }
    }, [])

    return {
        generateIllustration,
        regenerateIllustration,
        getIllustration,
        isGenerating,
        isRegenerating,
        error,
    }
}