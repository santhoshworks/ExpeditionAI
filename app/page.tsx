import { Metadata } from "next"
import { generateSEOMetadata } from "@/lib/seo"
import { HomePageContent } from "@/components/home-page-content"

export const metadata: Metadata = generateSEOMetadata({
  title: "AI-Powered Learning Platform",
  description: "Master any topic with ThoughtMap's AI-powered learning platform. Access 300+ AI models, create branching learning paths, and learn faster with personalized quizzes and journals. Start free today.",
  keywords: [
    "AI learning platform",
    "personalized learning",
    "AI tutor",
    "branching conversations",
    "learning management system",
    "online education platform",
    "interactive learning",
    "AI-powered education",
    "knowledge mapping",
    "learning expeditions",
    "quiz generator",
    "study tools",
    "ChatGPT learning",
    "Claude AI learning",
    "Gemini learning"
  ],
  url: "/"
})

export default function LandingPage() {
  return <HomePageContent />
}
