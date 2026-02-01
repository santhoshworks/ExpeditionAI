import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, CheckSquare, BookOpen, Download, ArrowRight, Sparkles } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { generateSEOMetadata, generateBreadcrumbSchema } from "@/lib/seo"
import { Metadata } from "next"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
])

export const metadata: Metadata = generateSEOMetadata({
    title: "Free Learning Resources & Study Templates",
    description: "Download free study templates, learning resources, and productivity tools. Get our study schedule template, note-taking templates, exam preparation checklists, and more to boost your learning efficiency.",
    keywords: [
        "free study templates",
        "learning resources",
        "study schedule template",
        "note-taking templates",
        "exam preparation resources",
        "study planner free",
        "learning tools",
        "student resources",
        "productivity templates",
        "study guides",
        "educational templates",
        "free learning materials"
    ],
    url: "/resources"
})

const resources = [
    {
        title: "Study Schedule Template",
        description: "Plan your learning journey with our comprehensive weekly study planner. Optimize your study time and never miss a deadline.",
        icon: Calendar,
        category: "Templates",
        href: "/resources/study-schedule-template",
        color: "indigo",
        popular: true,
    },
    {
        title: "AI-Powered Note Taking Template",
        description: "Organize your learning with our structured note-taking system. Combines Cornell method with AI-enhanced review prompts.",
        icon: FileText,
        category: "Templates",
        href: "/resources/note-taking-template",
        color: "purple",
        popular: true,
    },
    {
        title: "Exam Preparation Checklist",
        description: "Never miss a topic with our comprehensive exam prep checklist. Track your progress and ensure complete coverage.",
        icon: CheckSquare,
        category: "Tools",
        href: "/resources/exam-prep-checklist",
        color: "emerald",
        popular: false,
    },
]

const categories = [
    { name: "All Resources", count: 3 },
    { name: "Templates", count: 2 },
    { name: "Tools", count: 1 },
    { name: "Guides", count: 0 },
]

export default function ResourcesPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Dynamic Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50" />
            <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <PublicHeader currentPage="resources" />

            <main>
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 text-center space-y-8 pt-32">
                    <div className="inline-block p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                        <h2 className="text-indigo-600 font-semibold tracking-wider text-sm uppercase">Free Resources</h2>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl max-w-4xl mx-auto leading-tight text-slate-900">
                        Free Learning <span className="text-indigo-600 italic">Resources</span> & Study Templates
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Download our collection of free study templates, learning guides, and productivity tools.
                        Designed by educators and enhanced with AI insights to help you learn more effectively.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button size="lg" className="rounded-full px-8 text-lg h-14" asChild>
                            <Link href="#resources">
                                <Download className="mr-2 h-5 w-5" />
                                Browse Resources
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-full px-8 text-lg h-14" asChild>
                            <Link href="/demo">Try ThoughtMap Free</Link>
                        </Button>
                    </div>
                </section>

                {/* Why Free Resources Section */}
                <section className="bg-white py-20 border-y border-slate-200">
                    <div className="container mx-auto px-6">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Why We Offer Free Study Templates</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                At ThoughtMap, we believe everyone deserves access to quality learning tools. Our free study templates
                                and learning resources are designed to help students, professionals, and lifelong learners achieve
                                their educational goals without financial barriers.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center space-y-4">
                                <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                    <Sparkles className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-semibold">AI-Enhanced</h3>
                                <p className="text-slate-600">
                                    Our templates incorporate AI-powered prompts and suggestions to enhance your learning experience
                                    and improve information retention.
                                </p>
                            </div>
                            <div className="text-center space-y-4">
                                <div className="h-14 w-14 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                    <BookOpen className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-semibold">Research-Backed</h3>
                                <p className="text-slate-600">
                                    Every template is built on proven learning science principles including spaced repetition,
                                    active recall, and the Cornell note-taking method.
                                </p>
                            </div>
                            <div className="text-center space-y-4">
                                <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <Download className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-semibold">Instantly Downloadable</h3>
                                <p className="text-slate-600">
                                    Get immediate access to all our free resources. No credit card required. Just sign up and
                                    start improving your study habits today.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resource Grid */}
                <section id="resources" className="container mx-auto px-6 py-20">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar Categories */}
                        <aside className="lg:w-64 flex-shrink-0">
                            <h3 className="font-semibold text-lg mb-4">Categories</h3>
                            <nav className="space-y-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.name}
                                        className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-left hover:bg-slate-100 transition-colors"
                                    >
                                        <span>{category.name}</span>
                                        <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {category.count}
                                        </span>
                                    </button>
                                ))}
                            </nav>
                            <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <h4 className="font-semibold text-indigo-900 mb-2">Need More Tools?</h4>
                                <p className="text-sm text-indigo-700 mb-3">
                                    ThoughtMap offers AI-powered learning with 300+ models, personalized quizzes, and more.
                                </p>
                                <Link href="/pricing" className="text-sm font-medium text-indigo-600 hover:underline inline-flex items-center gap-1">
                                    View Plans <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </aside>

                        {/* Resource Cards */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold">All Free Resources</h2>
                                <span className="text-slate-500">{resources.length} resources available</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                {resources.map((resource) => {
                                    const IconComponent = resource.icon
                                    const colorClasses = {
                                        indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
                                        purple: "bg-purple-500/10 text-purple-600 border-purple-200",
                                        emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                                    }
                                    return (
                                        <Link
                                            key={resource.title}
                                            href={resource.href}
                                            className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all"
                                        >
                                            {resource.popular && (
                                                <span className="absolute -top-3 right-4 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                                                    Popular
                                                </span>
                                            )}
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[resource.color as keyof typeof colorClasses]}`}>
                                                <IconComponent className="h-6 w-6" />
                                            </div>
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                {resource.category}
                                            </span>
                                            <h3 className="text-xl font-semibold mt-1 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {resource.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                                {resource.description}
                                            </p>
                                            <span className="inline-flex items-center text-indigo-600 font-medium text-sm group-hover:gap-2 transition-all">
                                                Download Free <ArrowRight className="h-4 w-4 ml-1" />
                                            </span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How to Use Section */}
                <section className="bg-secondary/30 py-20">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <h2 className="text-3xl font-bold text-center mb-12">How to Use Our Free Study Templates</h2>
                        <div className="grid md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                    1
                                </div>
                                <h3 className="font-semibold mb-2">Choose a Template</h3>
                                <p className="text-sm text-slate-600">Browse our collection and select the resource that fits your needs.</p>
                            </div>
                            <div className="text-center">
                                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                    2
                                </div>
                                <h3 className="font-semibold mb-2">Create Free Account</h3>
                                <p className="text-sm text-slate-600">Sign up for free to access all downloadable resources instantly.</p>
                            </div>
                            <div className="text-center">
                                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                    3
                                </div>
                                <h3 className="font-semibold mb-2">Download & Customize</h3>
                                <p className="text-sm text-slate-600">Get your template and personalize it for your learning goals.</p>
                            </div>
                            <div className="text-center">
                                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                    4
                                </div>
                                <h3 className="font-semibold mb-2">Start Learning</h3>
                                <p className="text-sm text-slate-600">Use ThoughtMap to enhance your study sessions with AI assistance.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Blog Links Section */}
                <section className="container mx-auto px-6 py-20">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <BookOpen className="h-6 w-6 text-indigo-600" />
                            <h2 className="text-2xl font-bold">Learn More About Effective Studying</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Link href="/blog/active-learning-increases-retention" className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Active Learning Increases Retention</h3>
                                <p className="text-muted-foreground text-sm">Discover the science behind why active learning beats passive reading.</p>
                            </Link>
                            <Link href="/blog/spaced-repetition-guide" className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Spaced Repetition Guide</h3>
                                <p className="text-muted-foreground text-sm">Learn how to retain information longer with proven memory techniques.</p>
                            </Link>
                        </div>
                        <div className="mt-6 text-center">
                            <Link href="/blog" className="inline-flex items-center gap-2 text-indigo-600 hover:underline font-medium">
                                View all articles
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-6 py-32 text-center">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl font-bold">Ready to supercharge your learning?</h2>
                        <p className="text-xl text-slate-600">
                            Get access to all our free resources plus AI-powered learning tools with ThoughtMap.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="rounded-full px-12 text-lg h-14" asChild>
                                <Link href="/signup">Get Started Free</Link>
                            </Button>
                            <Button variant="outline" size="lg" className="rounded-full px-12 text-lg h-14" asChild>
                                <Link href="/pricing">View Plans</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t py-12">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; 2026 ThoughtMap. Designed for the curious.</p>
                </div>
            </footer>
        </div>
    )
}
