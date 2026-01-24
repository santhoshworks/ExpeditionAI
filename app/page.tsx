"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CTAButton } from "@/components/ui/cta-button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Network,
  Map as MapIcon,
  BookOpen,
  Share2,
  Sparkles,
  Brain,
  ArrowRight,
  Search,
  Cpu,
  Layers,
  FileText,
  Zap
} from "lucide-react"
import { SITE_CONFIG } from "@/lib/config"
import { EmailSubscriptionPopup } from "@/components/email-subscription-popup"
import { useAuth } from "@/hooks/use-auth"
import { PublicHeader } from "@/components/layout/public-header"

export default function LandingPage() {
  const { isLoggedIn } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50" />
      <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      {/* Navigation */}
      <PublicHeader currentPage="home" />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs md:text-sm font-semibold tracking-wide uppercase animate-in fade-in slide-in-from-bottom-4">
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen Visual Learning Platform</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                Master any topic with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                  Visual Intelligence.
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                Explorer AI transforms overwhelming information into a beautiful, interactive knowledge map. Visualize connections, deep-dive with AI, and master complex subjects in record time.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
                <Link href="/signup">
                  <CTAButton variant="primary" size="lg" className="px-10">
                    Start Your Expedition
                    <Zap className="w-5 h-5 ml-2 fill-indigo-400 text-indigo-400" />
                  </CTAButton>
                </Link>
                <Link href="/demo">
                  <CTAButton variant="secondary" size="lg" className="px-10">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Try Interactive Demo
                  </CTAButton>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-8 opacity-30">
                <span className="text-2xl font-bold tracking-tighter text-slate-400">GOOGLE</span>
                <span className="text-2xl font-bold tracking-tighter text-slate-400">MICROSOFT</span>
                <span className="text-2xl font-bold tracking-tighter text-slate-400">OPENAI</span>
                <span className="text-2xl font-bold tracking-tighter text-slate-400">META</span>
              </div>
            </div>
          </div>

          {/* Hero Video Demo */}
          <div className="container mx-auto px-6 mt-20 relative lg:mt-32" id="demo">
            <div className="relative max-w-6xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 blur-3xl rounded-[3rem] -z-10" />
              <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-white/50 dark:border-slate-800 rounded-[2.5rem] p-3 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="bg-slate-950 rounded-[1.5rem] overflow-hidden aspect-[16/10] relative border border-slate-800">
                  <video
                    src="/videos/app_demo_recording.webp"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-90 object-top"
                  />
                  {/* Overlay for professional feel */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />

                  {/* Floating UI Badges */}
                  <div className="absolute top-10 left-10 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl hidden lg:block animate-bounce-slow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">GPT-4 Omni Powered</p>
                        <p className="text-white/60 text-xs">Processing global database...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="py-32 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Engineered for Mastery</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Beyond traditional search. Dimensional learning.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
              {/* Feature 1: Knowledge Mapping */}
              <Card className="md:col-span-12 lg:col-span-8 overflow-hidden bg-slate-50 border-0 shadow-lg group hover:shadow-2xl transition-all duration-500">
                <CardContent className="h-full p-0 flex flex-col md:flex-row">
                  <div className="p-10 flex-1 flex flex-col justify-center space-y-5">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <MapIcon className="w-7 h-7" />
                    </div>
                    <h4 className="text-3xl font-bold text-slate-900 tracking-tight">Interactive Knowledge Mapping</h4>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      Visualize complex topics as a dynamic network. Every query branches into new nodes, helping you see the big picture and the deepest details simultaneously.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Spatial Memory", "Concept Clusters", "Infinite Canvas"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-indigo-100 to-slate-200 relative min-h-[300px] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Network className="w-40 h-40 text-indigo-300 animate-pulse-slow" />
                      {/* Simulation of nodes */}
                      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
                      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature 2: Smart Journaling */}
              <Card className="md:col-span-12 lg:col-span-4 bg-slate-900 text-white border-0 shadow-lg group hover:bg-slate-800 transition-all duration-500">
                <CardContent className="p-10 h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <h4 className="text-3xl font-bold tracking-tight">Automated Study Journaling</h4>
                    <p className="text-slate-400 text-lg leading-relaxed">
                      Explorer AI synthesizes your entire learning session into a structured, exportable journal. No more messy notes.
                    </p>
                  </div>
                  <div className="pt-10 flex items-center gap-4 text-indigo-400 font-bold group-hover:gap-6 transition-all">
                    Explore Journaling <ArrowRight className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              {/* Feature 3: Deep Dives */}
              <Card className="md:col-span-6 lg:col-span-4 bg-white border-slate-100 shadow-xl group hover:border-fuchsia-200 transition-all duration-500">
                <CardContent className="p-8 space-y-5">
                  <div className="w-12 h-12 bg-fuchsia-50 rounded-xl flex items-center justify-center text-fuchsia-600">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Multidimensional Dives</h4>
                  <p className="text-slate-500 leading-relaxed">
                    Switch between summaries, deep technical explanations, or analogies instantly based on your level.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 4: PDF Export */}
              <Card className="md:col-span-6 lg:col-span-4 bg-white border-slate-100 shadow-xl group hover:border-blue-200 transition-all duration-500">
                <CardContent className="p-8 space-y-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">One-Click PDF Export</h4>
                  <p className="text-slate-500 leading-relaxed">
                    Turn your knowledge maps and journals into beautiful, print-ready PDF studies for offline review.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 5: AI Insights */}
              <Card className="md:col-span-12 lg:col-span-4 bg-indigo-600 text-white border-0 shadow-xl group overflow-hidden">
                <CardContent className="p-8 space-y-5 relative">
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-md mb-6">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold">Proactive Suggestions</h4>
                    <p className="text-indigo-100 leading-relaxed">
                      AI that predicts your gaps in knowledge and suggests the most logical next step in your learning path.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -tr-10" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Methodology / How it works */}
        <section id="methodology" className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="lg:w-1/2 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-indigo-600 font-bold uppercase tracking-widest text-sm">Study Smarter</h2>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                    The Science of <br />Dimensional Learning.
                  </h3>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600 font-black text-xl">1</div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-slate-900">Plant the Seed</h4>
                      <p className="text-slate-600 leading-relaxed">Enter any topic, question, or research paper to begin your expedition.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600 font-black text-xl">2</div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-slate-900">Map the Terrain</h4>
                      <p className="text-slate-600 leading-relaxed">Our AI analyzes context and builds a spatial map of related concepts.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600 font-black text-xl">3</div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-slate-900">Digest & Internalize</h4>
                      <p className="text-slate-600 leading-relaxed">AI-guided pathways ensure you don&apos;t just read, but understand the &quot;why&quot; behind everything.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/signup">
                    <CTAButton variant="secondary" size="lg" className="px-10">
                      Begin Your Learning Journey
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </CTAButton>
                  </Link>
                </div>
              </div>

              <div className="lg:w-1/2 relative">
                <div className="relative z-10 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                  <div className="aspect-square flex items-center justify-center relative overflow-hidden rounded-[2rem] bg-indigo-50/30">
                    {/* Abstract learning brain/network graphic */}
                    <div className="relative w-full h-full p-10 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <Search className="w-10 h-10 text-indigo-600/20" />
                        <Brain className="w-20 h-20 text-indigo-600 animate-pulse" />
                        <Sparkles className="w-10 h-10 text-indigo-600/20" />
                      </div>
                      <div className="space-y-6">
                        <div className="h-4 w-3/4 bg-indigo-200/50 rounded-full" />
                        <div className="h-4 w-1/2 bg-indigo-200/50 rounded-full" />
                        <div className="h-4 w-5/6 bg-indigo-200/50 rounded-full" />
                      </div>
                    </div>
                  </div>
                  {/* Floating stats */}
                  <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Efficiency Gain</p>
                    <p className="text-4xl font-black text-indigo-600">3.5x</p>
                  </div>
                  <div className="absolute -top-6 -left-6 bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">Retention Rate</p>
                    <p className="text-4xl font-black">92%</p>
                  </div>
                </div>
                {/* Background decorative circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-100/30 rounded-full -z-10 blur-3xl animate-pulse-slow" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 relative">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-10 relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                Ready to transform the way you <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">learn</span>?
              </h2>
              <p className="text-xl md:text-2xl text-slate-500 font-medium">
                Join 10,000+ students and researchers mapping their minds with Explorer AI.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
                <Link href="/signup">
                  <CTAButton variant="primary" size="xl" className="px-12">
                    Start Your Expedition for Free
                  </CTAButton>
                </Link>
                <p className="text-slate-400 font-medium text-sm">No credit card required. Free forever limit of 50 maps.</p>
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
                The ultimate visual exploration tool for lifelong learners, students, and obsessive deep-divers.
              </p>
              <div className="flex gap-5">
                {[Share2, MapIcon, Network].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-colors">
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Platform</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Apps</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Resources</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-10">
              <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10">
                <h4 className="text-lg font-bold mb-4">Stay updated</h4>
                <p className="text-slate-400 mb-6 text-sm">Get tip and tricks on how to learn 3x faster with AI.</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="email@example.com" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:border-indigo-500" />
                  <Button className="bg-indigo-600 rounded-xl px-4">Join</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-medium">
            <p>© 2026 {SITE_CONFIG.name} Technologies Inc. Crafted for deep learners.</p>
            <div className="flex gap-8">
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Email Subscription Popup */}
      <EmailSubscriptionPopup isLoggedIn={isLoggedIn} />
    </div>
  )
}
