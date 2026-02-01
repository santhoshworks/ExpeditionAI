import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CTAButton } from "@/components/ui/cta-button"
import { Card, CardContent } from "@/components/ui/card"
import {
    GraduationCap,
    Brain,
    Clock,
    Target,
    Zap,
    BookOpen,
    CheckCircle2,
    ArrowRight,
    Network,
    Star,
    Users,
    TrendingUp,
    Lightbulb,
    FileQuestion,
    ChevronDown
} from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { SITE_CONFIG } from "@/lib/config"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import { Metadata } from "next"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'For Students', url: '/for-students' },
])

const studentFAQs = [
    {
        question: "How does ThoughtMap help me study for exams more effectively?",
        answer: "ThoughtMap uses AI-powered branching conversations to break down complex topics into digestible pieces. Instead of passively reading notes, you actively engage with the material by asking questions, exploring tangents, and building a visual map of your understanding. Our built-in quiz feature tests your knowledge with personalized questions based on what you've learned, helping you identify gaps before exam day. Research shows active learning increases retention by up to 50% compared to passive studying."
    },
    {
        question: "Is ThoughtMap suitable for all subjects and education levels?",
        answer: "Yes! ThoughtMap works with any subject from STEM fields like calculus, chemistry, and computer science to humanities subjects like history, literature, and philosophy. Whether you're a high school student preparing for AP exams, a college student tackling advanced coursework, or a graduate student diving into research topics, our AI adapts to your level and learning goals. The platform supports over 300 AI models, so you can choose the best one for your specific subject."
    },
    {
        question: "How is ThoughtMap different from ChatGPT or other AI tutors?",
        answer: "Unlike linear chat interfaces, ThoughtMap visualizes your learning journey as a branching tree. This means you can explore multiple angles of a topic without losing context, easily return to previous concepts, and see how different ideas connect. Our platform also includes built-in quiz generation, progress tracking, and the ability to export your learning trails as study notes. Plus, you get access to 300+ AI models including GPT-4, Claude, and Gemini, all in one place."
    },
    {
        question: "Can I use ThoughtMap for homework and assignments?",
        answer: "ThoughtMap is designed to help you understand concepts deeply, not just get answers. When you're stuck on homework, you can explore the underlying concepts, ask clarifying questions, and build genuine understanding. The platform helps you learn the 'why' behind problems, making you better prepared for exams and future coursework. Many students use ThoughtMap alongside their homework to master challenging material."
    },
    {
        question: "Is there a free plan for students?",
        answer: "Yes! Our free plan gives you access to 4 AI models including Gemini 2.0 Flash Lite, with 15 learning trails per day. This is perfect for trying out the platform and regular study sessions. For more intensive exam prep or access to premium models like GPT-4 and Claude, our Basic plan starts at just $5 (one-time payment, not a subscription). Students can study smarter without breaking the bank."
    }
]

const faqSchema = generateFAQSchema(studentFAQs)

export const metadata: Metadata = generateSEOMetadata({
    title: "AI Learning Platform for Students - Study Smarter",
    description: "Master any subject with AI-powered tutoring. ThoughtMap helps students prepare for exams, understand complex topics, and generate personalized quizzes. Join 10,000+ students studying smarter with branching AI conversations.",
    keywords: [
        "AI tutor for students",
        "study app for college",
        "personalized learning for exams",
        "AI homework help",
        "student study tool",
        "exam preparation app",
        "college study assistant",
        "AI learning for students",
        "quiz generator for studying",
        "active learning platform",
        "study smarter not harder",
        "AI study buddy",
        "exam prep AI",
        "homework help app"
    ],
    url: "/for-students"
})

export default function ForStudentsPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Dynamic Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50" />
            <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            {/* Header */}
            <PublicHeader currentPage="for-students" />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs md:text-sm font-semibold tracking-wide uppercase animate-in fade-in slide-in-from-bottom-4">
                                <GraduationCap className="w-4 h-4" />
                                <span>Built for Students</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                                Study smarter, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                                    not harder.
                                </span>
                            </h1>

                            <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                                Stop drowning in textbooks and lecture notes. ThoughtMap transforms how you learn with AI-powered conversations that adapt to your pace, generate quizzes on demand, and help you truly understand complex topics.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-10">
                                        Start Learning Free
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </CTAButton>
                                </Link>
                                <Link href="/demo">
                                    <CTAButton variant="outline" size="xl" className="px-10">
                                        See How It Works
                                    </CTAButton>
                                </Link>
                            </div>

                            <p className="text-sm text-slate-400 font-medium">
                                No credit card required. Free plan includes 15 trails/day.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Social Proof Stats */}
                <section className="py-16 bg-white border-y border-slate-100">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <div className="text-center space-y-2">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600">10,000+</div>
                                <div className="text-sm text-slate-500 font-medium">Students Learning</div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600">50%</div>
                                <div className="text-sm text-slate-500 font-medium">Better Retention</div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600">300+</div>
                                <div className="text-sm text-slate-500 font-medium">AI Models</div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600">4.8/5</div>
                                <div className="text-sm text-slate-500 font-medium">Student Rating</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pain Points Section */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Sound Familiar?</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">The struggles every student knows</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <Card className="bg-white border-slate-100 shadow-lg">
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">Exam Anxiety</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Finals week hits and you realize you don't actually understand half the material. Cramming feels hopeless when concepts don't click.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-slate-100 shadow-lg">
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">Complex Topics</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Some subjects just don't make sense no matter how many times you read the textbook. You need someone to explain it differently.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-slate-100 shadow-lg">
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                                        <Target className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">Time Management</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Between classes, work, and life, you need to make every study session count. No time to waste on ineffective learning methods.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Features for Students</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Everything you need to ace your classes</h3>
                            <p className="text-lg text-slate-500">
                                ThoughtMap combines AI tutoring with proven learning science to help you master any subject faster.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Feature 1: Exam Prep */}
                            <div className="group p-8 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FileQuestion className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">AI Quiz Generation</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Turn any learning trail into a personalized quiz. Test yourself on exactly what you've studied with questions that adapt to your understanding level. Identify knowledge gaps before your professor does.
                                </p>
                                <Link href="/features/trivia" className="inline-flex items-center text-indigo-600 font-semibold hover:underline">
                                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 2: Quick Learning */}
                            <div className="group p-8 bg-gradient-to-br from-violet-50 to-white rounded-2xl border border-violet-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Zap className="w-7 h-7 text-violet-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Learn Any Topic Fast</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Start with a concept and let AI guide you through it step-by-step. Ask follow-up questions, explore tangents, and build understanding at your own pace. Perfect for tackling new material before class.
                                </p>
                                <Link href="/demo" className="inline-flex items-center text-violet-600 font-semibold hover:underline">
                                    Try it now <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 3: Visual Learning */}
                            <div className="group p-8 bg-gradient-to-br from-fuchsia-50 to-white rounded-2xl border border-fuchsia-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-fuchsia-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Network className="w-7 h-7 text-fuchsia-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Visual Knowledge Maps</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    See how concepts connect with branching learning trails. Your brain remembers relationships better than isolated facts. Export your maps as study guides for exam review.
                                </p>
                                <Link href="/features/expeditions" className="inline-flex items-center text-fuchsia-600 font-semibold hover:underline">
                                    Explore feature <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 4: Multiple AI Models */}
                            <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Lightbulb className="w-7 h-7 text-blue-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">300+ AI Models</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Access GPT-4, Claude, Gemini, and hundreds more. Different models excel at different subjects - use the best tool for each topic, from math to creative writing.
                                </p>
                                <Link href="/pricing" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
                                    See all models <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 5: Active Learning */}
                            <div className="group p-8 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Active Learning</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Engage with material through conversation, not passive reading. Research shows active learning boosts retention by up to 50%. Actually understand, don't just memorize.
                                </p>
                                <Link href="/blog/active-learning-increases-retention" className="inline-flex items-center text-emerald-600 font-semibold hover:underline">
                                    Read the science <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 6: Save Progress */}
                            <div className="group p-8 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-7 h-7 text-amber-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Save & Review</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Your learning trails are saved automatically. Return anytime to review concepts, continue where you left off, or branch into new directions. Build a personal knowledge library.
                                </p>
                                <Link href="/signup" className="inline-flex items-center text-amber-600 font-semibold hover:underline">
                                    Get started <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">How It Works</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">From confusion to clarity in three steps</h3>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white text-2xl font-bold">1</div>
                                    <h4 className="text-xl font-bold text-slate-900">Start a Topic</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Type any concept you want to learn - from "quantum entanglement" to "the causes of World War I." ThoughtMap creates your first learning trail.
                                    </p>
                                </div>
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white text-2xl font-bold">2</div>
                                    <h4 className="text-xl font-bold text-slate-900">Explore & Branch</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Ask follow-up questions, explore related concepts, and branch into new directions. Build a visual map of your understanding as you learn.
                                    </p>
                                </div>
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white text-2xl font-bold">3</div>
                                    <h4 className="text-xl font-bold text-slate-900">Test Your Knowledge</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Generate quizzes based on your trails to test understanding. Identify gaps, review weak areas, and ace your exams with confidence.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Student Stories</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Join thousands of successful students</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic">
                                        "I went from a C to an A in organic chemistry using ThoughtMap. The branching conversations helped me finally understand reaction mechanisms instead of just memorizing them."
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                            SK
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">Sarah K.</div>
                                            <div className="text-sm text-slate-500">Pre-Med, UCLA</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-100">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic">
                                        "The quiz feature is a game-changer for exam prep. I can study a topic and immediately test myself. It's like having a personal tutor available 24/7."
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-violet-200 rounded-full flex items-center justify-center text-violet-700 font-bold">
                                            MJ
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">Michael J.</div>
                                            <div className="text-sm text-slate-500">Engineering, MIT</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-fuchsia-50 to-white border-fuchsia-100">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic">
                                        "As a visual learner, seeing my thoughts mapped out as branches completely changed how I study. I wish I had this tool freshman year!"
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-fuchsia-200 rounded-full flex items-center justify-center text-fuchsia-700 font-bold">
                                            EP
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">Emma P.</div>
                                            <div className="text-sm text-slate-500">Psychology, Stanford</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Use Cases */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Use Cases</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Perfect for every academic situation</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="text-xl font-bold text-slate-900 mb-4">Exam Preparation</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Use ThoughtMap to review course material before midterms and finals. Generate practice quizzes, identify weak areas, and build comprehensive study guides. Many students report feeling significantly more confident on exam day.
                                </p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Create topic summaries</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Generate practice questions</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Review and fill knowledge gaps</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="text-xl font-bold text-slate-900 mb-4">Homework & Assignments</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Stuck on a problem? Use ThoughtMap to explore the underlying concepts. Build genuine understanding that helps you solve similar problems on your own. Great for STEM subjects where conceptual understanding is key.
                                </p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Understand concepts deeply</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Ask unlimited follow-up questions</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Connect ideas across topics</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="text-xl font-bold text-slate-900 mb-4">Research Papers</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Explore topics for research papers and essays. Map out arguments, understand different perspectives, and organize your thoughts before writing. Export your trails as outlines.
                                </p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Research topic exploration</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Argument development</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Source understanding</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="text-xl font-bold text-slate-900 mb-4">New Subject Learning</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Starting a new course or teaching yourself a skill? ThoughtMap lets you learn at your own pace, building from basics to advanced topics. Perfect for self-directed learning.
                                </p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Self-paced learning</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Build foundational knowledge</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        <span>Track your progress</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Mention */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 text-white text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Student-Friendly Pricing</h2>
                            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                                We know students are on a budget. That's why we offer a generous free plan and affordable one-time purchases - no subscriptions draining your bank account.
                            </p>
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white/10 rounded-2xl p-6">
                                    <div className="text-3xl font-bold mb-2">$0</div>
                                    <div className="text-indigo-200 mb-4">Free Forever</div>
                                    <div className="text-sm text-indigo-100">15 trails/day, 4 AI models</div>
                                </div>
                                <div className="bg-white/20 rounded-2xl p-6 border-2 border-white/30">
                                    <div className="text-3xl font-bold mb-2">$5</div>
                                    <div className="text-indigo-200 mb-4">Basic (One-Time)</div>
                                    <div className="text-sm text-indigo-100">100 credits, more models</div>
                                </div>
                                <div className="bg-white/10 rounded-2xl p-6">
                                    <div className="text-3xl font-bold mb-2">$15</div>
                                    <div className="text-indigo-200 mb-4">Pro (One-Time)</div>
                                    <div className="text-sm text-indigo-100">500+ credits, all models</div>
                                </div>
                            </div>
                            <Link href="/pricing">
                                <CTAButton variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                                    View Full Pricing Details
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </CTAButton>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">FAQ</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Common questions from students</h3>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-6">
                            {studentFAQs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <details className="group">
                                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                            <h4 className="text-lg font-semibold text-slate-900 pr-4">{faq.question}</h4>
                                            <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                                        </summary>
                                        <div className="px-6 pb-6 pt-0">
                                            <p className="text-slate-500 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <p className="text-slate-500 mb-4">Have more questions?</p>
                            <Link href="/faq" className="inline-flex items-center text-indigo-600 font-semibold hover:underline">
                                Visit our full FAQ page <ArrowRight className="ml-1 w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 bg-white relative">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                                Ready to transform how you <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">study</span>?
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 font-medium">
                                Join 10,000+ students who are already learning smarter with ThoughtMap.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-12">
                                        Start Learning Free
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
                                The AI-powered learning platform built for students who want to study smarter, not harder.
                            </p>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Platform</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link href="/" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">For Students</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link href="/for-students" className="hover:text-white transition-colors">Student Features</Link></li>
                                <li><Link href="/features/trivia" className="hover:text-white transition-colors">Quiz Generation</Link></li>
                                <li><Link href="/blog/active-learning-increases-retention" className="hover:text-white transition-colors">Study Tips</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-4 space-y-6">
                            <h4 className="text-lg font-bold mb-4">Questions?</h4>
                            <p className="text-slate-400 text-sm">Email us at support@thoughtmap.space</p>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-medium">
                        <p>© 2026 {SITE_CONFIG.name} Technologies Inc. Built for students.</p>
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
