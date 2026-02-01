import { Metadata } from "next"
import { generateSEOMetadata, generateBreadcrumbSchema } from "@/lib/seo"
import { getAllTermsSorted, getAllCategories } from "@/lib/glossary"
import { GlossaryContent } from "./glossary-content"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Glossary', url: '/glossary' },
])

export const metadata: Metadata = generateSEOMetadata({
    title: "Learning & AI Glossary - Educational Terms Explained",
    description: "Comprehensive glossary of learning science, AI, and educational technology terms. Understand spaced repetition, active recall, cognitive load, LLMs, and more.",
    keywords: [
        "learning glossary",
        "educational terms",
        "learning science definitions",
        "AI learning terms",
        "spaced repetition definition",
        "active recall meaning",
        "cognitive load explained",
        "study techniques glossary",
        "education terminology",
        "what is spaced repetition",
        "what is active recall",
        "learning vocabulary"
    ],
    url: "/glossary"
})

export default function GlossaryPage() {
    const terms = getAllTermsSorted()
    const categories = getAllCategories()

    // Generate DefinedTermSet schema for the glossary index
    const glossarySchema = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'ThoughtMap Learning Glossary',
        description: 'Comprehensive glossary of learning science, AI, and educational technology terms',
        url: 'https://thoughtmap.space/glossary',
        hasDefinedTerm: terms.map(term => ({
            '@type': 'DefinedTerm',
            name: term.term,
            description: term.definition,
            url: `https://thoughtmap.space/glossary/${term.slug}`,
        })),
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(glossarySchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <GlossaryContent terms={terms} categories={categories} />
        </>
    )
}
