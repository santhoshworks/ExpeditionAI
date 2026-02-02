import Link from "next/link"
import { CTAButton } from "@/components/ui/cta-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Sparkles, Network, ArrowRight, Crown } from "lucide-react"
import { TIER_CONFIGS, MODELS } from "@/lib/constants"
import { CheckoutButton } from "@/components/payment/checkout-button"
import { PublicHeader } from "@/components/layout/public-header"
import { SITE_CONFIG } from "@/lib/config"
import { generateSEOMetadata, generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo"
import { Metadata } from "next"

// Generate Product schemas for pricing tiers (for SEO rich snippets)
const pricingSchemas = [
  generateProductSchema({
    name: 'ThoughtMap Free Plan',
    description: 'AI learning platform with fast models including GPT-4o Mini and Claude Haiku',
    price: 0,
    features: TIER_CONFIGS.free.features,
  }),
  generateProductSchema({
    name: 'ThoughtMap Pro Plan',
    description: 'Premium AI learning with powerful models like GPT-4o, Claude Sonnet, and DeepSeek R1 for deeper analysis',
    price: TIER_CONFIGS.pro.price,
    features: TIER_CONFIGS.pro.features,
  }),
]

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Pricing', url: '/pricing' },
])

export const metadata: Metadata = generateSEOMetadata({
  title: "Pricing - Free Forever or Go Pro | ThoughtMap",
  description: "Start learning for free with 4 AI models. Upgrade to Pro for access to GPT-4o, Claude Sonnet, and more powerful models. Simple monthly pricing.",
  keywords: [
    "AI learning pricing",
    "educational technology pricing",
    "AI tutoring cost",
    "online learning platform pricing",
    "GPT-4 education pricing",
    "Claude AI learning",
    "Gemini AI education",
    "monthly subscription learning",
    "affordable AI education"
  ],
  url: "/pricing"
})

export default function PricingPage() {
  // Group models by tier for display
  const freeModels = MODELS.filter(m => m.tier === 'free')
  const proModels = MODELS.filter(m => m.tier === 'pro')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Structured Data for SEO */}
      {pricingSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50" />
      <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      {/* Header */}
      <PublicHeader currentPage="pricing" />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-32 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs md:text-sm font-semibold tracking-wide uppercase animate-in fade-in slide-in-from-bottom-4">
                <Sparkles className="w-4 h-4" />
                <span>Simple Pricing</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                Start free. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                  Upgrade when ready.
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                Learn with 4 powerful AI models completely free. Unlock premium models like GPT-4o and Claude Sonnet when you need deeper analysis.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
              {/* Free Tier */}
              <Card className="bg-white border-slate-200 shadow-xl group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-500"></div>
                <CardHeader className="p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span>Free</span>
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-lg">Everything you need to start learning</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <div className="space-y-2">
                    <div className="text-5xl font-bold text-slate-900">
                      $0
                    </div>
                    <p className="text-slate-500 font-medium">Forever free</p>
                  </div>

                  <ul className="space-y-4">
                    {TIER_CONFIGS.free.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-slate-600" />
                        </div>
                        <span className="text-slate-600 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Included Models:</p>
                    <div className="flex flex-wrap gap-2">
                      {freeModels.map(model => (
                        <span key={model.id} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium border border-slate-200">
                          {model.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link href="/signup" className="block">
                    <CTAButton variant="secondary" size="lg" className="w-full">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </CTAButton>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro Tier */}
              <Card className="bg-white border-indigo-200 shadow-2xl group hover:shadow-3xl transition-all duration-500 relative scale-[1.02] z-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-t-lg"></div>
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg whitespace-nowrap">
                    <Crown className="h-4 w-4 fill-white" />
                    50% OFF Launch Sale
                  </div>
                </div>
                <CardHeader className="p-8 pt-12">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span>Pro</span>
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-lg">Unlock the most powerful AI models</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-slate-900">
                        ${TIER_CONFIGS.pro.price}
                      </span>
                      <span className="text-2xl text-slate-400 line-through">
                        ${TIER_CONFIGS.pro.originalPrice}
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium">per month</p>
                  </div>

                  <ul className="space-y-4">
                    {TIER_CONFIGS.pro.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-indigo-600" />
                        </div>
                        <span className="text-slate-600 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Premium Models Unlocked:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {proModels.map(model => (
                        <span key={model.id} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium border border-indigo-100 flex items-center gap-1">
                          {model.name}
                          {model.badge === 'Premium' && <Sparkles className="h-3 w-3" />}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">+ all free models</p>
                  </div>

                  <CheckoutButton variant="primary" size="lg" className="w-full">
                    Upgrade to Pro
                    <Sparkles className="ml-2 w-5 h-5" />
                  </CheckoutButton>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Model Comparison Table */}
        <section className="py-32 bg-slate-50 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Model Comparison</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">The right model for every question</h3>
              <p className="text-slate-500 text-lg">We've handpicked the best models from OpenAI, Anthropic, Google, and DeepSeek so you don't have to choose from hundreds.</p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left py-6 px-6 text-slate-900 font-bold">Model</th>
                        <th className="text-center py-6 px-4 text-slate-900 font-bold">Provider</th>
                        <th className="text-center py-6 px-4 text-slate-900 font-bold">Speed</th>
                        <th className="text-center py-6 px-4 text-slate-900 font-bold">Tier</th>
                        <th className="text-left py-6 px-6 text-slate-900 font-bold">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODELS.map((model, index) => (
                        <tr key={model.id} className={`border-b border-slate-50 hover:bg-slate-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25/50'}`}>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-900">{model.name}</span>
                              {model.recommended && (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium border border-blue-100">
                                  Default
                                </span>
                              )}
                              {model.badge === 'Premium' && (
                                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium border border-indigo-100">
                                  Premium
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-5 px-4 text-slate-600">
                            {model.provider}
                          </td>
                          <td className="text-center py-5 px-4">
                            <div className="flex justify-center">
                              {model.speed === 'Very Fast' && (
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                                  Very Fast
                                </span>
                              )}
                              {model.speed === 'Fast' && (
                                <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full font-medium">
                                  Fast
                                </span>
                              )}
                              {model.speed === 'Medium' && (
                                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full font-medium">
                                  Medium
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-5 px-4">
                            {model.tier === 'free' ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                Free
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                Pro
                              </span>
                            )}
                          </td>
                          <td className="py-5 px-6 text-slate-500">
                            {model.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">All Plans Include</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Powerful learning features</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Network className="w-8 h-8 text-indigo-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Branching Trails</h4>
                <p className="text-slate-500">Explore tangents without losing context. Create a visual map of your learning journey.</p>
              </div>
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-violet-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">AI Quizzes</h4>
                <p className="text-slate-500">Test your understanding with auto-generated quizzes based on your conversations.</p>
              </div>
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-fuchsia-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-fuchsia-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Flashcards</h4>
                <p className="text-slate-500">Reinforce learning with AI-generated flashcards for spaced repetition.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-slate-50 relative">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-10 relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                Ready to learn <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">smarter</span>?
              </h2>
              <p className="text-xl md:text-2xl text-slate-500 font-medium">
                Join thousands of learners exploring knowledge through AI-powered conversations.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
                <Link href="/signup">
                  <CTAButton variant="primary" size="xl" className="px-12">
                    Start Free Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </CTAButton>
                </Link>
                <p className="text-slate-400 font-medium text-sm">No credit card required</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-4 space-y-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tighter">{SITE_CONFIG.name}</span>
              </Link>
              <p className="text-slate-400 text-lg leading-relaxed">
                The ultimate AI-powered learning platform for curious minds, students, and lifelong learners.
              </p>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Platform</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><Link href="/" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Resources</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-6">
              <h4 className="text-lg font-bold mb-4">Questions?</h4>
              <p className="text-slate-400 text-sm">Email us at support@thoughtmap.space</p>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-medium">
            <p>© 2026 {SITE_CONFIG.name} Technologies Inc. Crafted for deep learners.</p>
            <div className="flex gap-8">
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
