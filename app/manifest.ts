import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ThoughtMap - AI-Powered Learning Platform',
        short_name: 'ThoughtMap',
        description: 'Master any topic with AI-powered branching conversations. Create learning expeditions, explore trails, and test knowledge with personalized quizzes.',
        start_url: '/',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#4f46e5',
        icons: [
            {
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/favicon.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
                purpose: 'maskable',
            },
            {
                src: '/favicon.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
        ],
        categories: ['education', 'productivity', 'utilities'],
        lang: 'en',
        orientation: 'portrait-primary',
        scope: '/',
    }
}