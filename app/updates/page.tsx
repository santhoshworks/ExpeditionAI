import Link from "next/link"
import { Metadata } from "next"
import { CTAButton } from "@/components/ui/cta-button"
import { PublicHeader } from "@/components/layout/public-header"
import { SITE_CONFIG } from "@/lib/config"
import { generateSEOMetadata, generateBreadcrumbSchema } from "@/lib/seo"
import { CHANGELOG, ChangelogEntry } from "@/lib/changelog"
import {
    Sparkles,
    ArrowRight,
    Zap,
    Wrench,
    Network,
    Bell,
    Calendar,
    Tag
} from "lucide-react"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Updates', url: '/updates' },
])

export const metadata: Metadata = generateSEOMetadata({
    title: "Product Updates & Changelog",
    description: "Stay up to date with the latest ThoughtMap features, improvements, and fixes. See what's new in our AI-powered learning platform.",
    keywords: [
        "ThoughtMap updates",
        "new features",
        "product changelog",
        "AI learning updates",
        "ThoughtMap release notes",
        "platform improvements",
        "product updates",
        "feature releases"
    ],
    url: "/updates"
})

function getTypeStyles(type: ChangelogEntry['type']) {
    switch (type) {
        case 'feature':
            return {
                bg: 'bg-indigo-100',
                text: 'text-indigo-700',
                border: 'border-indigo-200',
                icon: Sparkles,
                label: 'New Feature'
            }
        case 'improvement':
            return {
                bg: 'bg-emerald-100',
                text: 'text-emerald-700',
                border: 'border-emerald-200',
                icon: Zap,
                label: 'Improvement'
            }
        case 'fix':
            return {
                bg: 'bg-amber-100',
                text: 'text-amber-700',
                border: 'border-amber-200',
                icon: Wrench,
                label: 'Bug Fix'
            }
    }
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export default function UpdatesPage() {
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

            {/* Header */}
            <PublicHeader currentPage="resources" />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-16 lg:pt-44 lg:pb-24 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs md:text-sm font-semibold tracking-wide uppercase animate-in fade-in slide-in-from-bottom-4">
                                <Bell className="w-4 h-4" />
                                <span>Product Updates</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                                What&apos;s new in{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                                    ThoughtMap
                                </span>
                            </h1>

                            <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                                Stay up to date with the latest features, improvements, and fixes. We&apos;re constantly working to make your learning experience better.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section className="py-16 relative">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            {/* Timeline */}
                            <div className="relative">
                                {/* Vertical line */}
                                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent md:-translate-x-1/2" />

                                {/* Timeline entries */}
                                <div className="space-y-12">
                                    {CHANGELOG.map((entry, index) => {
                                        const typeStyles = getTypeStyles(entry.type)
                                        const TypeIcon = typeStyles.icon
                                        const isEven = index % 2 === 0

                                        return (
                                            <div
                                                key={entry.version}
                                                className={`relative flex flex-col md:flex-row gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                            >
                                                {/* Timeline dot */}
                                                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 -translate-x-[7px] md:-translate-x-1/2 z-10 shadow-lg shadow-indigo-200" />

                                                {/* Date - on opposite side */}
                                                <div className={`hidden md:flex md:w-1/2 ${isEven ? 'justify-end pr-12' : 'justify-start pl-12'}`}>
                                                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{formatDate(entry.date)}</span>
                                                    </div>
                                                </div>

                                                {/* Content card */}
                                                <div className={`ml-8 md:ml-0 md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12'}`}>
                                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all p-6 md:p-8">
                                                        {/* Mobile date */}
                                                        <div className="flex md:hidden items-center gap-2 text-slate-400 font-medium text-sm mb-4">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(entry.date)}</span>
                                                        </div>

                                                        {/* Header */}
                                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                                            {/* Version badge */}
                                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">
                                                                <Tag className="w-3.5 h-3.5" />
                                                                v{entry.version}
                                                            </div>

                                                            {/* Type badge */}
                                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${typeStyles.bg} ${typeStyles.text} text-sm font-semibold`}>
                                                                <TypeIcon className="w-3.5 h-3.5" />
                                                                {typeStyles.label}
                                                            </div>
                                                        </div>

                                                        {/* Title and description */}
                                                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                                                            {entry.title}
                                                        </h3>
                                                        <p className="text-slate-500 mb-6 leading-relaxed">
                                                            {entry.description}
                                                        </p>

                                                        {/* Changes list */}
                                                        <ul className="space-y-2">
                                                            {entry.changes.map((change, changeIndex) => (
                                                                <li key={changeIndex} className="flex items-start gap-3 text-slate-600">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                                                                    <span>{change}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Subscribe Section */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-6">
                        <div className="max-w-3xl mx-auto text-center space-y-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 mb-4">
                                <Bell className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                                Stay in the loop
                            </h2>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Get notified about new features, improvements, and tips to make the most of ThoughtMap. We only send updates that matter.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-10">
                                        Create Free Account
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </CTAButton>
                                </Link>
                                <Link href="/blog">
                                    <CTAButton variant="outline" size="xl" className="px-10">
                                        Read Our Blog
                                    </CTAButton>
                                </Link>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Join thousands of learners staying updated with ThoughtMap
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-slate-50 relative">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                                Ready to try the <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">latest features</span>?
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 font-medium">
                                Start your learning journey today and experience everything ThoughtMap has to offer.
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
                                <li><Link href="/updates" className="hover:text-white transition-colors">Updates</Link></li>
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
