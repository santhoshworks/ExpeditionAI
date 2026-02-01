import { Metadata } from "next"
import { generateSEOMetadata, generateOrganizationSchema, generateWebsiteSchema, generateSoftwareApplicationSchema, generateEducationalOrganizationSchema } from "@/lib/seo"
import { HomePageContent } from "@/components/home-page-content"

// Generate all homepage schemas
const organizationSchema = generateOrganizationSchema()
const websiteSchema = generateWebsiteSchema()
const softwareAppSchema = generateSoftwareApplicationSchema()
const educationalOrgSchema = generateEducationalOrganizationSchema()

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
  return (
    <>
      {/* Structured Data for SEO - SoftwareApplication, Organization, Website schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrgSchema) }}
      />
      <HomePageContent />
    </>
  )
}
