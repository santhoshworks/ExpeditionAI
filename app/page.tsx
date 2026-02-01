import { Metadata } from "next"
import { generateSEOMetadata, generateOrganizationSchema, generateWebsiteSchema, generateSoftwareApplicationSchema, generateEducationalOrganizationSchema } from "@/lib/seo"
import { HomePageContent } from "@/components/home-page-content"

// Generate all homepage schemas
const organizationSchema = generateOrganizationSchema()
const websiteSchema = generateWebsiteSchema()
const softwareAppSchema = generateSoftwareApplicationSchema()
const educationalOrgSchema = generateEducationalOrganizationSchema()

export const metadata: Metadata = generateSEOMetadata({
  title: "ThoughtMap - Finally Understand Any Subject | AI Tutoring That Works",
  description: "Struggling with a subject? ThoughtMap helps you actually understand - not just memorize. Ask questions until it clicks. Learn at your pace. Start free.",
  keywords: [
    "understand difficult subjects",
    "help with studying",
    "AI tutoring",
    "learn at your own pace",
    "ask questions until it clicks",
    "struggling with school",
    "finally understand",
    "study help",
    "learning breakthrough"
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
