import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ExpeditionAI - AI-Powered Learning',
        short_name: 'ExpeditionAI',
        description: 'Master any topic with AI-powered learning expeditions. Create branching conversations, explore trails, and test knowledge with personalized quizzes and flashcards.',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#4f46e5',
        orientation: 'portrait-primary',
        scope: '/',
        icons: [
            {
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/icons/icon-72x72.png',
                sizes: '72x72',
                type: 'image/png',
            },
            {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
            },
            {
                src: '/icons/icon-128x128.png',
                sizes: '128x128',
                type: 'image/png',
            },
            {
                src: '/icons/icon-144x144.png',
                sizes: '144x144',
                type: 'image/png',
            },
            {
                src: '/icons/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
            },
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icons/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
        categories: ['education', 'productivity'],
        lang: 'en',
        shortcuts: [
            {
                name: 'New Expedition',
                short_name: 'New',
                description: 'Start a new learning expedition',
                url: '/dashboard?action=new',
            },
            {
                name: 'Continue Learning',
                short_name: 'Continue',
                description: 'Resume your most recent expedition',
                url: '/dashboard',
            },
            {
                name: 'Learning Wishlist',
                short_name: 'Wishlist',
                description: 'View your learning wishlist',
                url: '/wishlist',
            },
        ],
    }
}