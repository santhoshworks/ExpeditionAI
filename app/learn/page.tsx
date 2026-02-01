import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Network,
    ArrowRight,
    BookOpen,
    GraduationCap,
    Sparkles,
    Calculator,
    Atom,
    Brain,
    Languages,
    TrendingUp,
    Code,
    Zap,
    BarChart3,
    Dna,
    Grid3x3,
    Globe,
    Lightbulb,
    PenTool,
    Target,
    Database,
    Music,
    Star
} from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import { LEARNING_TOPICS, getAllCategories } from "@/lib/topics"
import { Metadata } from "next"
import { SITE_CONFIG } from "@/lib/config"

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Calculator,
    Atom,
    Brain,
    Languages,
    TrendingUp,
    Code,
    Zap,
    BarChart3,
    Dna,
    Grid3x3,
    Globe,
    Lightbulb,
    PenTool,
    Target,
    Database,
    Music,
    Star
}

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Learn', url: '/learn' },
])

const faqSchema = generateFAQSchema([
    {
        question: 'What topics can I learn with ThoughtMap?',
        answer: 'ThoughtMap offers AI-powered learning for 20+ subjects including Mathematics (Calculus, Statistics, Linear Algebra), Science (Physics, Chemistry, Biology), Computer Science (Python, Machine Learning, Data Science, Web Development), Languages (Spanish, French), Social Sciences (Economics, Psychology), Humanities (History, Philosophy), Business, and Arts (Creative Writing, Music Theory).'
    },
    {
        question: 'How does AI-powered learning work?',
        answer: 'ThoughtMap uses advanced AI models to create personalized learning paths. You ask questions, explore concepts through branching conversations, and the AI adapts to your learning style and pace. It\'s like having a personal tutor available 24/7.'
    },
    {
        question: 'Is ThoughtMap free to use?',
        answer: 'Yes! ThoughtMap offers a free tier with access to 4 AI models and 15 trails per day. For more intensive learning, you can upgrade to Basic ($5) or Pro ($15) plans with additional credits and premium AI models.'
    },
    {
        question: 'What makes ThoughtMap different from other learning platforms?',
        answer: 'Unlike traditional courses, ThoughtMap uses branching conversations that let you explore topics naturally. You\'re not limited to a linear curriculum - you can dive deep into what interests you, ask follow-up questions, and create a personalized knowledge map.'
    }
])

export const metadata: Metadata = generateSEOMetadata({
    title: "Learn Any Topic with AI - Browse Subjects",
    description: "Master any subject with AI-powered personalized learning. Browse 20+ topics including Mathematics, Science, Programming, Languages, and more. Start learning with your AI tutor today.",
    keywords: [
        "learn with AI",
        "AI learning platform",
        "online learning subjects",
        "AI tutor",
        "personalized learning",
        "learn calculus online",
        "learn programming with AI",
        "AI language learning",
        "online education topics",
        "AI-powered courses",
        "learn machine learning",
        "study with AI",
        "educational AI platform"
    ],
    url: "/learn"
})

// Category color mapping
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'Mathematics': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    'Science': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
    'Computer Science': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
    'Languages': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
    'Social Sciences': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
    'Humanities': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    'Business': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
    'Arts': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' }
}

// Difficulty color mapping
const difficultyColors: Record<string, { bg: string; text: string }> = {
    'Beginner': { bg: 'bg-green-100', text: 'text-green-700' },
    'Intermediate': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'Advanced': { bg: 'bg-red-100', text: 'text-red-700' }
}

export default function LearnPage() {
    const categories = getAllCategories()

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
            <PublicHeader currentPage="learn" />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs md:text-sm font-semibold tracking-wide uppercase">
                                <BookOpen className="w-4 h-4" />
                                <span>{LEARNING_TOPICS.length}+ Learning Topics</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                                Learn Any Topic with{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                                    AI
                                </span>
                            </h1>

                            <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                                Explore subjects from Mathematics and Science to Languages and Arts.
                                Your personal AI tutor adapts to your learning style and helps you master any topic.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/signup">
                                    <Button size="lg" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700">
                                        Start Learning Free
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/demo">
                                    <Button variant="outline" size="lg" className="rounded-full px-8">
                                        Try Demo First
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Topics by Category */}
                {categories.map((category) => {
                    const topicsInCategory = LEARNING_TOPICS.filter(t => t.category === category)
                    const categoryStyle = categoryColors[category] || categoryColors['Mathematics']

                    return (
                        <section key={category} className="py-16 bg-white border-t border-slate-100">
                            <div className="container mx-auto px-6">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className={`p-2 rounded-xl ${categoryStyle.bg}`}>
                                        <GraduationCap className={`w-5 h-5 ${categoryStyle.text}`} />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{category}</h2>
                                    <span className="text-sm text-slate-400">({topicsInCategory.length} topics)</span>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {topicsInCategory.map((topic) => {
                                        const IconComponent = iconMap[topic.icon] || BookOpen
                                        const difficultyStyle = difficultyColors[topic.difficulty]

                                        return (
                                            <Link key={topic.slug} href={`/learn/${topic.slug}`}>
                                                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-slate-200 bg-white">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className={`p-3 rounded-xl ${categoryStyle.bg} group-hover:scale-110 transition-transform`}>
                                                                <IconComponent className={`w-6 h-6 ${categoryStyle.text}`} />
                                                            </div>
                                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyStyle.bg} ${difficultyStyle.text}`}>
                                                                {topic.difficulty}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors text-slate-900">
                                                            {topic.name}
                                                        </h3>
                                                        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                                                            {topic.description}
                                                        </p>
                                                        <div className="flex items-center text-sm text-slate-400">
                                                            <Sparkles className="w-4 h-4 mr-1" />
                                                            <span>~{topic.estimatedHours} hours</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </section>
                    )
                })}

                {/* Why Learn with AI Section */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Why AI Learning</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Learn faster with a personal AI tutor
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                                    <Brain className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-slate-900">Personalized Learning</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    AI adapts to your pace and learning style. Ask questions anytime and get explanations that make sense to you.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                    <Network className="w-6 h-6 text-purple-600" />
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-slate-900">Branching Exploration</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Follow your curiosity with branching conversations. Dive deep into concepts that interest you most.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                    <Zap className="w-6 h-6 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-slate-900">Instant Answers</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    No more waiting for office hours. Get immediate help with explanations, examples, and practice problems.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Internal Links Section */}
                <section className="py-16 bg-white border-t border-slate-100">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold mb-8 text-slate-900">Explore More</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Link href="/demo" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                    <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Try the Demo</h3>
                                    <p className="text-slate-500 text-sm">Experience AI-powered learning without signing up. See how branching conversations work.</p>
                                </Link>
                                <Link href="/blog/active-learning-increases-retention" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                    <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Active Learning Science</h3>
                                    <p className="text-slate-500 text-sm">Learn why active learning with AI is more effective than passive studying.</p>
                                </Link>
                                <Link href="/pricing" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                    <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">View Pricing</h3>
                                    <p className="text-slate-500 text-sm">Simple credit-based pricing. Start free, upgrade when you need more.</p>
                                </Link>
                                <Link href="/faq" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                    <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">FAQ</h3>
                                    <p className="text-slate-500 text-sm">Get answers to common questions about ThoughtMap and AI learning.</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-t border-indigo-100">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                                Ready to start learning?
                            </h2>
                            <p className="text-xl text-slate-500 font-medium">
                                Join thousands of learners exploring knowledge with AI-powered conversations.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                                <Link href="/signup">
                                    <Button size="lg" className="rounded-full px-10 bg-indigo-600 hover:bg-indigo-700">
                                        Get Started Free
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <p className="text-slate-400 text-sm">No credit card required</p>
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
                                <li><Link href="/learn" className="hover:text-white transition-colors">Learn</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Resources</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-4 space-y-6">
                            <h4 className="text-lg font-bold mb-4">Questions?</h4>
                            <p className="text-slate-400 text-sm">Email us at support@thoughtmap.space</p>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-medium">
                        <p>&copy; 2026 {SITE_CONFIG.name} Technologies Inc. Crafted for deep learners.</p>
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
