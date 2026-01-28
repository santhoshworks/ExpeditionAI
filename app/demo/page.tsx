import { Metadata } from "next"
import { generateSEOMetadata } from "@/lib/seo"
import { DemoContent } from "./demo-content"

export const metadata: Metadata = generateSEOMetadata({
    title: "Try ThoughtMap Free - AI Learning Demo",
    description: "Experience AI-powered learning with no signup required. Try ThoughtMap's interactive learning platform with 300+ AI models including ChatGPT, Claude, and Llama. Start your free demo now.",
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
