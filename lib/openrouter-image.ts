// OpenRouter-based image generation using text models to create detailed prompts
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

export interface ImageGenerationResult {
    imageUrl: string
    prompt: string
    description: string
}

/**
 * Generate an illustration using OpenRouter's text models to create detailed prompts
 * and then generate SVG-based illustrations
 */
export async function generateIllustrationWithOpenRouter(
    topic: string,
    userApiKey?: string
): Promise<ImageGenerationResult> {
    try {
        // Use the user's API key if provided, otherwise use the system key
        const client = userApiKey
            ? createOpenRouter({ apiKey: userApiKey })
            : openrouter

        // Generate a detailed visual description using AI
        const { text: visualDescription } = await generateText({
            model: client('google/gemini-2.0-flash-exp:free'), // Use free model for prompt generation
            prompt: `Create a detailed visual description for an educational illustration about: "${topic}"

Please provide:
1. A clear, detailed description of the main visual elements
2. Color palette suggestions (specific colors)
3. Composition and layout details
4. Style notes (minimalist, modern, etc.)

The illustration should be:
- Educational and professional
- Clear and easy to understand
- Suitable for learning content
- Visually appealing but not cluttered

Format your response as a structured description that could be used to create an illustration.`,
        })

        // Generate the actual image prompt for external services
        const { text: imagePrompt } = await generateText({
            model: client('google/gemini-2.0-flash-exp:free'),
            prompt: `Based on this visual description: "${visualDescription}"

Create a concise, optimized prompt for AI image generation that captures the key visual elements. The prompt should be:
- Clear and specific
- Include style directions
- Mention colors and composition
- Be under 200 characters
- Suitable for text-to-image AI models

Return only the optimized prompt, nothing else.`,
        })

        // Generate an enhanced SVG illustration based on the AI description
        const svgImage = generateEnhancedSVG(topic, visualDescription)

        return {
            imageUrl: svgImage,
            prompt: imagePrompt.trim(),
            description: visualDescription,
        }

    } catch (error) {
        console.error('OpenRouter image generation failed:', error)

        // Fallback to basic SVG
        const fallbackPrompt = `Educational illustration representing: ${topic}`
        return {
            imageUrl: generateBasicSVG(topic),
            prompt: fallbackPrompt,
            description: `A simple educational illustration about ${topic}`,
        }
    }
}

/**
 * Generate an enhanced SVG based on AI-generated visual description
 */
function generateEnhancedSVG(topic: string, description: string): string {
    // Extract key elements from the description for SVG generation
    const hasCircle = description.toLowerCase().includes('circle') || description.toLowerCase().includes('round')
    const hasSquare = description.toLowerCase().includes('square') || description.toLowerCase().includes('rectangle')
    const hasArrow = description.toLowerCase().includes('arrow') || description.toLowerCase().includes('flow')

    // Extract colors mentioned in description
    const colorMatches = description.match(/(blue|red|green|yellow|orange|purple|pink|teal|indigo|gray|grey)/gi)
    const primaryColor = colorMatches?.[0]?.toLowerCase() || 'blue'

    const colorMap: Record<string, string> = {
        blue: '#3b82f6',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        orange: '#f97316',
        purple: '#8b5cf6',
        pink: '#ec4899',
        teal: '#14b8a6',
        indigo: '#6366f1',
        gray: '#6b7280',
        grey: '#6b7280',
    }

    const mainColor = colorMap[primaryColor] || '#3b82f6'
    const lightColor = mainColor + '20' // Add transparency
    const darkColor = mainColor.replace('#', '#').slice(0, 7) + 'CC' // Darker variant

    let shapes = ''

    // Add shapes based on description
    if (hasCircle) {
        shapes += `<circle cx="150" cy="100" r="30" fill="${lightColor}" stroke="${mainColor}" stroke-width="2"/>`
    }

    if (hasSquare) {
        shapes += `<rect x="250" y="80" width="60" height="40" rx="8" fill="${lightColor}" stroke="${mainColor}" stroke-width="2"/>`
    }

    if (hasArrow) {
        shapes += `<path d="M 180 100 L 240 100 M 235 95 L 240 100 L 235 105" stroke="${mainColor}" stroke-width="2" fill="none"/>`
    }

    // Add some default geometric elements if no specific shapes mentioned
    if (!hasCircle && !hasSquare && !hasArrow) {
        shapes = `
      <circle cx="120" cy="80" r="25" fill="${lightColor}" stroke="${mainColor}" stroke-width="2"/>
      <rect x="200" y="60" width="80" height="40" rx="8" fill="${lightColor}" stroke="${mainColor}" stroke-width="2"/>
      <path d="M 145 80 L 200 80 M 195 75 L 200 80 L 195 85" stroke="${mainColor}" stroke-width="2" fill="none"/>
    `
    }

    const svg = `
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="${mainColor}" flood-opacity="0.2"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Main shapes -->
      <g filter="url(#shadow)">
        ${shapes}
      </g>
      
      <!-- Title -->
      <text x="200" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="${darkColor}">
        ${topic.length > 40 ? topic.substring(0, 40) + '...' : topic}
      </text>
      
      <!-- Subtitle -->
      <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#64748b">
        AI-Generated Illustration
      </text>
    </svg>
  `

    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * Generate a basic SVG fallback
 */
function generateBasicSVG(topic: string): string {
    const svg = `
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="200" cy="80" r="30" fill="#0ea5e9" opacity="0.3"/>
      <rect x="170" y="110" width="60" height="30" rx="6" fill="#0ea5e9" opacity="0.2"/>
      
      <text x="200" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="500" fill="#0369a1">
        ${topic.length > 35 ? topic.substring(0, 35) + '...' : topic}
      </text>
      <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#0284c7">
        Educational Illustration
      </text>
    </svg>
  `

    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * Get user's OpenRouter API key from their profile
 */
export async function getUserOpenRouterKey(userId: string): Promise<string | null> {
    try {
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('profiles')
            .select('openrouter_api_key')
            .eq('id', userId)
            .single()

        // Type assertion for profile data
        const profileData = data as { openrouter_api_key: string | null } | null
        if (error || !profileData?.openrouter_api_key) {
            return null
        }

        return profileData.openrouter_api_key
    } catch (error) {
        console.error('Failed to get user OpenRouter key:', error)
        return null
    }
}