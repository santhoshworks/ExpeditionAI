import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CTAButton } from "@/components/ui/cta-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Star, Sparkles, Network, ArrowRight } from "lucide-react"
import { TIER_CONFIGS, MODELS } from "@/lib/constants"
import { CheckoutButton } from "@/components/payment/checkout-button"
import { PublicHeader } from "@/components/layout/public-header"
import { SITE_CONFIG } from "@/lib/config"
import { generateSEOMetadata } from "@/lib/seo"
import { Metadata } from "next"

export const metadata: Metadata = generateSEOMetadata({
  title: "Pricing - AI Learning Platform",
  description: "Simple credit-based pricing for AI-powered learning. Start free with 4 AI models, upgrade to access 300+ models including GPT-4, Claude, and Gemini. No subscriptions, pay only for what you use.",
  keywords: [
    "AI learning pricing",
    "educational technology pricing",
    "AI tutoring cost",
    "online learning platform pricing",
    "GPT-4 education pricing",
    "Claude AI learning",
    "Gemini AI education",
    "credit-based pricing",
    "no subscription learning",
    "affordable AI education"
  ],
  url: "/pricing"
})

export default function PricingPage() {
  // Group models by tier for display
  const freeModels = MODELS.filter(m => m.tier === 'free')
  const basicModels = MODELS.filter(m => m.tier === 'basic')
  const proModels = MODELS.filter(m => m.tier === 'pro')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
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
                <span>Simple Credit-Based Pricing</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                Pay only for what you <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                  actually use.
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                No subscriptions, no monthly fees. Buy credits once and use them forever. Start free with 4 AI models, upgrade when you need more power.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Choose Your Plan</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Start free, upgrade when ready</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
              {/* Free Tier */}
              <Card className="bg-white border-slate-100 shadow-xl group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                <CardHeader className="p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span>Free</span>
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-lg">Perfect for trying out the platform</CardDescription>
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
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-slate-600 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Available Models:</p>
                    <div className="flex flex-wrap gap-2">
                      {freeModels.map(model => (
                        <span key={model.id} className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium border border-green-100">
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

              {/* Basic Tier */}
              <Card className="bg-white border-indigo-200 shadow-2xl group hover:shadow-3xl transition-all duration-500 relative overflow-hidden scale-105 z-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-600"></div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold px-6 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <Star className="h-4 w-4 fill-white" />
                    Most Popular
                  </div>
                </div>
                <CardHeader className="p-8 pt-12">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span>Basic</span>
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-lg">Great for regular students</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <div className="space-y-2">
                    <div className="text-5xl font-bold text-slate-900">
                      $5
                    </div>
                    <p className="text-slate-500 font-medium">100 credits • One-time purchase</p>
                  </div>

                  <ul className="space-y-4">
                    {TIER_CONFIGS.basic.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-indigo-600" />
                        </div>
                        <span className="text-slate-600 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Unlocks Models:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {basicModels.map(model => (
                        <span key={model.id} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium border border-indigo-100 flex items-center gap-1">
                          {model.name}
                          {model.recommended && <Star className="h-3 w-3 fill-indigo-600" />}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">+ all free models</p>
                  </div>

                  <CheckoutButton tier="basic" price={TIER_CONFIGS.basic.price} variant="primary" size="lg" className="w-full">
                    Get Basic - $5
                    <Zap className="ml-2 w-5 h-5 fill-indigo-400 text-indigo-400" />
                  </CheckoutButton>
                </CardContent>
              </Card>

              {/* Pro Tier */}
              <Card className="bg-white border-slate-100 shadow-xl group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                <CardHeader className="p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span>Pro</span>
                  </CardTitle>
                  <CardDescription className="text-slate-500 text-lg">Premium reasoning models</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <div className="space-y-2">
                    <div className="text-5xl font-bold text-slate-900">
                      $15
                    </div>
                    <p className="text-slate-500 font-medium">500+ credits • One-time purchase</p>
                  </div>

                  <ul className="space-y-4">
                    {TIER_CONFIGS.pro.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-orange-600" />
                        </div>
                        <span className="text-slate-600 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Unlocks Premium Models:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {proModels.map(model => (
                        <span key={model.id} className="text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full font-medium border border-orange-100 flex items-center gap-1">
                          {model.name}
                          {model.badge === 'Premium' && <Sparkles className="h-3 w-3 fill-orange-600" />}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">+ all Basic & Free models</p>
                  </div>

                  <CheckoutButton tier="pro" price={TIER_CONFIGS.pro.price} variant="secondary" size="lg" className="w-full">
                    Get Pro - $15
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </CheckoutButton>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Model Performance Comparison Table */}
        <section className="py-32 bg-slate-50 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Model Comparison</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Choose the right AI for your needs</h3>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left py-6 px-6 text-slate-900 font-bold">Model</th>
                        <th className="text-center py-6 px-4 text-slate-900 font-bold">Speed</th>
                        <th className="text-center py-6 px-4 text-slate-900 font-bold">Quality</th>
                        <th className="text-center py-6 px-4 text-slate-900 font-bold">Cost/Trail</th>
                        <th className="text-left py-6 px-6 text-slate-900 font-bold">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODELS.map((model, index) => (
                        <tr key={model.id} className={`border-b border-slate-50 hover:bg-slate-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25/50'}`}>
                          <td className="py-6 px-6">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-slate-900">{model.name}</span>
                                <div className="flex gap-1">
                                  {model.recommended && (
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1 font-medium border border-blue-100">
                                      <Star className="h-3 w-3 fill-blue-600" /> Best
                                    </span>
                                  )}
                                  {model.badge === 'Premium' && (
                                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full font-medium border border-orange-100">
                                      Premium
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-6 px-4">
                            <div className="flex justify-center">
                              {model.speed === 'Very Fast' && (
                                <div className="flex gap-0.5">
                                  {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  ))}
                                </div>
                              )}
                              {model.speed === 'Fast' && (
                                <div className="flex gap-0.5">
                                  {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                  ))}
                                </div>
                              )}
                              {model.speed === 'Medium' && (
                                <div className="flex gap-0.5">
                                  {[...Array(2)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-6 px-4">
                            <div className="flex justify-center">
                              {model.tier === 'free' && (
                                <div className="flex gap-0.5">
                                  {[...Array(3)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  ))}
                                </div>
                              )}
                              {model.tier === 'basic' && (
                                <div className="flex gap-0.5">
                                  {[...Array(4)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  ))}
                                </div>
                              )}
                              {model.tier === 'pro' && (
                                <div className="flex gap-0.5">
                                  {[...Array(model.id === 'openai/gpt-4o' ? 5 : 4)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-6 px-4">
                            {model.costPerTrail === 0 ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                                Free
                              </span>
                            ) : (
                              <span className="text-slate-600 font-medium">{model.costPerTrail} credits</span>
                            )}
                          </td>
                          <td className="py-6 px-6 text-slate-500 leading-relaxed">
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

        {/* Credit Calculator */}
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Credit Calculator</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">How credits work</h3>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">Basic ($5 = 100 credits)</h4>
                        <p className="text-slate-500">Perfect for regular use</p>
                      </div>
                    </div>
                    <ul className="space-y-3 text-slate-600">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        <span>~400 trails with Gemini Flash 8B</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        <span>~200 trails with Gemini 2.0 Flash</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        <span>~100 trails with GPT-4o Mini</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">Pro ($15 = 500 credits)</h4>
                        <p className="text-slate-500">For power users</p>
                      </div>
                    </div>
                    <ul className="space-y-3 text-slate-600">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>~250 trails with Claude Haiku</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>~166 trails with Gemini Pro</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>~100 trails with GPT-4o</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-200 text-center">
                  <p className="text-slate-500 leading-relaxed">
                    Actual credit usage varies based on conversation length. <span className="font-semibold text-slate-700">Credits never expire.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-slate-50 relative">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-10 relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                Ready to start your <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">learning journey</span>?
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
                <p className="text-slate-400 font-medium text-sm">No credit card required • 4 AI models free forever</p>
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
