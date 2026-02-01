import { Metadata } from "next"
import { generateSEOMetadata } from "@/lib/seo"
import { HomePageContent } from "@/components/home-page-content"

export const metadata: Metadata = generateSEOMetadata({
  title: "ThoughtMap - AI Learning Platform with 300+ Models | Learn Any Topic",
  description: "Master any subject with AI tutoring. Access GPT-4, Claude & Gemini. Visual learning maps, auto-generated quizzes & study journals. Start free today.",
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
