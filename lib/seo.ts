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

export interface CourseSchemaProps {
    name: string
    description: string
    url: string
    provider?: string
    educationalLevel?: string
    duration?: string
    skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced'
}

export function generateCourseSchema({
    name,
    description,
    url,
    provider = SITE_CONFIG.name,
    educationalLevel = 'All Levels',
    skillLevel = 'Beginner'
}: CourseSchemaProps) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name,
        description,
        url: url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`,
        provider: {
            '@type': 'Organization',
            name: provider,
            url: SITE_CONFIG.url,
        },
        educationalLevel,
        audience: {
            '@type': 'EducationalAudience',
            educationalRole: 'student',
            audienceType: skillLevel,
        },
        courseMode: 'online',
        isAccessibleForFree: true,
        teaches: description,
        hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'online',
            courseWorkload: 'Self-paced',
        },
    }
}

export function generateDefinedTermSchema(term: string, definition: string, url: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: term,
        description: definition,
        url: `${SITE_CONFIG.url}${url}`,
        inDefinedTermSet: {
            '@type': 'DefinedTermSet',
            name: 'ThoughtMap Learning Glossary',
            url: `${SITE_CONFIG.url}/glossary`,
        },
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

// Article/BlogPosting schema for blog posts
export interface ArticleSchemaProps {
    title: string
    description: string
    url: string
    datePublished: string
    dateModified?: string
    author: string
    image?: string
    keywords?: string[]
}

export function generateArticleSchema({
    title,
    description,
    url,
    datePublished,
    dateModified,
    author,
    image,
    keywords = []
}: ArticleSchemaProps) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        url: `${SITE_CONFIG.url}${url}`,
        datePublished,
        dateModified: dateModified || datePublished,
        author: {
            '@type': 'Person',
            name: author,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_CONFIG.name,
            url: SITE_CONFIG.url,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_CONFIG.url}/favicon.svg`,
            },
        },
        image: image ? (image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`) : `${SITE_CONFIG.url}/images/hero_visualization.png`,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_CONFIG.url}${url}`,
        },
        keywords: keywords.join(', '),
    }
}

// Product schema for pricing page
export interface ProductSchemaProps {
    name: string
    description: string
    price: number
    priceCurrency?: string
    features?: string[]
}

export function generateProductSchema({
    name,
    description,
    price,
    priceCurrency = 'USD',
    features = []
}: ProductSchemaProps) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        brand: {
            '@type': 'Brand',
            name: SITE_CONFIG.name,
        },
        offers: {
            '@type': 'Offer',
            price: price.toString(),
            priceCurrency,
            availability: 'https://schema.org/InStock',
            url: `${SITE_CONFIG.url}/pricing`,
        },
        ...(features.length > 0 && {
            additionalProperty: features.map(feature => ({
                '@type': 'PropertyValue',
                name: 'Feature',
                value: feature,
            })),
        }),
    }
}

// Generate multiple product offers for pricing page
export function generatePricingPageSchema(products: ProductSchemaProps[]) {
    return products.map(product => generateProductSchema(product))
}

// Breadcrumb schema for navigation
export interface BreadcrumbItem {
    name: string
    url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.url}${item.url}`,
        })),
    }
}

// HowTo schema for step-by-step guides
export interface HowToStep {
    name: string
    text: string
    image?: string
}

export interface HowToSchemaProps {
    name: string
    description: string
    url: string
    totalTime?: string // ISO 8601 duration format, e.g., "PT30M" for 30 minutes
    estimatedCost?: { currency: string; value: string }
    steps: HowToStep[]
    image?: string
}

export function generateHowToSchema({
    name,
    description,
    url,
    totalTime,
    estimatedCost,
    steps,
    image
}: HowToSchemaProps) {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        description,
        url: url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`,
        ...(totalTime && { totalTime }),
        ...(estimatedCost && {
            estimatedCost: {
                '@type': 'MonetaryAmount',
                currency: estimatedCost.currency,
                value: estimatedCost.value,
            },
        }),
        ...(image && {
            image: {
                '@type': 'ImageObject',
                url: image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`,
            },
        }),
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            ...(step.image && {
                image: {
                    '@type': 'ImageObject',
                    url: step.image.startsWith('http') ? step.image : `${SITE_CONFIG.url}${step.image}`,
                },
            }),
        })),
    }
}

// Review and AggregateRating schema for testimonials
export interface ReviewSchemaProps {
    author: string
    reviewBody: string
    ratingValue: number
    datePublished?: string
}

export function generateReviewSchema({
    author,
    reviewBody,
    ratingValue,
    datePublished = new Date().toISOString().split('T')[0]
}: ReviewSchemaProps) {
    return {
        '@type': 'Review',
        author: {
            '@type': 'Person',
            name: author,
        },
        reviewBody,
        reviewRating: {
            '@type': 'Rating',
            ratingValue: ratingValue.toString(),
            bestRating: '5',
            worstRating: '1',
        },
        datePublished,
    }
}

export interface AggregateRatingSchemaProps {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
}

export function generateTestimonialsPageSchema(
    reviews: ReviewSchemaProps[],
    aggregateRating: AggregateRatingSchemaProps
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: SITE_CONFIG.name,
        description: 'AI-powered learning platform with branching conversations and personalized quizzes',
        brand: {
            '@type': 'Brand',
            name: SITE_CONFIG.name,
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: aggregateRating.ratingValue.toString(),
            reviewCount: aggregateRating.reviewCount.toString(),
            bestRating: (aggregateRating.bestRating || 5).toString(),
            worstRating: (aggregateRating.worstRating || 1).toString(),
        },
        review: reviews.map(review => generateReviewSchema(review)),
    }
}