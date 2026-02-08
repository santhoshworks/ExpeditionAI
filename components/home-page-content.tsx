"use client"

import Link from "next/link"
import Image from "next/image"
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
  Cpu,
  Layers,
  Zap,
  Heart,
  HelpCircle,
  FileText,
  Target,
  Lightbulb,
  GraduationCap,
  UserCheck
} from "lucide-react"
import { SITE_CONFIG } from "@/lib/config"
import { EmailSubscriptionPopup } from "@/components/email-subscription-popup"
import { useAuth } from "@/hooks/use-auth"
import { PublicHeader } from "@/components/layout/public-header"

export function HomePageContent() {
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
                <span>AI-Powered Learning Platform</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] md:leading-[1.05]">
                Master any topic with{" "}
                <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                  AI-Powered Learning
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                Learn any subject by chatting with AI. Unlike endless Google searches, our platform keeps your learning organized in a visual map. Access 8 curated AI models from OpenAI, Anthropic, Google, and DeepSeek—switch anytime to find the best explanation.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
                <Link href="/signup" aria-label="Start your free AI learning expedition">
                  <CTAButton variant="primary" size="lg" className="px-10">
                    Start Your Expedition
                    <Zap className="w-5 h-5 ml-2 fill-indigo-400 text-indigo-400" />
                  </CTAButton>
                </Link>
                {/* <Link href="/demo" aria-label="Try interactive AI learning demo">
                  <CTAButton variant="secondary" size="lg" className="px-10">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Try Interactive Demo
                  </CTAButton>
                </Link> */}
              </div>
            </div>
          </div>

          {/* Hero Screenshot */}
          <div className="container mx-auto px-6 mt-20 relative lg:mt-32" id="demo">
            <div className="relative max-w-6xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 blur-3xl rounded-[3rem] -z-10" />
              <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-white/50 dark:border-slate-800 rounded-[2.5rem] p-3 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="bg-slate-950 rounded-[1.5rem] overflow-hidden aspect-[16/10] relative border border-slate-800">
                  <video
                    src="/videos/demo.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-90 object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="py-32 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Powerful Features</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Everything you need to learn faster.</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
              {/* Feature 1: Branching Trails */}
              <Card className="md:col-span-12 lg:col-span-8 overflow-hidden bg-slate-50 border-0 shadow-lg group hover:shadow-2xl transition-all duration-500">
                <CardContent className="h-full p-0 flex flex-col md:flex-row">
                  <div className="p-10 flex-1 flex flex-col justify-center space-y-5">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <MapIcon className="w-7 h-7" />
                    </div>
                    <h4 className="text-3xl font-bold text-slate-900 tracking-tight">Explore and Organize</h4>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      As you learn about a topic, you&apos;ll discover related concepts worth exploring. Our visual map keeps everything organized so you don't lose track of what you've learned.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Trail Branching", "Visual Tree", "Flag Progress"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-indigo-100 to-slate-200 relative min-h-[300px] overflow-hidden">
                    <Image
                      src="/images/expedition_with_trails_example.jpeg"
                      alt="Branching trail system showing connected learning paths"
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Feature 2: AI Chat Interface */}
              <Card className="md:col-span-12 lg:col-span-4 bg-slate-900 text-white border-0 shadow-lg group hover:bg-slate-800 transition-all duration-500">
                <CardContent className="p-10 h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                      <Brain className="w-7 h-7" />
                    </div>
                    <h4 className="text-3xl font-bold tracking-tight">Pick the Perfect AI</h4>
                    <p className="text-slate-400 text-lg leading-relaxed">
                      Different topics need different approaches. Switch between GPT-4o, Claude Sonnet, Gemini Flash, and DeepSeek to find the best explanation style for what you&apos;re learning.
                    </p>
                  </div>
                  <div className="pt-10 flex items-center gap-4 text-indigo-400 font-bold group-hover:gap-6 transition-all">
                    Explore Models <ArrowRight className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              {/* Feature 3: Personalized Coaching */}
              <Card className="md:col-span-6 lg:col-span-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl group hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-8 space-y-5">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold">Personalized Coaching</h4>
                  <p className="text-emerald-50 leading-relaxed">
                    Tell your AI coach why you&apos;re learning and your skill level. Get explanations tailored for interview prep, exams, research, or just curiosity.
                  </p>
                  <Link href="/features/personalized-coaching" className="inline-flex items-center gap-2 text-white/90 font-bold text-sm hover:text-white transition-colors">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>

              {/* Feature 4: AI Quizzes */}
              <Card className="md:col-span-6 lg:col-span-4 bg-white border-slate-100 shadow-xl group hover:border-fuchsia-200 transition-all duration-500">
                <CardContent className="p-8 space-y-5">
                  <div className="w-12 h-12 bg-fuchsia-50 rounded-xl flex items-center justify-center text-fuchsia-600">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Test Your Knowledge</h4>
                  <p className="text-slate-500 leading-relaxed">
                    Personalized quizzes generated from what you&apos;ve learned. Get instant feedback with detailed explanations to fill any gaps in understanding.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 6: Learning Journals */}
              <Card className="md:col-span-6 lg:col-span-4 bg-white border-slate-100 shadow-xl group hover:border-blue-200 transition-all duration-500">
                <CardContent className="p-8 space-y-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Auto-Generated Summaries</h4>
                  <p className="text-slate-500 leading-relaxed">
                    Get AI-powered summaries of everything you&apos;ve learned. Export as PDF or notes to review key insights anytime.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Features Section */}
        <section className="py-32 bg-slate-50 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Complete Learning Toolkit</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Everything you need to master any subject</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {/* Learning Wishlist */}
              <Card className="bg-white border-slate-100 shadow-xl group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-pink-100 to-rose-200">
                    <Image
                      src="/images/learning_wishlist.jpeg"
                      alt="Learning wishlist feature for saving topics to explore later"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                      <Heart className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">Learning Wishlist</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Save interesting topics you discover during conversations to explore later. Never lose track of what you want to learn next.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Save Topics", "Organize Learning", "Never Forget"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-pink-50 rounded-full text-xs font-bold text-pink-600 border border-pink-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Check Tooltip */}
              <Card className="bg-white border-slate-100 shadow-xl group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-200">
                    <Image
                      src="/images/quick_check_tooltip.jpeg"
                      alt="Quick check tooltip for instant understanding verification"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">Quick Check Tooltip</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Hover over any concept for instant clarification. Get quick definitions and explanations without interrupting your learning flow.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Instant Help", "Contextual", "Non-Disruptive"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-amber-50 rounded-full text-xs font-bold text-amber-600 border border-amber-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Journals */}
              <Card className="bg-white border-slate-100 shadow-xl group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-200">
                    <Image
                      src="/images/create_journal.jpeg"
                      alt="AI-generated learning journals with comprehensive summaries"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">AI Learning Journals</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Automatically generate comprehensive summaries of your entire learning expedition with key insights and takeaways.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Auto-Generated", "Key Insights", "Comprehensive"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-emerald-50 rounded-full text-xs font-bold text-emerald-600 border border-emerald-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Models */}
              <Card className="bg-white border-slate-100 shadow-xl group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-violet-100 to-purple-200">
                    <Image
                      src="/images/available_models.jpeg"
                      alt="8 curated AI models from OpenAI, Anthropic, Google, and DeepSeek"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">8 Curated AI Models</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Access top AI models including GPT-4o, Claude Sonnet, Gemini Flash, and DeepSeek. Each model hand-picked for quality learning.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["GPT-4", "Claude", "Gemini", "OpenRouter"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-violet-50 rounded-full text-xs font-bold text-violet-600 border border-violet-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Creating New Trails */}
              <Card className="bg-white border-slate-100 shadow-xl group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-cyan-100 to-blue-200">
                    <Image
                      src="/images/creating_new_trails.jpeg"
                      alt="Creating new learning trails from any conversation point"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
                      <Target className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">Dynamic Trail Creation</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Branch into new learning paths at any moment. Create focused trails for deep dives while maintaining your main learning thread.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["Dynamic Branching", "Deep Dives", "Focused Learning"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-cyan-50 rounded-full text-xs font-bold text-cyan-600 border border-cyan-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Topic Generation */}
              <Card className="bg-white border-slate-100 shadow-xl group hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-lime-100 to-green-200">
                    <Image
                      src="/images/GenerateTopics.jpeg"
                      alt="AI-powered topic generation for discovering new learning paths"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-lime-50 rounded-xl flex items-center justify-center text-lime-600">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">Smart Topic Discovery</h4>
                    <p className="text-slate-500 leading-relaxed">
                      AI suggests related topics and learning paths based on your current expedition, helping you discover new areas of interest.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {["AI Suggestions", "Related Topics", "Discovery"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-lime-50 rounded-full text-xs font-bold text-lime-600 border border-lime-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="py-32 bg-white relative">
          <div className="container mx-auto px-6">
            {/* Feature Showcase */}
            <section className="py-32 bg-white relative">
              <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                  <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">See It In Action</h2>
                  <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Features that make learning effortless</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900">Generate Learning Topics</h4>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        Stuck on what to explore next? AI suggests related topics and learning paths based on your current expedition, helping you discover new areas of interest.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Topic Suggestions", "AI-Powered", "Personalized"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-green-50 rounded-full text-xs font-bold text-green-600 border border-green-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="bg-slate-50 rounded-2xl p-6 shadow-xl border border-slate-100">
                      <Image
                        src="/images/generate_new_topics.jpeg"
                        alt="AI topic generation interface"
                        width={600}
                        height={400}
                        className="w-full rounded-xl shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                  <div className="relative order-2 lg:order-1">
                    <div className="bg-slate-50 rounded-2xl p-6 shadow-xl border border-slate-100">
                      <Image
                        src="/images/generate_quiz.jpeg"
                        alt="AI quiz generation interface"
                        width={600}
                        height={400}
                        className="w-full rounded-xl shadow-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-8 order-1 lg:order-2">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900">Test Your Knowledge</h4>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        Generate personalized quizzes from your conversation history. Multiple choice questions with detailed explanations help reinforce your learning.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Adaptive Quizzes", "Instant Feedback", "Progress Tracking"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-purple-50 rounded-full text-xs font-bold text-purple-600 border border-purple-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <MapIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900">Track Your Progress</h4>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        Flag trails as you explore them - mark topics as understood, need review, or want to explore further. Visual indicators help you track your learning journey.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Visual Flags", "Progress Tracking", "Learning Path"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-blue-50 rounded-full text-xs font-bold text-blue-600 border border-blue-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="bg-slate-50 rounded-2xl p-6 shadow-xl border border-slate-100">
                      <Image
                        src="/images/flags_to_track_progress.jpeg"
                        alt="Progress tracking with visual flags"
                        width={600}
                        height={400}
                        className="w-full rounded-xl shadow-lg"
                      />
                    </div>
                  </div>
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
                        The Science of <br />Branching Learning.
                      </h3>
                    </div>

                    <div className="space-y-8">
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600 font-black text-xl">1</div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold text-slate-900">Start Your Expedition</h4>
                          <p className="text-slate-600 leading-relaxed">Create a learning expedition on any topic and begin chatting with AI in your base camp trail.</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600 font-black text-xl">2</div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold text-slate-900">Branch Into New Trails</h4>
                          <p className="text-slate-600 leading-relaxed">When you discover interesting concepts, branch into new trails to explore them deeply without losing your main thread.</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-indigo-600 font-black text-xl">3</div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold text-slate-900">Test & Reinforce</h4>
                          <p className="text-slate-600 leading-relaxed">Generate quizzes from your conversations and create learning journals to solidify your understanding.</p>
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
                    <div className="relative z-10 bg-white p-6 rounded-[3rem] shadow-2xl border border-slate-100">
                      <div className="aspect-square flex items-center justify-center relative overflow-hidden rounded-[2rem] bg-indigo-50/30">
                        <Image
                          src="/images/start_new_exploration.jpeg"
                          alt="AI chat interface with branching trails"
                          fill
                          className="object-cover rounded-[2rem]"
                        />
                      </div>
        
                    </div>
                    {/* Background decorative circles */}
                
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
                    Join thousands of learners exploring knowledge through AI-powered branching conversations.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
                    <Link href="/signup">
                      <CTAButton variant="primary" size="xl" className="px-12">
                        Start Your Expedition for Free
                      </CTAButton>
                    </Link>
                    <p className="text-slate-400 font-medium text-sm">No credit card required. Free tier with 4 AI models available.</p>
                  </div>
                </div>
              </div>
            </section>
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
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Resources</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><Link href="/faq" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Tutorials</Link></li>
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
