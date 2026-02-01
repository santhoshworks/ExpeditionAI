import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Network,
    ArrowRight,
    ArrowLeft,
    BookOpen,
    Clock,
    GraduationCap,
    CheckCircle2,
    Lightbulb,
    Sparkles,
    Target,
    Users,
    Zap,
    MessageSquare,
    ChevronRight,
    Calculator,
    Atom,
    Brain,
    Languages,
    TrendingUp,
    Code,
    BarChart3,
    Dna,
    Grid3x3,
    Globe,
    PenTool,
    Database,
    Music,
    Star
} from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import {
    generateSEOMetadata,
    generateBreadcrumbSchema,
    generateCourseSchema,
    generateFAQSchema
} from "@/lib/seo"
import {
    LEARNING_TOPICS,
    getTopicBySlug,
    getRelatedTopics,
    LearningTopic
} from "@/lib/topics"
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

interface TopicPageProps {
    params: Promise<{ topic: string }>
}

// Generate static params for all topics
export async function generateStaticParams() {
    return LEARNING_TOPICS.map((topic) => ({
        topic: topic.slug,
    }))
}

// Generate dynamic metadata for each topic
export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
    const resolvedParams = await params
    const topic = getTopicBySlug(resolvedParams.topic)

    if (!topic) {
        return {
            title: "Topic Not Found | ThoughtMap",
        }
    }

    return generateSEOMetadata({
        title: `Learn ${topic.name} with AI - ${topic.category} Learning`,
        description: `Master ${topic.name} with personalized AI tutoring. ${topic.description}. Interactive learning paths, instant explanations, and practice problems. Start learning ${topic.name.toLowerCase()} today.`,
        keywords: [
            `learn ${topic.name.toLowerCase()}`,
            `${topic.name.toLowerCase()} AI tutor`,
            `${topic.name.toLowerCase()} learning platform`,
            `study ${topic.name.toLowerCase()} online`,
            `${topic.name.toLowerCase()} course`,
            `${topic.name.toLowerCase()} tutorial`,
            `AI ${topic.name.toLowerCase()} help`,
            `${topic.category.toLowerCase()} learning`,
            `learn ${topic.name.toLowerCase()} with AI`,
            `${topic.name.toLowerCase()} for ${topic.difficulty.toLowerCase()}`
        ],
        url: `/learn/${topic.slug}`
    })
}

// Category color mapping
const categoryColors: Record<string, { bg: string; text: string; bgLight: string; gradient: string }> = {
    'Mathematics': { bg: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-50', gradient: 'from-blue-600 to-indigo-600' },
    'Science': { bg: 'bg-green-600', text: 'text-green-600', bgLight: 'bg-green-50', gradient: 'from-green-600 to-emerald-600' },
    'Computer Science': { bg: 'bg-purple-600', text: 'text-purple-600', bgLight: 'bg-purple-50', gradient: 'from-purple-600 to-violet-600' },
    'Languages': { bg: 'bg-pink-600', text: 'text-pink-600', bgLight: 'bg-pink-50', gradient: 'from-pink-600 to-rose-600' },
    'Social Sciences': { bg: 'bg-orange-600', text: 'text-orange-600', bgLight: 'bg-orange-50', gradient: 'from-orange-600 to-amber-600' },
    'Humanities': { bg: 'bg-amber-600', text: 'text-amber-600', bgLight: 'bg-amber-50', gradient: 'from-amber-600 to-yellow-600' },
    'Business': { bg: 'bg-teal-600', text: 'text-teal-600', bgLight: 'bg-teal-50', gradient: 'from-teal-600 to-cyan-600' },
    'Arts': { bg: 'bg-rose-600', text: 'text-rose-600', bgLight: 'bg-rose-50', gradient: 'from-rose-600 to-pink-600' }
}

// Difficulty color mapping
const difficultyColors: Record<string, { bg: string; text: string }> = {
    'Beginner': { bg: 'bg-green-100', text: 'text-green-700' },
    'Intermediate': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'Advanced': { bg: 'bg-red-100', text: 'text-red-700' }
}

// Generate topic-specific content sections (~500 words)
function generateTopicContent(topic: LearningTopic) {
    const content = {
        intro: `${topic.name} is one of the most fascinating subjects in ${topic.category}. Whether you're a complete beginner or looking to deepen your existing knowledge, mastering ${topic.name.toLowerCase()} opens doors to countless opportunities. ${topic.description}. With ThoughtMap's AI-powered learning platform, you can explore ${topic.name.toLowerCase()} at your own pace, asking questions and diving deep into concepts that interest you most.`,

        whyLearn: `Learning ${topic.name.toLowerCase()} with AI represents a revolutionary approach to education. Traditional learning methods often force students through a rigid curriculum, but ThoughtMap's branching conversation system lets you follow your curiosity. When you're studying ${topic.name.toLowerCase()}, you might encounter a concept that sparks your interest - with AI tutoring, you can immediately explore that tangent without losing track of your main learning path. This personalized approach means you spend time on what matters to you, not what a textbook author assumed you'd need.`,

        howItWorks: `Our AI tutor for ${topic.name.toLowerCase()} works by understanding your current knowledge level and adapting explanations accordingly. Ask any question about ${topic.description.toLowerCase()}, and receive instant, clear explanations. Stuck on a problem? The AI breaks it down step by step. Want to see real-world applications? It provides relevant examples from ${topic.category.toLowerCase()}. The more you interact, the better the AI understands your learning style, creating a truly personalized ${topic.name.toLowerCase()} learning experience.`,

        benefits: `Students who learn ${topic.name.toLowerCase()} with ThoughtMap benefit from 24/7 availability - no more waiting for office hours or tutoring appointments. You can practice problems, review concepts, and test your understanding anytime. The platform tracks your progress through learning expeditions, helping you identify strengths and areas needing improvement. Plus, with access to multiple AI models, you can find the explanation style that resonates best with how you learn ${topic.name.toLowerCase()}.`
    }
    return content
}

export default async function TopicPage({ params }: TopicPageProps) {
    const resolvedParams = await params
    const topic = getTopicBySlug(resolvedParams.topic)

    if (!topic) {
        notFound()
    }

    const relatedTopics = getRelatedTopics(topic.slug)
    const categoryStyle = categoryColors[topic.category] || categoryColors['Mathematics']
    const difficultyStyle = difficultyColors[topic.difficulty]
    const IconComponent = iconMap[topic.icon] || BookOpen
    const content = generateTopicContent(topic)

    // Generate structured data schemas
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Learn', url: '/learn' },
        { name: topic.name, url: `/learn/${topic.slug}` },
    ])

    const courseSchema = generateCourseSchema({
        name: `Learn ${topic.name} with AI`,
        description: `${topic.description}. Interactive AI-powered learning with personalized paths and instant explanations.`,
        url: `${SITE_CONFIG.url}/learn/${topic.slug}`
    })

    const faqSchema = generateFAQSchema(
        topic.popularQuestions.map((question, index) => ({
            question,
            answer: getFAQAnswer(topic, index)
        }))
    )

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
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
                <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
                    <div className="container mx-auto px-6">
                        {/* Back Link */}
                        <Link
                            href="/learn"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to All Topics
                        </Link>

                        <div className="flex flex-col lg:flex-row gap-12 items-start">
                            {/* Left Column - Topic Info */}
                            <div className="flex-1 space-y-8">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryStyle.bgLight} ${categoryStyle.text}`}>
                                        {topic.category}
                                    </span>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${difficultyStyle.bg} ${difficultyStyle.text}`}>
                                        {topic.difficulty}
                                    </span>
                                </div>

                                <div className="flex items-start gap-6">
                                    <div className={`p-4 rounded-2xl ${categoryStyle.bgLight} shrink-0`}>
                                        <IconComponent className={`w-10 h-10 ${categoryStyle.text}`} />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-4">
                                            Learn {topic.name}
                                        </h1>
                                        <p className="text-xl text-slate-500 leading-relaxed">
                                            {topic.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                        <span>~{topic.estimatedHours} hours to complete</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <GraduationCap className="w-5 h-5 text-slate-400" />
                                        <span>{topic.difficulty} level</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link href="/signup">
                                        <Button size="lg" className={`rounded-full px-8 bg-gradient-to-r ${categoryStyle.gradient} hover:opacity-90`}>
                                            Start Learning {topic.name}
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

                            {/* Right Column - Quick Stats Card */}
                            <div className="w-full lg:w-96 shrink-0">
                                <Card className="border-slate-200 shadow-lg">
                                    <CardContent className="p-6 space-y-6">
                                        <h3 className="font-semibold text-lg text-slate-900">What You&apos;ll Learn</h3>
                                        <ul className="space-y-3">
                                            {topic.learningOutcomes.slice(0, 5).map((outcome, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <CheckCircle2 className={`w-5 h-5 ${categoryStyle.text} shrink-0 mt-0.5`} />
                                                    <span className="text-slate-600 text-sm">{outcome}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="border-t border-slate-100 pt-6">
                                            <h4 className="font-medium text-slate-900 mb-3">Prerequisites</h4>
                                            <ul className="space-y-2">
                                                {topic.prerequisites.map((prereq, index) => (
                                                    <li key={index} className="flex items-center gap-2 text-sm text-slate-500">
                                                        <ChevronRight className="w-4 h-4" />
                                                        {prereq}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Section - ~500 words */}
                <section className="py-16 bg-white border-t border-slate-100">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto prose prose-lg prose-slate">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">
                                Why Learn {topic.name} with AI?
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                {content.intro}
                            </p>

                            <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                Personalized Learning Experience
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                {content.whyLearn}
                            </p>

                            <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                How AI Tutoring Works for {topic.name}
                            </h3>
                            <p className="text-slate-600 leading-relaxed mb-8">
                                {content.howItWorks}
                            </p>

                            <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                Benefits of Learning {topic.name} with ThoughtMap
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {content.benefits}
                            </p>
                        </div>
                    </div>
                </section>

                {/* AI Learning Path Section */}
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className={`font-bold tracking-wider uppercase text-sm ${categoryStyle.text}`}>
                                AI-Suggested Learning Path
                            </h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                                Your Journey to Mastering {topic.name}
                            </h3>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 hidden md:block" />

                                {topic.learningOutcomes.map((outcome, index) => (
                                    <div key={index} className="relative flex gap-6 mb-8">
                                        <div className={`w-16 h-16 rounded-2xl ${categoryStyle.bgLight} flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm`}>
                                            <span className={`text-xl font-bold ${categoryStyle.text}`}>{index + 1}</span>
                                        </div>
                                        <div className="flex-1 bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                                            <h4 className="font-semibold text-slate-900 mb-2">{outcome}</h4>
                                            <p className="text-slate-500 text-sm">
                                                Ask questions, explore examples, and practice with AI guidance.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features for This Topic */}
                <section className="py-20 bg-white border-t border-slate-100">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Platform Features</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                                Tools to Master {topic.name}
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow bg-white">
                                <div className={`w-12 h-12 rounded-xl ${categoryStyle.bgLight} flex items-center justify-center mb-6`}>
                                    <MessageSquare className={`w-6 h-6 ${categoryStyle.text}`} />
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-slate-900">Branching Conversations</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Explore {topic.name.toLowerCase()} concepts through natural conversation. Branch into new topics as curiosity leads you.
                                </p>
                            </div>
                            <div className="p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow bg-white">
                                <div className={`w-12 h-12 rounded-xl ${categoryStyle.bgLight} flex items-center justify-center mb-6`}>
                                    <Lightbulb className={`w-6 h-6 ${categoryStyle.text}`} />
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-slate-900">Instant Explanations</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Get immediate, clear explanations for any {topic.name.toLowerCase()} concept. No waiting, no confusion.
                                </p>
                            </div>
                            <div className="p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow bg-white">
                                <div className={`w-12 h-12 rounded-xl ${categoryStyle.bgLight} flex items-center justify-center mb-6`}>
                                    <Target className={`w-6 h-6 ${categoryStyle.text}`} />
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-slate-900">Practice Problems</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Test your {topic.name.toLowerCase()} knowledge with AI-generated problems tailored to your level.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className={`font-bold tracking-wider uppercase text-sm ${categoryStyle.text}`}>
                                Common Questions
                            </h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                                {topic.name} FAQ
                            </h3>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-6">
                            {topic.popularQuestions.map((question, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                                    <h4 className="font-semibold text-slate-900 mb-3">{question}</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        {getFAQAnswer(topic, index)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Related Topics */}
                {relatedTopics.length > 0 && (
                    <section className="py-20 bg-white border-t border-slate-100">
                        <div className="container mx-auto px-6">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Related Topics</h2>
                                <Link href="/learn" className="text-indigo-600 hover:underline font-medium flex items-center gap-2">
                                    View all topics
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedTopics.map((relatedTopic) => {
                                    const relatedCategoryStyle = categoryColors[relatedTopic.category] || categoryColors['Mathematics']
                                    const RelatedIconComponent = iconMap[relatedTopic.icon] || BookOpen

                                    return (
                                        <Link key={relatedTopic.slug} href={`/learn/${relatedTopic.slug}`}>
                                            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-slate-200">
                                                <CardContent className="p-6">
                                                    <div className={`p-3 rounded-xl ${relatedCategoryStyle.bgLight} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                                        <RelatedIconComponent className={`w-6 h-6 ${relatedCategoryStyle.text}`} />
                                                    </div>
                                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors text-slate-900">
                                                        {relatedTopic.name}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm line-clamp-2">
                                                        {relatedTopic.description}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Internal Links Section */}
                <section className="py-16 bg-slate-50 border-t border-slate-100">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold mb-8 text-slate-900">Explore ThoughtMap</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <Link href="/demo" className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                    <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Try the Demo</h3>
                                    <p className="text-slate-500 text-sm">Experience AI-powered learning before signing up.</p>
                                </Link>
                                <Link href="/signup" className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                    <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Create Free Account</h3>
                                    <p className="text-slate-500 text-sm">Start learning {topic.name.toLowerCase()} with AI today.</p>
                                </Link>
                                <Link href="/blog" className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                    <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Learning Science Blog</h3>
                                    <p className="text-slate-500 text-sm">Discover evidence-based study techniques.</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={`py-24 bg-gradient-to-br ${categoryStyle.bgLight}`}>
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className={`w-20 h-20 rounded-2xl ${categoryStyle.bgLight} border-4 border-white shadow-lg flex items-center justify-center mx-auto`}>
                                <IconComponent className={`w-10 h-10 ${categoryStyle.text}`} />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                                Ready to Master {topic.name}?
                            </h2>
                            <p className="text-xl text-slate-500 font-medium">
                                Join thousands of learners who are exploring {topic.name.toLowerCase()} with AI-powered conversations.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                                <Link href="/signup">
                                    <Button size="lg" className={`rounded-full px-10 bg-gradient-to-r ${categoryStyle.gradient} hover:opacity-90`}>
                                        Start Learning Free
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

// Helper function to generate FAQ answers based on topic
function getFAQAnswer(topic: LearningTopic, index: number): string {
    const genericAnswers = [
        `ThoughtMap's AI tutor can help you understand this ${topic.name.toLowerCase()} concept through personalized explanations. Simply ask your question and the AI will break it down step by step, adapting to your current knowledge level.`,
        `With AI-powered learning, you can explore ${topic.name.toLowerCase()} at your own pace. The platform offers interactive explanations, practice problems, and the ability to dive deeper into any concept that interests you.`,
        `Our ${topic.category.toLowerCase()} learning modules use advanced AI to provide clear, concise explanations tailored to your learning style. Start with the fundamentals and progress to advanced topics as you build confidence.`,
        `ThoughtMap makes learning ${topic.name.toLowerCase()} accessible for everyone, from beginners to advanced learners. The AI adapts its explanations based on your questions and progress.`
    ]
    return genericAnswers[index % genericAnswers.length]
}
