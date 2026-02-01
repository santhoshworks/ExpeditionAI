import { Metadata } from "next"
import { generateSEOMetadata, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo"
import { FAQContent } from "./faq-content"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'FAQ', url: '/faq' },
])

// Define FAQ data at the top level to avoid serialization issues
const FAQ_DATA = [
    {
        question: "What is an Expedition?",
        answer: "An expedition is a structured learning journey dedicated to a single main topic. It acts as a container for all your trails, messages, and visualizations related to that subject."
    },
    {
        question: "How do Trails work?",
        answer: "Trails are separate conversation branches. When you're learning about a topic and see a sub-concept you want to dive deeper into, you can highlight it to 'Explore' and start a new Trail. This keeps your main conversation organized while allowing for deep dives."
    },
    {
        question: "Which AI models can I use?",
        answer: "ThoughtMap integrates with OpenRouter, giving you access to over 300 models including Claude 3.5, GPT-4o, Llama 3, and more. Depending on your plan, you can switch between models mid-expedition."
    },
    {
        question: "What is the Learning Journal?",
        answer: "The Journal is an AI-generated summary of everything you've learned during your expedition. It synthesizes information from all your active trails into a clean, exportable document."
    },
    {
        question: "How do I use my own API keys (BYOK)?",
        answer: "On our BYOK or Pro plans, you can enter your own OpenRouter API key in the Settings. This allows you to pay only for the tokens you use directly to the provider."
    },
    {
        question: "Can I export my data?",
        answer: "Yes! You can export your Learning Journal as PDF or Markdown. We are also working on features to export your expedition map as an image."
    }
]

export const metadata: Metadata = generateSEOMetadata({
    title: "FAQ - Common Questions About ThoughtMap AI Learning",
    description: "Get answers about ThoughtMap: how expeditions work, available AI models, API keys, data export, and pricing. Everything you need to know.",
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <FAQContent faqData={FAQ_DATA} />
        </>
    )
}
