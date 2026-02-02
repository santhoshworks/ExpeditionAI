import { Metadata } from "next"
import { generateSEOMetadata } from "@/lib/seo"
import { DemoContent } from "./demo-content"

export const metadata: Metadata = generateSEOMetadata({
    title: "Try ThoughtMap Free - Interactive AI Learning Demo",
    description: "Experience AI-powered learning instantly. No signup required. Chat with GPT-4o, Claude & 8 curated AI models. See how branching conversations accelerate learning.",
    keywords: [
        "AI learning demo",
        "try AI tutor free",
        "free AI learning",
        "ThoughtMap demo",
        "interactive AI learning",
        "no signup AI tutor",
        "ChatGPT learning",
        "Claude AI tutor",
        "free online learning",
        "AI education demo",
        "learn with AI free"
    ],
    url: "/demo"
})

export default function DemoPage() {
    return <DemoContent />
}
