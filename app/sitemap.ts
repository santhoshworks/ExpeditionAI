import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/content/blog'
import { GLOSSARY_TERMS } from '@/lib/glossary'
import { LEARNING_TOPICS } from '@/lib/topics'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://thoughtmap.space'
    const currentDate = new Date().toISOString()

    // Get all blog posts
    const blogPosts = getAllBlogPosts()

    // Core static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/demo`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: currentDate,
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: currentDate,
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
    ]

    // Feature landing pages
    const featurePages = [
        {
            url: `${baseUrl}/features/ai-quiz`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/journals`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/features/trail-branching`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
    ]

    // Audience pages
    const audiencePages = [
        {
            url: `${baseUrl}/for-students`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/for-researchers`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
    ]

    // Resource hub pages
    const resourcePages = [
        {
            url: `${baseUrl}/resources`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/resources/study-schedule-template`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${baseUrl}/resources/note-taking-template`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${baseUrl}/resources/exam-prep-checklist`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
    ]

    // Learn topic pages (programmatic SEO)
    const learnPages = [
        {
            url: `${baseUrl}/learn`,
            lastModified: currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        ...LEARNING_TOPICS.map((topic) => ({
            url: `${baseUrl}/learn/${topic.slug}`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        })),
    ]

    // Glossary pages
    const glossaryPages = [
        {
            url: `${baseUrl}/glossary`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        ...GLOSSARY_TERMS.map((term) => ({
            url: `${baseUrl}/glossary/${term.slug}`,
            lastModified: currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        })),
    ]

    // Blog post pages
    const blogPages = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.date,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    return [
        ...staticPages,
        ...featurePages,
        ...audiencePages,
        ...resourcePages,
        ...learnPages,
        ...glossaryPages,
        ...blogPages,
    ]
}