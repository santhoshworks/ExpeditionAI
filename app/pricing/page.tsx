import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Star, Sparkles } from "lucide-react"
import { TIER_CONFIGS, MODELS } from "@/lib/constants"
import { CheckoutButton } from "@/components/payment/checkout-button"
import { PublicHeader } from "@/components/layout/public-header"

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

      <div className="container mx-auto px-6 py-12 md:py-20 pt-32">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Simple, Credit-Based Pricing</h1>
          <p className="text-lg md:text-xl text-slate-600">
            Pay only for what you use. No subscriptions required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12 md:mb-16">
          {/* Free Tier */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Free</span>
              </CardTitle>
              <CardDescription>Try the app with free models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-4xl font-bold">
                $0
                <span className="text-lg font-normal text-muted-foreground">/forever</span>
              </div>

              <ul className="space-y-3 text-sm">
                {TIER_CONFIGS.free.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Available Models:</p>
                <div className="flex flex-wrap gap-1">
                  {freeModels.map(model => (
                    <span key={model.id} className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded">
                      {model.name}
                    </span>
                  ))}
                </div>
              </div>

              <Link href="/signup" className="block">
                <Button className="w-full" variant="outline">Get Started Free</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Basic Tier */}
          <Card className="relative border-primary shadow-lg scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="h-3 w-3" /> Most Popular
              </span>
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Basic</span>
              </CardTitle>
              <CardDescription>For regular students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-4xl font-bold">
                $5
                <span className="text-lg font-normal text-muted-foreground"> = 100 credits</span>
              </div>

              <ul className="space-y-3 text-sm">
                {TIER_CONFIGS.basic.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Unlocks Models:</p>
                <div className="flex flex-wrap gap-1">
                  {basicModels.map(model => (
                    <span key={model.id} className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 rounded flex items-center gap-1">
                      {model.name}
                      {model.recommended && <Star className="h-2.5 w-2.5" />}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">+ all free models</p>
              </div>

              <CheckoutButton tier="basic" price={TIER_CONFIGS.basic.price} className="w-full">
                Get Basic - $5
              </CheckoutButton>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <span>Pro</span>
              </CardTitle>
              <CardDescription>Premium reasoning models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-4xl font-bold">
                $15
                <span className="text-lg font-normal text-muted-foreground"> = 500+ credits</span>
              </div>

              <ul className="space-y-3 text-sm">
                {TIER_CONFIGS.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Unlocks Premium Models:</p>
                <div className="flex flex-wrap gap-1">
                  {proModels.map(model => (
                    <span key={model.id} className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2 py-0.5 rounded flex items-center gap-1">
                      {model.name}
                      {model.badge === 'Premium' && <Sparkles className="h-2.5 w-2.5" />}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">+ all Basic & Free models</p>
              </div>

              <CheckoutButton tier="pro" price={TIER_CONFIGS.pro.price} variant="secondary" className="w-full">
                Get Pro - $15
              </CheckoutButton>
            </CardContent>
          </Card>
        </div>

        {/* Model Performance Comparison Table */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">Model Comparison</h2>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 md:px-4 text-sm md:text-base">Model</th>
                  <th className="text-center py-3 px-2 md:px-4 text-sm md:text-base">Speed</th>
                  <th className="text-center py-3 px-2 md:px-4 text-sm md:text-base">Quality</th>
                  <th className="text-center py-3 px-2 md:px-4 text-sm md:text-base">Cost/Trail</th>
                  <th className="text-left py-3 px-2 md:px-4 text-sm md:text-base">Best For</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((model) => (
                  <tr key={model.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2 md:px-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <span className="font-medium text-sm md:text-base">{model.name}</span>
                        <div className="flex gap-1">
                          {model.recommended && (
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Star className="h-2.5 w-2.5" /> Best
                            </span>
                          )}
                          {model.badge === 'Premium' && (
                            <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-1.5 py-0.5 rounded">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 md:px-4">
                      <span className="text-sm">
                        {model.speed === 'Very Fast' && '⚡⚡⚡⚡'}
                        {model.speed === 'Fast' && '⚡⚡⚡'}
                        {model.speed === 'Medium' && '⚡⚡'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2 md:px-4">
                      <span className="text-sm">
                        {model.tier === 'free' && '⭐⭐⭐'}
                        {model.tier === 'basic' && '⭐⭐⭐⭐'}
                        {model.tier === 'pro' && (model.id === 'openai/gpt-4o' ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐⭐')}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2 md:px-4">
                      {model.costPerTrail === 0 ? (
                        <span className="text-green-600 dark:text-green-400 font-medium text-sm">Free</span>
                      ) : (
                        <span className="text-sm">{model.costPerTrail} credits</span>
                      )}
                    </td>
                    <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-muted-foreground">
                      {model.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Calculator */}
        <div className="max-w-2xl mx-auto text-center bg-muted/50 rounded-lg p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-bold mb-4">How Credits Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
            <div>
              <p className="font-semibold mb-2">Basic ($5 = 100 credits)</p>
              <ul className="text-muted-foreground space-y-1 text-left">
                <li>~400 trails with Gemini Flash 8B</li>
                <li>~200 trails with Gemini 2.0 Flash</li>
                <li>~100 trails with GPT-4o Mini</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Pro ($15 = 500 credits)</p>
              <ul className="text-muted-foreground space-y-1 text-left">
                <li>~250 trails with Claude Haiku</li>
                <li>~166 trails with Gemini Pro</li>
                <li>~100 trails with GPT-4o</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Actual credit usage varies based on conversation length. Credits never expire.
          </p>
        </div>

        <div className="mt-8 md:mt-12 text-center text-muted-foreground">
          <p className="text-sm">Questions? Email us at support@explorerai.com</p>
        </div>
      </div>
    </div>
  )
}
