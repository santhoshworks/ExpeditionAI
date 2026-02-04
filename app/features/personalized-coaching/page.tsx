import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CTAButton } from "@/components/ui/cta-button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Brain,
    Target,
    GraduationCap,
    Briefcase,
    Sparkles,
    BookOpen,
    Hammer,
    Users,
    Search,
    ArrowRight,
    CheckCircle2,
    MessageSquare,
    Zap,
    ChevronDown
} from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import { Metadata } from "next"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Personalized AI Coaching', url: '/features/personalized-coaching' },
])

const faqs = [
    {
        question: "How does ThoughtMap personalize my learning experience?",
        answer: "When you start a new learning expedition, you tell us your goal (interview prep, exam study, research, etc.) and your current familiarity with the topic. Our AI coach then adapts its teaching style, vocabulary complexity, examples, and the depth of explanations to match exactly what you need. A beginner preparing for an interview gets different coaching than an expert doing deep research."
    },
    {
        question: "Can I change my learning goal or level mid-expedition?",
        answer: "Your learning context is tied to each expedition, but you can always start a new expedition with different settings. The AI also naturally adapts based on your responses - if you're demonstrating advanced understanding, it will automatically adjust to challenge you more."
    },
    {
        question: "What's the difference between learning for an interview vs an exam?",
        answer: "Interview prep focuses on articulating your understanding clearly, practicing 'thinking out loud', and preparing for follow-up questions. Exam prep emphasizes comprehensive coverage, retention techniques, and identifying potential test patterns. The AI uses different questioning styles and reinforcement strategies for each."
    },
    {
        question: "How does the AI know my actual level if I say I'm intermediate?",
        answer: "The AI continuously assesses your understanding through your responses. It notices when you struggle or breeze through concepts and adjusts accordingly. Think of the initial level setting as a starting point - the coaching evolves based on the actual conversation."
    },
    {
        question: "Is personalized coaching available on the free plan?",
        answer: "Yes! Personalized coaching with learning goals and level settings is available to all users, including free tier. This feature works with all 8 AI models we offer."
    }
]

const faqSchema = generateFAQSchema(faqs)

export const metadata: Metadata = generateSEOMetadata({
    title: "Personalized AI Coaching - Learning Tailored to You",
    description: "ThoughtMap's AI coach adapts to your goals and skill level. Whether you're prepping for interviews, studying for exams, or doing deep research, get coaching that fits your needs.",
    keywords: [
        "personalized AI tutor",
        "adaptive learning",
        "interview preparation AI",
        "exam study AI",
        "research assistant AI",
        "personalized education",
        "AI coaching for students",
        "adaptive AI tutoring",
        "custom learning experience",
        "AI that adapts to you"
    ],
    url: "/features/personalized-coaching"
})

const learningGoals = [
    {
        id: "interview",
        icon: Target,
        title: "Interview Prep",
        description: "Practice articulating concepts clearly and handling follow-up questions",
        aiApproach: "Focuses on explanation skills, common interview patterns, and 'thinking out loud' practice"
    },
    {
        id: "exam",
        icon: GraduationCap,
        title: "Exam Study",
        description: "Comprehensive coverage with focus on retention and test patterns",
        aiApproach: "Emphasizes definitions, frameworks for recall, and frequent comprehension checks"
    },
    {
        id: "research",
        icon: Search,
        title: "Deep Research",
        description: "Nuanced exploration with academic rigor and edge cases",
        aiApproach: "Discusses current debates, limitations, and connects to broader literature"
    },
    {
        id: "work",
        icon: Briefcase,
        title: "Work Application",
        description: "Practical implementation focus with real-world trade-offs",
        aiApproach: "Prioritizes actionable knowledge, best practices, and professional context"
    },
    {
        id: "curiosity",
        icon: Sparkles,
        title: "Personal Curiosity",
        description: "Engaging exploration at your own pace, no pressure",
        aiApproach: "Follows your interests, uses fascinating analogies, makes learning enjoyable"
    },
    {
        id: "teaching",
        icon: Users,
        title: "Teaching Others",
        description: "Learn how to explain concepts and anticipate misconceptions",
        aiApproach: "Builds pedagogical intuition and explains 'how to teach' each concept"
    },
    {
        id: "building",
        icon: Hammer,
        title: "Building Something",
        description: "Hands-on guidance with implementation focus",
        aiApproach: "Provides practical problem-solving and working mental models"
    }
]

const proficiencyLevels = [
    {
        level: "Beginner",
        description: "New to this topic",
        aiApproach: "Simple analogies, no jargon, building from absolute fundamentals with extra encouragement"
    },
    {
        level: "Familiar",
        description: "Know the basics",
        aiApproach: "Builds on existing knowledge, introduces proper terminology, makes concept connections"
    },
    {
        level: "Intermediate",
        description: "Solid foundation",
        aiApproach: "Focuses on 'why' not 'what', challenges assumptions, explores nuances"
    },
    {
        level: "Advanced",
        description: "Deep knowledge",
        aiApproach: "Peer-level discussion of trade-offs, edge cases, and current debates"
    }
]

export default function PersonalizedCoachingPage() {
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
                <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-sm font-semibold tracking-wide uppercase">
                                <Brain className="w-4 h-4" />
                                <span>Adaptive AI Coaching</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                                Learning that adapts to{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                                    your goals & level
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                                Tell your AI coach what you&apos;re learning for and how familiar you are with the topic.
                                Get explanations, examples, and questions tailored specifically to you.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="lg" className="px-8">
                                        Try Personalized Coaching
                                        <Zap className="w-5 h-5 ml-2 fill-indigo-400 text-indigo-400" />
                                    </CTAButton>
                                </Link>
                                <Link href="/demo">
                                    <CTAButton variant="secondary" size="lg" className="px-8">
                                        See Demo
                                    </CTAButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">How It Works</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Coaching in 3 simple steps</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[
                                {
                                    step: "1",
                                    title: "Choose Your Goal",
                                    description: "Tell us why you're learning: interview prep, exam study, research, work application, or just curiosity"
                                },
                                {
                                    step: "2",
                                    title: "Set Your Level",
                                    description: "Are you a complete beginner or do you have some familiarity? The AI adapts its explanations accordingly"
                                },
                                {
                                    step: "3",
                                    title: "Learn Your Way",
                                    description: "Your AI coach adjusts vocabulary, depth, examples, and questioning style to match your needs"
                                }
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="bg-slate-50 rounded-3xl p-8 h-full border border-slate-100">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6">
                                            {item.step}
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                                        <p className="text-slate-600">{item.description}</p>
                                    </div>
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                            <ArrowRight className="w-8 h-8 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Learning Goals Section */}
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Learning Goals</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Different goals, different coaching</h3>
                            <p className="text-slate-600 text-lg">Your AI adapts its teaching style based on what you&apos;re learning for</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {learningGoals.map((goal) => (
                                <Card key={goal.id} className="bg-white border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                                    <CardContent className="p-6">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                                            <goal.icon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">{goal.title}</h4>
                                        <p className="text-slate-600 text-sm mb-4">{goal.description}</p>
                                        <div className="pt-4 border-t border-slate-100">
                                            <p className="text-xs text-indigo-600 font-medium">
                                                <MessageSquare className="w-3 h-3 inline mr-1" />
                                                {goal.aiApproach}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Proficiency Levels Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Proficiency Levels</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Explanations that match your level</h3>
                            <p className="text-slate-600 text-lg">No more explanations that are too basic or too advanced</p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {proficiencyLevels.map((level, i) => (
                                    <div key={level.level} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                                <span className="text-white font-bold">{i + 1}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{level.level}</h4>
                                                <p className="text-sm text-slate-500">{level.description}</p>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-sm pl-14">{level.aiApproach}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Example Comparison */}
                <section className="py-20 bg-gradient-to-br from-indigo-50 to-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">See The Difference</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Same topic, different coaching</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {/* Beginner + Interview */}
                            <Card className="bg-white overflow-hidden">
                                <div className="bg-indigo-600 p-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <Target className="w-5 h-5" />
                                        <span className="font-bold">Interview Prep</span>
                                        <span className="mx-2">+</span>
                                        <span className="font-bold">Beginner</span>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <p className="text-slate-600 mb-4 italic">&quot;What is machine learning?&quot;</p>
                                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                                        <p className="mb-3">Great question! Before I explain, what comes to mind when you hear &quot;machine learning&quot;? Even a guess is helpful!</p>
                                        <p className="mb-3">Think of it like teaching a child to recognize cats. Instead of writing rules (&quot;has whiskers, pointy ears...&quot;), you show them thousands of cat photos until they just &quot;get it.&quot;</p>
                                        <p className="text-indigo-600 font-medium">In an interview, you might explain it as: &quot;Machine learning is when we train computers to find patterns in data, rather than explicitly programming every rule.&quot; Does that click?</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Advanced + Research */}
                            <Card className="bg-white overflow-hidden">
                                <div className="bg-violet-600 p-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <Search className="w-5 h-5" />
                                        <span className="font-bold">Research</span>
                                        <span className="mx-2">+</span>
                                        <span className="font-bold">Advanced</span>
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <p className="text-slate-600 mb-4 italic">&quot;What is machine learning?&quot;</p>
                                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                                        <p className="mb-3">Given your background, I assume you&apos;re interested in a specific aspect. The field has fragmented significantly—are you looking at statistical learning theory, deep learning architectures, or perhaps the more recent discourse on foundation models?</p>
                                        <p className="mb-3">There&apos;s an interesting tension in how we define ML now versus Mitchell&apos;s 1997 definition. The line between traditional optimization and &quot;learning&quot; has blurred considerably.</p>
                                        <p className="text-violet-600 font-medium">What specific research angle are you exploring? That would help me point you toward the most relevant current debates.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">FAQ</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Common questions</h3>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {faqs.map((faq, i) => (
                                <details key={i} className="group bg-slate-50 rounded-2xl overflow-hidden">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <span className="font-bold text-slate-900 pr-4">{faq.question}</span>
                                        <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0" />
                                    </summary>
                                    <div className="px-6 pb-6 text-slate-600">
                                        {faq.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-slate-900">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">
                                Ready for learning that actually fits you?
                            </h2>
                            <p className="text-slate-400 text-lg">
                                Start your personalized learning journey today. Free to try.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="lg" className="px-10">
                                        Get Started Free
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </CTAButton>
                                </Link>
                                <Link href="/demo">
                                    <Button variant="outline" className="h-14 px-8 rounded-xl border-slate-700 text-white hover:bg-slate-800">
                                        Try Demo First
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
