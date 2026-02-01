import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CTAButton } from "@/components/ui/cta-button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Microscope,
    Network,
    GitBranch,
    FileText,
    BookMarked,
    Search,
    ArrowRight,
    Star,
    CheckCircle2,
    Lightbulb,
    Library,
    Link2,
    ChevronDown,
    Download,
    Workflow,
    Database
} from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { SITE_CONFIG } from "@/lib/config"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import { Metadata } from "next"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'For Researchers', url: '/for-researchers' },
])

const researcherFAQs = [
    {
        question: "How does ThoughtMap help with literature reviews?",
        answer: "ThoughtMap transforms the literature review process from a linear slog into an organized exploration. Start with a key paper or concept, then branch out to explore related theories, methodologies, and findings. Our branching conversation model lets you dive deep into specific aspects while maintaining context of the broader research landscape. You can easily return to previous threads to explore alternative directions, and export your entire exploration as structured notes. Many researchers report completing literature reviews in half the time while discovering more relevant connections."
    },
    {
        question: "Can I use ThoughtMap for interdisciplinary research?",
        answer: "Absolutely! ThoughtMap excels at interdisciplinary work because our branching model naturally maps how concepts connect across fields. You can start exploring a topic in one discipline and branch into related concepts from other fields. With access to 300+ AI models, you can use models that are particularly strong in specific domains - for example, using Claude for nuanced humanities discussions and GPT-4 for technical scientific concepts within the same research expedition. The visual knowledge map helps you see and document cross-disciplinary connections."
    },
    {
        question: "How does the journal export feature work?",
        answer: "ThoughtMap allows you to export your learning trails and explorations in multiple formats suitable for academic work. You can export as structured markdown notes, which can be easily imported into reference managers or note-taking apps like Notion, Obsidian, or Roam. The export includes the hierarchical structure of your exploration, making it easy to trace how you arrived at specific insights. You can also export specific branches or entire expeditions, making it perfect for documenting your research process or creating annotated bibliographies."
    },
    {
        question: "What makes ThoughtMap different from using ChatGPT for research?",
        answer: "While ChatGPT is a single linear conversation, ThoughtMap provides a structured environment designed for deep research. Key differences include: (1) Branching conversations that let you explore multiple directions without losing context, (2) Visual knowledge mapping that shows how concepts relate, (3) Access to 300+ AI models so you can use the best tool for each aspect of your research, (4) Built-in organization with expeditions and trails that keep your research structured, (5) Export capabilities for academic workflows, and (6) The ability to return to any point in your exploration to branch in new directions. It's the difference between a notepad and a research workbench."
    },
    {
        question: "Is ThoughtMap suitable for graduate students and PhD candidates?",
        answer: "ThoughtMap is particularly valuable for graduate students and PhD candidates. For dissertation research, you can map out your entire field of study, explore theoretical frameworks, and document your intellectual journey. For qualifying exams, you can build comprehensive knowledge maps of your research area. Many PhD candidates use ThoughtMap for their literature reviews, theory building, and research synthesis. The ability to save and return to explorations means your research compounds over time rather than getting lost in scattered notes and forgotten conversations."
    }
]

const faqSchema = generateFAQSchema(researcherFAQs)

export const metadata: Metadata = generateSEOMetadata({
    title: "AI Research Assistant - Knowledge Mapping for Academics",
    description: "Accelerate your research with AI-powered knowledge mapping. ThoughtMap helps researchers conduct literature reviews, connect concepts across disciplines, and organize research with branching conversations and journal export.",
    keywords: [
        "AI research assistant",
        "knowledge mapping tool",
        "literature learning platform",
        "academic AI tool",
        "research organization software",
        "literature review assistant",
        "academic knowledge management",
        "research synthesis tool",
        "interdisciplinary research tool",
        "PhD research assistant",
        "academic writing assistant",
        "concept mapping for research",
        "research exploration tool",
        "scholarly research AI"
    ],
    url: "/for-researchers"
})

export default function ForResearchersPage() {
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
            <PublicHeader currentPage="for-researchers" />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs md:text-sm font-semibold tracking-wide uppercase animate-in fade-in slide-in-from-bottom-4">
                                <Microscope className="w-4 h-4" />
                                <span>Built for Researchers</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                                Map your research, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                                    not just your notes.
                                </span>
                            </h1>

                            <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                                ThoughtMap is the AI research assistant that helps academics explore ideas, conduct literature reviews, and synthesize knowledge through branching conversations. See how concepts connect and export structured insights for your papers.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-10">
                                        Start Exploring Free
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </CTAButton>
                                </Link>
                                <Link href="/demo">
                                    <CTAButton variant="outline" size="xl" className="px-10">
                                        See Research Demo
                                    </CTAButton>
                                </Link>
                            </div>

                            <p className="text-sm text-slate-400 font-medium">
                                No credit card required. Free plan includes 15 research trails/day.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Social Proof Stats */}
                <section className="py-16 bg-white border-y border-slate-100">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            <div className="text-center space-y-2">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600">5,000+</div>
                                <div className="text-sm text-slate-500 font-medium">Researchers</div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600">300+</div>
                                <div className="text-sm text-slate-500 font-medium">AI Models</div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600">50%</div>
                                <div className="text-sm text-slate-500 font-medium">Faster Reviews</div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600">100+</div>
                                <div className="text-sm text-slate-500 font-medium">Universities</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pain Points Section */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">The Research Challenge</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Common frustrations in academic research</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <Card className="bg-white border-slate-100 shadow-lg">
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                        <Library className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">Literature Review Overwhelm</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Hundreds of papers to read, countless tangents to explore. It's easy to lose the thread of your research question while drowning in literature.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-slate-100 shadow-lg">
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                                        <Link2 className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">Connecting Concepts</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        The best insights often come from connecting ideas across disciplines. But traditional tools make it hard to see and document these relationships.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-slate-100 shadow-lg">
                                <CardContent className="p-8 space-y-4">
                                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                                        <Database className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">Organizing Research</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Scattered notes in different apps, forgotten insights buried in chat logs. Research knowledge should compound, not dissipate.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Core Features Section */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Research Features</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Tools designed for academic exploration</h3>
                            <p className="text-lg text-slate-500">
                                ThoughtMap provides a structured environment for deep research, combining AI assistance with visual knowledge mapping.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Feature 1: Deep Dives */}
                            <div className="group p-8 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Search className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Deep Research Dives</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Explore any topic in depth without losing context. ThoughtMap maintains the thread of your research question while letting you dive into specific subtopics. Perfect for understanding complex theoretical frameworks or methodological approaches.
                                </p>
                                <Link href="/demo" className="inline-flex items-center text-indigo-600 font-semibold hover:underline">
                                    Try it now <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 2: Branching Trails */}
                            <div className="group p-8 bg-gradient-to-br from-violet-50 to-white rounded-2xl border border-violet-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <GitBranch className="w-7 h-7 text-violet-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Branching Research Trails</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Research rarely follows a straight line. Our branching conversation model lets you explore multiple directions from any point, then easily return to branch in new directions. Your research expedition becomes a visual map of related concepts and ideas.
                                </p>
                                <Link href="/features/expeditions" className="inline-flex items-center text-violet-600 font-semibold hover:underline">
                                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 3: Journal Export */}
                            <div className="group p-8 bg-gradient-to-br from-fuchsia-50 to-white rounded-2xl border border-fuchsia-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-fuchsia-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Download className="w-7 h-7 text-fuchsia-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Journal Export</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Export your research trails as structured markdown notes. Import into your preferred tools like Notion, Obsidian, or Roam. The hierarchical structure preserves how you arrived at insights, perfect for documenting your research process.
                                </p>
                                <Link href="/signup" className="inline-flex items-center text-fuchsia-600 font-semibold hover:underline">
                                    Get started <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 4: Knowledge Mapping */}
                            <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Network className="w-7 h-7 text-blue-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Visual Knowledge Maps</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    See your research as a connected graph of concepts. Identify relationships between ideas that might not be obvious in linear notes. Export your maps as visual documentation of your intellectual journey.
                                </p>
                                <Link href="/features/expeditions" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
                                    Explore feature <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 5: Multiple AI Models */}
                            <div className="group p-8 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Lightbulb className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">300+ AI Models</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Different research questions benefit from different AI strengths. Use Claude for nuanced analysis, GPT-4 for broad synthesis, or specialized models for domain-specific topics. All in one research environment.
                                </p>
                                <Link href="/pricing" className="inline-flex items-center text-emerald-600 font-semibold hover:underline">
                                    See all models <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>

                            {/* Feature 6: Research Expeditions */}
                            <div className="group p-8 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BookMarked className="w-7 h-7 text-amber-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Research Expeditions</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Organize your research by project with expeditions. Each expedition can contain multiple trails exploring different aspects of your research question. Build a comprehensive knowledge base over time.
                                </p>
                                <Link href="/features/expeditions" className="inline-flex items-center text-amber-600 font-semibold hover:underline">
                                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Research Workflow */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Research Workflow</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">How researchers use ThoughtMap</h3>
                        </div>

                        <div className="max-w-5xl mx-auto">
                            <div className="grid md:grid-cols-4 gap-8">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white text-2xl font-bold">1</div>
                                    <h4 className="text-lg font-bold text-slate-900">Start Your Expedition</h4>
                                    <p className="text-slate-500 leading-relaxed text-sm">
                                        Create a new expedition for your research project. Start with your central research question or a key concept you want to explore.
                                    </p>
                                </div>
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white text-2xl font-bold">2</div>
                                    <h4 className="text-lg font-bold text-slate-900">Explore & Branch</h4>
                                    <p className="text-slate-500 leading-relaxed text-sm">
                                        Ask questions, explore related concepts, and branch into new directions. Each trail captures a thread of exploration you can revisit.
                                    </p>
                                </div>
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white text-2xl font-bold">3</div>
                                    <h4 className="text-lg font-bold text-slate-900">Connect Ideas</h4>
                                    <p className="text-slate-500 leading-relaxed text-sm">
                                        See how concepts relate through your visual knowledge map. Identify cross-disciplinary connections and synthesis opportunities.
                                    </p>
                                </div>
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-white text-2xl font-bold">4</div>
                                    <h4 className="text-lg font-bold text-slate-900">Export & Write</h4>
                                    <p className="text-slate-500 leading-relaxed text-sm">
                                        Export structured notes for your paper. Your research trails become the foundation for literature reviews and theoretical frameworks.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Use Cases</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Built for every stage of research</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100">
                                <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                    <Library className="w-6 h-6 text-indigo-600" />
                                    Literature Reviews
                                </h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Conduct comprehensive literature reviews without losing your way. Start with key papers and branch out to explore related work, theoretical foundations, and methodological approaches. ThoughtMap helps you organize and synthesize the literature into a coherent narrative.
                                </p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                        <span>Explore related theories and frameworks</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                        <span>Track methodological approaches</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                        <span>Export as annotated bibliography</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-violet-50 to-white p-8 rounded-2xl border border-violet-100">
                                <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                    <Workflow className="w-6 h-6 text-violet-600" />
                                    Theory Building
                                </h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Develop and refine theoretical frameworks through structured exploration. Map out existing theories, identify gaps, and explore how new concepts might fill them. The visual nature of ThoughtMap helps you see theoretical relationships clearly.
                                </p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-violet-500" />
                                        <span>Map existing theoretical landscape</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-violet-500" />
                                        <span>Identify gaps and opportunities</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-violet-500" />
                                        <span>Document theoretical development</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-fuchsia-50 to-white p-8 rounded-2xl border border-fuchsia-100">
                                <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                    <Link2 className="w-6 h-6 text-fuchsia-600" />
                                    Interdisciplinary Research
                                </h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Connect insights across disciplines with ease. ThoughtMap's branching model naturally accommodates how interdisciplinary ideas connect. Use different AI models for different disciplinary perspectives.
                                </p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-fuchsia-500" />
                                        <span>Cross-disciplinary concept mapping</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-fuchsia-500" />
                                        <span>Multiple AI models for different fields</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-fuchsia-500" />
                                        <span>Document boundary-spanning insights</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-100">
                                <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-emerald-600" />
                                    Dissertation Research
                                </h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Build comprehensive knowledge in your research area over months and years. ThoughtMap preserves your intellectual journey, making it easy to return to previous explorations and build on past insights.
                                </p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span>Long-term research organization</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span>Comprehensive field mapping</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span>Qualifying exam preparation</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Researcher Stories</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Trusted by academics worldwide</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <Card className="bg-white border-slate-100 shadow-lg">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic">
                                        "ThoughtMap transformed my dissertation literature review. What would have taken months of scattered notes became an organized, explorable knowledge map. I could finally see how everything connected."
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                            DR
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">Dr. Rachel M.</div>
                                            <div className="text-sm text-slate-500">Sociology, Columbia</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-slate-100 shadow-lg">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic">
                                        "As an interdisciplinary researcher, I love being able to switch AI models based on the topic. Claude for philosophy, GPT-4 for technical concepts - all in one research environment."
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-violet-200 rounded-full flex items-center justify-center text-violet-700 font-bold">
                                            JK
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">James K., PhD</div>
                                            <div className="text-sm text-slate-500">Cognitive Science, Berkeley</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-slate-100 shadow-lg">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic">
                                        "The export feature is brilliant. My research trails become the foundation for my paper outlines. I can trace exactly how I developed my theoretical framework."
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-fuchsia-200 rounded-full flex items-center justify-center text-fuchsia-700 font-bold">
                                            LP
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">Dr. Lisa P.</div>
                                            <div className="text-sm text-slate-500">Management, Wharton</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Pricing Mention */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 text-white text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Researcher-Friendly Pricing</h2>
                            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                                No monthly subscriptions draining your research budget. Purchase credits once and use them as long as you need. Credits never expire.
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
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">Questions from researchers</h3>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-6">
                            {researcherFAQs.map((faq, index) => (
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
                            <p className="text-slate-500 mb-4">Have more questions about using ThoughtMap for research?</p>
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
                                Ready to transform your <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">research</span>?
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 font-medium">
                                Join 5,000+ researchers mapping knowledge more effectively with ThoughtMap.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-12">
                                        Start Exploring Free
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
                                The AI-powered knowledge mapping platform built for researchers who want to explore ideas more effectively.
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
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">For Researchers</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link href="/for-researchers" className="hover:text-white transition-colors">Research Features</Link></li>
                                <li><Link href="/features/expeditions" className="hover:text-white transition-colors">Knowledge Mapping</Link></li>
                                <li><Link href="/for-students" className="hover:text-white transition-colors">For Students</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-4 space-y-6">
                            <h4 className="text-lg font-bold mb-4">Questions?</h4>
                            <p className="text-slate-400 text-sm">Email us at support@thoughtmap.space</p>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-medium">
                        <p>© 2026 {SITE_CONFIG.name} Technologies Inc. Built for curious minds.</p>
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
