import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Analytics } from "@vercel/analytics/next"
import { TierOverrideIndicator } from "@/components/tier-override-indicator"
import { generateSEOMetadata, generateOrganizationSchema, generateWebsiteSchema, generateEducationalOrganizationSchema, generateSoftwareApplicationSchema } from "@/lib/seo"

const GA_TRACKING_ID = "G-40PVVDWDLR"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = generateSEOMetadata({
  title: "AI-Powered Learning Platform",
  description: "Master any topic with AI-powered branching conversations. Create learning expeditions, explore trails, and test knowledge with personalized quizzes. 300+ AI models available.",
  keywords: [
    "AI learning platform",
    "educational technology",
    "personalized learning",
    "AI tutoring",
    "online education",
    "study tools",
    "knowledge mapping",
    "branching conversations",
    "interactive learning",
    "adaptive learning",
    "educational AI",
    "learning analytics",
    "student engagement",
    "AI models",
    "GPT-4",
    "Claude",
    "Gemini"
  ]
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Prevent viewport from shrinking when keyboard appears on iOS
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Generate structured data
  const organizationSchema = generateOrganizationSchema()
  const websiteSchema = generateWebsiteSchema()
  const educationalOrgSchema = generateEducationalOrganizationSchema()
  const softwareAppSchema = generateSoftwareApplicationSchema()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(educationalOrgSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareAppSchema),
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('explorer-ai-theme') || 'light';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `}
        </Script>

        <Providers>{children}</Providers>
        <TierOverrideIndicator />
        <Analytics />
      </body>
    </html>
  )
}
