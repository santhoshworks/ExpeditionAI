import { Metadata } from "next"
import { generateSEOMetadata, generateFAQSchema } from "@/lib/seo"
import { FAQContent, FAQ_DATA } from "./faq-content"

export const metadata: Metadata = generateSEOMetadata({
    title: "FAQ - Frequently Asked Questions",
    description: "Get answers to common questions about ThoughtMap. Learn how expeditions work, which AI models are available, how to use your own API keys, and more.",
    keywords: [
        "ThoughtMap FAQ",
        "AI learning help",
        "how to use ThoughtMap",
        "learning platform questions",
        "expedition learning",
        "AI tutoring FAQ",
        "BYOK API keys",
        "learning journal export",
        "branching conversations help"
    ],
    url: "/faq"
})

export default function FAQPage() {
    // Generate FAQ Schema for rich snippets in Google
    const faqSchema = generateFAQSchema(FAQ_DATA)

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <FAQContent />
        </>
    )
}
