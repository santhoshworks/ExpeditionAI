import Link from "next/link"
import { Metadata } from "next"
import { CTAButton } from "@/components/ui/cta-button"
import { PublicHeader } from "@/components/layout/public-header"
import { SITE_CONFIG } from "@/lib/config"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import {
    Sparkles,
    ArrowRight,
    BookOpen,
    FileText,
    Download,
    Zap,
    PenTool,
    Layers,
    Share2,
    RefreshCw,
    Network,
    ChevronDown,
    FileDown,
    Printer,
    Cloud,
    CheckCircle,
    Clock,
    Brain
} from "lucide-react"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'AI Learning Journals', url: '/features/journals' },
])

const FAQ_DATA = [
    {
        question: "What is an AI learning journal?",
        answer: "An AI learning journal is an automatically generated summary of your learning sessions. As you explore topics through conversations with AI tutors, the system synthesizes key concepts, important facts, and insights into a comprehensive document. It is like having a personal note-taker that never misses anything important."
    },
    {
        question: "How are the auto-generated study notes created?",
        answer: "Our AI note taking system analyzes all your conversation trails within an expedition. It identifies key topics, extracts important information, recognizes relationships between concepts, and organizes everything into a logical structure. The result is comprehensive study notes that capture your entire learning journey."
    },
    {
        question: "Can I edit the generated journals?",
        answer: "Yes! The AI-generated journals serve as a starting point. You can edit, add personal notes, highlight sections, and reorganize content to match your study preferences. Think of it as a first draft that you can refine to your liking."
    },
    {
        question: "What export formats are supported?",
        answer: "You can export your learning journals in multiple formats including PDF for printing and sharing, Markdown for use in other note-taking apps, and plain text. We are also working on integration with popular note-taking apps like Notion and Obsidian."
    },
    {
        question: "Does the journal update as I learn more?",
        answer: "Absolutely! Your learning journal grows and evolves as you continue your expedition. New conversations and trails are automatically incorporated, and the AI updates the structure to maintain a coherent narrative of your learning progress."
    },
    {
        question: "Can I create journals from specific trails only?",
        answer: "Yes, you have full control over what goes into your journal. You can generate a journal from a single trail, multiple selected trails, or your entire expedition. This flexibility allows you to create focused study notes for specific topics."
    }
]

const faqSchema = generateFAQSchema(FAQ_DATA)

export const metadata: Metadata = generateSEOMetadata({
    title: "AI Learning Journals - Auto-Generated Study Notes",
    description: "Transform your learning sessions into comprehensive study notes automatically. Our AI learning journal synthesizes conversations into organized documentation. Export auto-generated study notes as PDF or Markdown.",
    keywords: [
        "AI learning journal",
        "auto-generated study notes",
        "AI note taking",
        "automatic note generator",
        "AI study notes",
        "learning documentation",
        "conversation summarizer",
        "AI journal generator",
        "smart note taking",
        "automated study notes",
        "learning summary AI",
        "knowledge documentation"
    ],
    url: "/features/journals"
})

export default function JournalsPage() {
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
                                <BookOpen className="w-4 h-4" />
                                <span>AI-Powered Documentation</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                                Auto-generated study notes,{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                                    zero effort required.
                                </span>
                            </h1>

                            <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                                Our AI learning journal transforms your conversations into comprehensive, exportable documentation. Every insight, every concept, every discovery is automatically captured and organized into beautiful study notes you can reference forever.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-10">
                                        Start Generating Notes
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </CTAButton>
                                </Link>
                                <Link href="/demo">
                                    <CTAButton variant="outline" size="xl" className="px-10">
                                        See Example Journal
                                    </CTAButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid Section */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Features</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Your personal AI note taking assistant
                            </h3>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Stop worrying about taking notes while learning. Focus entirely on understanding concepts while our AI captures everything important for you.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Feature 1 */}
                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Intelligent Synthesis</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    The AI does not just copy your conversations. It synthesizes information across all your trails to create coherent, well-structured notes that connect related concepts together.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <RefreshCw className="w-7 h-7 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Real-Time Updates</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Your learning journal grows as you learn. New conversations are automatically incorporated, keeping your documentation current without any manual effort.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Layers className="w-7 h-7 text-purple-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Organization</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    The AI automatically organizes content into logical sections with headers, bullet points, and highlighted key terms. No messy stream-of-consciousness notes.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <PenTool className="w-7 h-7 text-orange-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Fully Editable</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Treat the AI-generated journal as a starting point. Add your own notes, highlight important sections, and customize the content to match your learning style.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Share2 className="w-7 h-7 text-blue-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Easy Sharing</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Share your learning journals with classmates, study groups, or colleagues. Export in multiple formats suitable for different platforms and use cases.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
                                <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Brain className="w-7 h-7 text-pink-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Context Preservation</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Unlike regular notes, AI journals preserve the context of how concepts connect. See the relationships between ideas in your learning journey.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Export Options Section */}
                <section className="py-24 bg-slate-50 relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Export Options</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Take your notes anywhere
                            </h3>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Your auto-generated study notes are not locked in. Export them in the format that works best for your workflow and study habits.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {/* PDF Export */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileDown className="w-8 h-8 text-red-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">PDF Export</h4>
                                <p className="text-slate-500 text-sm">
                                    Beautiful, print-ready documents perfect for studying offline or sharing with instructors.
                                </p>
                            </div>

                            {/* Markdown Export */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Markdown</h4>
                                <p className="text-slate-500 text-sm">
                                    Import into Obsidian, Notion, or any Markdown-compatible app for seamless integration.
                                </p>
                            </div>

                            {/* Print Ready */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Printer className="w-8 h-8 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Print Ready</h4>
                                <p className="text-slate-500 text-sm">
                                    Optimized layouts for printing physical copies of your study notes.
                                </p>
                            </div>

                            {/* Cloud Sync */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Cloud className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Cloud Sync</h4>
                                <p className="text-slate-500 text-sm">
                                    Access your journals from any device. Your notes are always backed up and available.
                                </p>
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
                                From conversation to documentation
                            </h3>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-8">
                                {/* Step 1 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-indigo-200">
                                        1
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Start Your Learning Expedition</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            Begin exploring any topic through natural conversation with AI tutors. Ask questions, dive into subtopics, and follow your curiosity without worrying about taking notes. The system is quietly observing and understanding your learning journey.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-indigo-200">
                                        2
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">AI Processes Your Trails</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            As you explore different trails and topics, our AI note taking system analyzes the content. It identifies key concepts, extracts important facts, recognizes relationships between ideas, and builds a comprehensive understanding of what you have learned.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-indigo-200">
                                        3
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Generate Your Learning Journal</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            With one click, the AI generates a beautifully formatted learning journal. Your auto-generated study notes include organized sections, highlighted key terms, concept relationships, and a logical flow that makes reviewing easy.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-indigo-200">
                                        4
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-xl font-bold text-slate-900 mb-2">Export and Study</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            Export your journal in your preferred format. Use it for revision, share with study partners, or import into your favorite note-taking app. Your learning is now documented and accessible forever.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-slate-50 relative">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Why AI Journals</h2>
                                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                                        Focus on learning, not note-taking
                                    </h3>
                                    <p className="text-lg text-slate-500 leading-relaxed">
                                        Traditional note-taking splits your attention between understanding and documenting. With AI learning journals, you can be fully present in your learning while the system handles documentation.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Never Miss Important Details</h4>
                                            <p className="text-slate-500 text-sm">The AI captures everything, including points you might have skipped over.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Better Organization Than Manual Notes</h4>
                                            <p className="text-slate-500 text-sm">AI creates logical structures that would take hours to organize manually.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Save Hours of Review Time</h4>
                                            <p className="text-slate-500 text-sm">Well-organized notes mean faster revision and better retention.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Consistent Quality Every Time</h4>
                                            <p className="text-slate-500 text-sm">No more rushed or incomplete notes from busy learning sessions.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Learning Journal Preview</h4>
                                            <p className="text-xs text-slate-400">Auto-generated from your expedition</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <h5 className="font-bold text-slate-800 mb-1">1. Core Concepts</h5>
                                            <p className="text-slate-500 pl-4 border-l-2 border-indigo-200">Key foundational ideas extracted from your conversations...</p>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 mb-1">2. Key Relationships</h5>
                                            <p className="text-slate-500 pl-4 border-l-2 border-indigo-200">How different concepts connect and influence each other...</p>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 mb-1">3. Important Details</h5>
                                            <p className="text-slate-500 pl-4 border-l-2 border-indigo-200">Specific facts, figures, and examples discussed...</p>
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 mb-1">4. Summary</h5>
                                            <p className="text-slate-500 pl-4 border-l-2 border-indigo-200">A concise overview of your learning journey...</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <div className="flex-1 bg-slate-100 rounded-lg py-2 px-3 text-center text-xs font-medium text-slate-600">
                                            <Download className="w-4 h-4 inline mr-1" /> Export PDF
                                        </div>
                                        <div className="flex-1 bg-slate-100 rounded-lg py-2 px-3 text-center text-xs font-medium text-slate-600">
                                            <FileText className="w-4 h-4 inline mr-1" /> Export MD
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">FAQ</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Frequently asked questions
                            </h3>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {FAQ_DATA.map((faq, index) => (
                                <details key={index} className="group bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
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
                <section className="py-24 bg-slate-50 relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Learn More</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                                Related resources
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <Link href="/blog/spaced-repetition-guide" className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Spaced Repetition Guide</h4>
                                <p className="text-slate-500 text-sm">Learn how to use your journals for effective spaced repetition study.</p>
                            </Link>
                            <Link href="/features/ai-quiz" className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">AI Quiz Generator</h4>
                                <p className="text-slate-500 text-sm">Test your knowledge with AI-generated quizzes from your learning.</p>
                            </Link>
                            <Link href="/features/trail-branching" className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Branching Learning Paths</h4>
                                <p className="text-slate-500 text-sm">Explore topics non-linearly and create comprehensive journals.</p>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-white relative">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                                Start generating your <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">learning journals</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 font-medium">
                                Learn any topic and let our AI create comprehensive, exportable study notes automatically.
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
