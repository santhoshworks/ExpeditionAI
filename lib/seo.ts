import { Metadata } from 'next'
import { SITE_CONFIG } from './config'

interface SEOProps {
    title?: string
    description?: string
    keywords?: string[]
    image?: string
    url?: string
    type?: 'website' | 'article'
    publishedTime?: string
    modifiedTime?: string
    authors?: string[]
    section?: string
    tags?: string[]
}

export function generateSEOMetadata({
    title,
    description,
    keywords = [],
    image = '/images/hero_visualization.png',
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
    section,
    tags = []
}: SEOProps = {}): Metadata {
    const siteTitle = title ? `${title} | ${SITE_CONFIG.name}` : `${SITE_CONFIG.name} - AI-Powered Learning Platform`
    const siteDescription = description || 'Master any topic with AI-powered branching conversations. Create learning expeditions, explore trails, and test knowledge with personalized quizzes. 300+ AI models available.'
    const siteUrl = url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url
    const imageUrl = image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`

    // Combine default keywords with page-specific ones
    const defaultKeywords = [
        'AI learning platform',
        'educational technology',
        'personalized learning',
        'AI tutoring',
        'online education',
        'learning management system',
        'study tools',
        'knowledge mapping',
        'branching conversations',
        'AI-powered education',
        'interactive learning',
        'adaptive learning',
        'educational AI',
        'learning analytics',
        'student engagement'
    ]

    const allKeywords = [...defaultKeywords, ...keywords].join(', ')

    const metadata: Metadata = {
        title: siteTitle,
        description: siteDescription,
        keywords: allKeywords,
        authors: authors ? authors.map(name => ({ name })) : [{ name: 'ThoughtMap Team' }],
        creator: 'ThoughtMap',
        publisher: 'ThoughtMap',
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: siteUrl,
        },
        openGraph: {
            type,
            locale: 'en_US',
            url: siteUrl,
            title: siteTitle,
            description: siteDescription,
            siteName: SITE_CONFIG.name,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title || 'ThoughtMap - AI-Powered Learning Platform',
                },
            ],
            ...(type === 'article' && {
                publishedTime,
                modifiedTime,
                authors,
                section,
                tags,
            }),
        },
        twitter: {
            card: 'summary_large_image',
            title: siteTitle,
            description: siteDescription,
            images: [imageUrl],
            creator: '@thoughtmap',
            site: '@thoughtmap',
        },
        verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
            yandex: process.env.YANDEX_VERIFICATION,
            yahoo: process.env.YAHOO_VERIFICATION,
        },
        category: 'Education',
    }

    return metadata
}

// Schema.org structured data generators
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: `${SITE_CONFIG.url}/favicon.svg`,
        description: 'AI-powered learning platform for personalized education and knowledge exploration',
        sameAs: [
            // Add social media URLs when available
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'support@thoughtmap.space',
        },
    }
}

export function generateWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: 'AI-powered learning platform for personalized education',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    }
}

export function generateEducationalOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: 'AI-powered learning platform offering personalized education through branching conversations',
        educationalCredentialAwarded: 'Learning Certificates',
        hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            name: 'AI-Assisted Learning Completion',
        },
    }
}

export function generateSoftwareApplicationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE_CONFIG.name,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web Browser',
        url: SITE_CONFIG.url,
        description: 'AI-powered learning platform with branching conversations and personalized quizzes',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '150',
            bestRating: '5',
            worstRating: '1',
        },
        featureList: [
            'AI-powered conversations',
            'Branching learning trails',
            'Personalized quizzes',
            '300+ AI models',
            'Learning analytics',
            'Progress tracking',
        ],
    }
}

export function generateCourseSchema(title: string, description: string, url: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: title,
        description,
        url,
        provider: {
            '@type': 'Organization',
            name: SITE_CONFIG.name,
            url: SITE_CONFIG.url,
        },
        educationalLevel: 'All Levels',
        teaches: description,
        courseMode: 'online',
        isAccessibleForFree: true,
    }
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }
}