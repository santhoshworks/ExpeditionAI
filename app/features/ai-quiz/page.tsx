import Link from "next/link"
import { Metadata } from "next"
import { CTAButton } from "@/components/ui/cta-button"
import { PublicHeader } from "@/components/layout/public-header"
import { SITE_CONFIG } from "@/lib/config"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import {
    Sparkles,
    ArrowRight,
    Brain,
    Zap,
    Target,
    CheckCircle,
    RefreshCw,
    BarChart3,
    BookOpen,
    Lightbulb,
    Network,
    ChevronDown,
    Clock,
    Trophy,
    Shuffle
} from "lucide-react"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'AI Quiz Generator', url: '/features/ai-quiz' },
])

const FAQ_DATA = [
    {
        question: "How does the AI quiz generator create questions?",
        answer: "Our AI quiz generator analyzes your learning trail conversations and identifies key concepts, facts, and relationships. It then generates multiple-choice, true/false, and open-ended questions that test your understanding of the material. The questions are contextually relevant to what you've actually learned, not generic textbook questions."
    },
    {
        question: "Can I customize the difficulty of generated quizzes?",
        answer: "Yes! You can choose between beginner, intermediate, and advanced difficulty levels. The AI adjusts question complexity, adds more nuanced answer choices, and includes more challenging edge cases as difficulty increases. You can also specify the number of questions and question types."
    },
    {
        question: "What types of questions does the AI quiz maker support?",
        answer: "The automatic quiz generator supports multiple question formats including multiple-choice (4 options), true/false, fill-in-the-blank, and short answer questions. Each format is designed to test different aspects of knowledge retention and understanding."
    },
    {
        question: "How accurate are the AI-generated quiz questions?",
        answer: "Our test generator AI is powered by advanced language models that understand context and nuance. Questions are generated based on your actual learning content, ensuring high relevance and accuracy. The system also provides detailed explanations for each answer to reinforce learning."
    },
    {
        question: "Can I retake quizzes to improve my score?",
        answer: "Absolutely! Quizzes can be retaken unlimited times. The AI tracks your performance over time and can even generate new variations of questions on the same topics to ensure you're truly mastering the material rather than just memorizing answers."
    },
    {
        question: "Does the quiz generator work with any topic?",
        answer: "Yes, the AI quiz maker works with virtually any subject matter. Whether you're studying quantum physics, Renaissance art, programming languages, or culinary arts, the AI adapts to generate appropriate questions based on your learning content."
    }
]

const faqSchema = generateFAQSchema(FAQ_DATA)

export const metadata: Metadata = generateSEOMetadata({
    title: "AI Quiz Generator - Test Your Knowledge",
    description: "Create personalized quizzes instantly with our AI quiz maker. The automatic quiz generator analyzes your learning and creates targeted questions to test your knowledge. Transform any topic into an interactive assessment.",
    keywords: [
        "AI quiz maker",
        "automatic quiz generator",
        "test generator AI",
        "AI quiz creator",
        "intelligent quiz generator",
        "personalized quiz maker",
        "AI test creator",
        "smart quiz generator",
        "automated quiz creation",
        "AI-powered testing",
        "learning assessment AI",
        "knowledge testing tool"
    ],
    url: "/features/ai-quiz"
})

export default function AIQuizPage() {
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
            <PublicHeader currentPage="features" />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs md:text-sm font-semibold tracking-wide uppercase animate-in fade-in slide-in-from-bottom-4">
                                <Brain className="w-4 h-4" />
                                <span>AI-Powered Assessment</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                                Test your knowledge with{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                                    AI-generated quizzes.
                                </span>
                            </h1>

                            <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                                Our intelligent AI quiz maker transforms your learning into personalized assessments. The automatic quiz generator creates targeted questions based on exactly what you have studied, helping you identify gaps and reinforce understanding.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-10">
                                        Try Quiz Generator Free
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </CTAButton>
                                </Link>
                                <Link href="/demo">
                                    <CTAButton variant="outline" size="xl" className="px-10">
                                        See Demo
                                    </CTAButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">How It Works</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                From learning to testing in seconds
                            </h3>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                The test generator AI watches your learning journey and creates assessments that match your exact study material. No more generic quizzes that miss the point.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Step 1 */}
                            <div className="relative group">
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                                    1
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-8 pt-12 h-full border border-slate-100 group-hover:border-indigo-200 transition-colors">
                                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                                        <BookOpen className="w-7 h-7 text-indigo-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">Learn Any Topic</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Start a learning expedition on any subject. Chat with AI tutors, explore concepts through branching trails, and build your knowledge base naturally through conversation.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative group">
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                                    2
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-8 pt-12 h-full border border-slate-100 group-hover:border-indigo-200 transition-colors">
                                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                                        <Sparkles className="w-7 h-7 text-indigo-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">AI Generates Quiz</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Click the quiz button and our AI quiz maker analyzes your conversations. It identifies key concepts, important facts, and relationships to create relevant questions tailored to your learning.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative group">
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                                    3
                                </div>
                                <div className="bg-slate-50 rounded-3xl p-8 pt-12 h-full border border-slate-100 group-hover:border-indigo-200 transition-colors">
                                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                                        <Target className="w-7 h-7 text-indigo-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">Test and Improve</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Take the quiz, get instant feedback, and see detailed explanations. Identify knowledge gaps, retake tests with new questions, and track your progress over time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-slate-50 relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Benefits</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Why use an AI quiz generator?
                            </h3>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Traditional studying often lacks feedback. Our automatic quiz generator gives you the active recall practice that research shows dramatically improves retention.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {/* Benefit 1 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Personalized Questions</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Questions are generated from your actual learning content, not generic databases. Every quiz is uniquely tailored to what you studied.
                                </p>
                            </div>

                            {/* Benefit 2 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                                    <Zap className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Instant Generation</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    No waiting for someone to create a test. The AI quiz maker generates comprehensive assessments in seconds, ready when you are.
                                </p>
                            </div>

                            {/* Benefit 3 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                                    <RefreshCw className="w-6 h-6 text-purple-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Unlimited Variations</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Generate new quiz variations on the same topics. The test generator AI creates fresh questions each time to prevent memorization.
                                </p>
                            </div>

                            {/* Benefit 4 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                                    <BarChart3 className="w-6 h-6 text-orange-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Progress Tracking</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Monitor your improvement over time with detailed analytics. See which topics need more attention and celebrate your growth.
                                </p>
                            </div>

                            {/* Benefit 5 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-5">
                                    <Lightbulb className="w-6 h-6 text-pink-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Detailed Explanations</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Every answer comes with comprehensive explanations. Learn why answers are correct or incorrect to deepen understanding.
                                </p>
                            </div>

                            {/* Benefit 6 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
                                    <Brain className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Active Recall Practice</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Quizzing yourself is proven to boost retention by up to 50%. Our AI makes it easy to practice the most effective study technique.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quiz Types Section */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Question Types</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Multiple formats for comprehensive testing
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="flex gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Shuffle className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">Multiple Choice</h4>
                                    <p className="text-slate-500">Four carefully crafted options with plausible distractors that test true understanding, not just recognition.</p>
                                </div>
                            </div>

                            <div className="flex gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">True or False</h4>
                                    <p className="text-slate-500">Quick-fire questions that test your ability to identify accurate statements about concepts.</p>
                                </div>
                            </div>

                            <div className="flex gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">Fill in the Blank</h4>
                                    <p className="text-slate-500">Recall-focused questions that require you to remember specific terms and concepts.</p>
                                </div>
                            </div>

                            <div className="flex gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Trophy className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">Short Answer</h4>
                                    <p className="text-slate-500">Open-ended questions that test deeper understanding and your ability to explain concepts.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-slate-50 relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">FAQ</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Frequently asked questions
                            </h3>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {FAQ_DATA.map((faq, index) => (
                                <details key={index} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                    <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                                        <span>{faq.question}</span>
                                        <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="px-6 pb-6 text-slate-500 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Related Content Section */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Learn More</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                                Related resources
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <Link href="/blog/active-learning-increases-retention" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Active Learning Increases Retention</h4>
                                <p className="text-slate-500 text-sm">Discover the science behind why testing yourself beats passive reading.</p>
                            </Link>
                            <Link href="/features/journals" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">AI Learning Journals</h4>
                                <p className="text-slate-500 text-sm">Auto-generate comprehensive study notes from your learning sessions.</p>
                            </Link>
                            <Link href="/features/trail-branching" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Branching Learning Paths</h4>
                                <p className="text-slate-500 text-sm">Explore topics non-linearly with visual knowledge mapping.</p>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-slate-50 relative">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                                Ready to test your <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">knowledge</span>?
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 font-medium">
                                Start learning any topic and let our AI quiz generator help you master it through active recall practice.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-12">
                                        Start Free Today
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </CTAButton>
                                </Link>
                                <Link href="/pricing">
                                    <CTAButton variant="ghost" size="xl">
                                        View Pricing
                                    </CTAButton>
                                </Link>
                            </div>
                            <p className="text-slate-400 font-medium text-sm">No credit card required</p>
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
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Features</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link href="/features/ai-quiz" className="hover:text-white transition-colors">AI Quiz Generator</Link></li>
                                <li><Link href="/features/journals" className="hover:text-white transition-colors">Learning Journals</Link></li>
                                <li><Link href="/features/trail-branching" className="hover:text-white transition-colors">Trail Branching</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Platform</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-4 space-y-6">
                            <h4 className="text-lg font-bold mb-4">Questions?</h4>
                            <p className="text-slate-400 text-sm">Email us at support@thoughtmap.space</p>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-medium">
                        <p>2026 {SITE_CONFIG.name} Technologies Inc. Crafted for deep learners.</p>
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
