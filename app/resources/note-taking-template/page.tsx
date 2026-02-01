import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Brain, Layers, CheckCircle, ArrowRight, Download, Sparkles, BookOpen, PenTool } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import { Metadata } from "next"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Note Taking Template', url: '/resources/note-taking-template' },
])

const faqs = [
    {
        question: "What is the Cornell note-taking method?",
        answer: "The Cornell note-taking method is a systematic format for organizing notes developed at Cornell University. It divides the page into three sections: a narrow left column for cues and questions, a wider right column for notes, and a bottom section for summaries. Our AI-enhanced template builds on this proven method with additional prompts for deeper learning."
    },
    {
        question: "How does AI enhance note-taking?",
        answer: "Our AI-powered note-taking template includes prompts that encourage active learning, such as generating questions from your notes, identifying key concepts, and creating connections between ideas. When used with ThoughtMap, you can have AI-assisted review sessions that help you understand and retain information better."
    },
    {
        question: "Is this note-taking template free?",
        answer: "Yes, our AI-powered note-taking template is completely free to download. Create a free ThoughtMap account to access the full template in multiple formats including PDF, Word, and Google Docs."
    },
    {
        question: "Can I use this template for digital note-taking?",
        answer: "Absolutely! Our template is designed for both digital and physical use. It works great with tablet apps like Notability, GoodNotes, or OneNote, as well as traditional pen and paper. The digital version includes interactive elements for tracking and reviewing."
    },
    {
        question: "What subjects is this template best for?",
        answer: "Our note-taking template is versatile and works for any subject. The Cornell method and AI prompts are particularly effective for lecture-based learning, reading assignments, and self-study. The structured format helps organize information from any discipline, from sciences to humanities."
    },
    {
        question: "How do I review notes effectively with this template?",
        answer: "The template includes a built-in review system. Cover the notes section and use the cue column to test yourself. The AI prompts guide you to create questions, summaries, and connections that make review sessions more effective. Combined with ThoughtMap's spaced repetition features, you can maximize long-term retention."
    }
]

const faqSchema = generateFAQSchema(faqs)

export const metadata: Metadata = generateSEOMetadata({
    title: "AI-Powered Note Taking Template - Organize Your Learning",
    description: "Download our free AI-powered note-taking template based on the Cornell method. Organize your study notes effectively with structured sections, AI prompts, and review systems for better retention.",
    keywords: [
        "note taking template",
        "study notes template",
        "Cornell notes template AI",
        "note-taking system",
        "lecture notes template",
        "study notes organizer",
        "Cornell method template",
        "AI note taking",
        "digital note template",
        "note taking PDF",
        "student notes template",
        "effective note taking"
    ],
    url: "/resources/note-taking-template"
})

export default function NoteTakingTemplatePage() {
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
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-50 via-white to-slate-50" />
            <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <PublicHeader currentPage="resources" />

            <main>
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 pt-32">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <Link href="/resources" className="text-indigo-600 hover:underline text-sm">Resources</Link>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-600 text-sm">Note Taking Template</span>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                    Free Template
                                </span>
                                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight text-slate-900">
                                    AI-Powered Note Taking Template - Organize Your Learning
                                </h1>
                                <p className="text-xl text-slate-600 leading-relaxed">
                                    Transform how you capture and retain information with our AI-enhanced Cornell notes template.
                                    Designed for students and lifelong learners who want to make every study session count.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button size="lg" className="rounded-full px-8 text-lg h-14" asChild>
                                        <Link href="/signup?redirect=%2Fresources%2Fdownload%3Fid%3Dnote-taking-template">
                                            <Download className="mr-2 h-5 w-5" />
                                            Download Free Template
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" className="rounded-full px-8 text-lg h-14" asChild>
                                        <Link href="/demo">Try ThoughtMap</Link>
                                    </Button>
                                </div>
                            </div>
                            {/* Template Preview Placeholder */}
                            <div className="relative">
                                <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-6 aspect-[3/4]">
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-purple-600" />
                                                <span className="font-semibold">Cornell Notes</span>
                                            </div>
                                            <span className="text-sm text-slate-500">Date: ___</span>
                                        </div>
                                        <div className="text-xs text-slate-600 mb-2">Topic: _________________</div>
                                        <div className="flex-1 flex gap-3">
                                            <div className="w-1/3 border-r border-slate-200 pr-3">
                                                <div className="text-xs font-medium text-purple-600 mb-2">Cues & Questions</div>
                                                <div className="space-y-2">
                                                    <div className="h-2 bg-purple-100 rounded w-full"></div>
                                                    <div className="h-2 bg-purple-100 rounded w-3/4"></div>
                                                    <div className="h-2 bg-purple-100 rounded w-5/6"></div>
                                                </div>
                                                <div className="mt-4 p-2 bg-purple-50 rounded text-[8px] text-purple-700">
                                                    AI Prompt: What are 3 key questions?
                                                </div>
                                            </div>
                                            <div className="w-2/3">
                                                <div className="text-xs font-medium text-slate-600 mb-2">Notes</div>
                                                <div className="space-y-2">
                                                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                                                    <div className="h-2 bg-slate-100 rounded w-11/12"></div>
                                                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                                                    <div className="h-2 bg-slate-100 rounded w-4/5"></div>
                                                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                                                    <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-200">
                                            <div className="text-xs font-medium text-emerald-600 mb-2">Summary</div>
                                            <div className="space-y-1">
                                                <div className="h-2 bg-emerald-100 rounded w-full"></div>
                                                <div className="h-2 bg-emerald-100 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                                    Preview Only
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="bg-white py-20 border-y border-slate-200">
                    <div className="container mx-auto px-6">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Why Use Our AI-Powered Note Taking Template?</h2>
                            <p className="text-lg text-slate-600">
                                Traditional note-taking often leads to passive copying. Our template transforms note-taking
                                into an active learning process that dramatically improves comprehension and retention.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                    <Layers className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Structured Format</h3>
                                <p className="text-slate-600 text-sm">
                                    The Cornell method divides your page into strategic sections that promote organization
                                    and make review sessions more effective.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                    <Brain className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Active Recall</h3>
                                <p className="text-slate-600 text-sm">
                                    Built-in cue columns and question prompts encourage you to engage with material actively,
                                    strengthening memory pathways.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <PenTool className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Summarization</h3>
                                <p className="text-slate-600 text-sm">
                                    The summary section forces you to synthesize information in your own words, a proven
                                    technique for deeper understanding.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">AI Enhancement</h3>
                                <p className="text-slate-600 text-sm">
                                    Unique AI prompts guide you to ask better questions, make connections, and use
                                    ThoughtMap for intelligent review sessions.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How to Use Section */}
                <section className="container mx-auto px-6 py-20">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">How to Use This Note Taking Template</h2>
                        <div className="space-y-8">
                            <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
                                Effective note-taking is a skill that can be learned. Our AI-powered template guides you
                                through a proven process that transforms passive listening into active learning. Here is
                                how to maximize your notes:
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">1</div>
                                        <h3 className="font-semibold text-lg">During the Lecture or Reading</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Use the main notes section (right column) to capture key information. Do not try to write
                                        everything verbatim. Instead, focus on main ideas, examples, and concepts. Use abbreviations
                                        and your own shorthand. Leave the cue column blank for now. This allows you to focus fully
                                        on understanding the material as it is presented.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                                        <h3 className="font-semibold text-lg">Shortly After (Within 24 Hours)</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Review your notes while the information is still fresh. Fill in the cue column with questions,
                                        keywords, and prompts. Our AI prompt section guides you to generate meaningful questions that
                                        test your understanding. This is when the real learning happens. This review session typically
                                        takes 10-15 minutes but significantly improves retention.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                                        <h3 className="font-semibold text-lg">Write Your Summary</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Use the bottom section to write a brief summary in your own words. This synthesis process
                                        is crucial for moving information from short-term to long-term memory. Aim for 2-3 sentences
                                        that capture the essence of the material. If you struggle to summarize, that is a sign you
                                        need to review the material more deeply.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">4</div>
                                        <h3 className="font-semibold text-lg">Review with Active Recall</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        During study sessions, cover the notes column and use only the cues to test yourself.
                                        This active recall practice is one of the most effective learning techniques known to
                                        cognitive science. Use ThoughtMap to explore questions further and deepen your understanding
                                        with AI-assisted conversations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features List */}
                <section className="bg-secondary/30 py-20">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-center mb-12">What is Included in the Template</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    "Cornell format with three strategic sections",
                                    "AI-powered question generation prompts",
                                    "Summary writing guides",
                                    "Color-coded organization system",
                                    "Review tracking checkboxes",
                                    "Space for concept connections",
                                    "ThoughtMap integration prompts",
                                    "Spaced repetition schedule",
                                    "Multiple format options (PDF, Word, Digital)",
                                    "Both portrait and landscape layouts"
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                        <span className="text-slate-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Science Behind It */}
                <section className="container mx-auto px-6 py-20">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8">The Science Behind Effective Note-Taking</h2>
                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                Research in cognitive psychology has consistently shown that how you take notes matters as much
                                as what you write down. The Cornell method, developed in the 1950s by Walter Pauk at Cornell
                                University, was designed specifically to optimize learning and retention.
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                Studies show that students who use structured note-taking methods like Cornell outperform those
                                who take traditional linear notes. This is because the method incorporates several proven learning
                                principles: elaborative interrogation (the cue column questions), summarization (the bottom section),
                                and distributed practice (the built-in review system).
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Our AI enhancement takes this further by prompting you to make connections across topics, generate
                                higher-order questions, and use tools like ThoughtMap for deeper exploration. This combination of
                                time-tested methods with modern AI creates a powerful learning system that adapts to how your
                                brain actually works.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-white py-20 border-t border-slate-200">
                    <div className="container mx-auto px-6">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                            <div className="space-y-6">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                                        <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Resources */}
                <section className="container mx-auto px-6 py-20">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <BookOpen className="h-6 w-6 text-indigo-600" />
                            <h2 className="text-2xl font-bold">Related Resources</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Link href="/resources/study-schedule-template" className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Study Schedule Template</h3>
                                <p className="text-muted-foreground text-sm">Plan your learning journey with our comprehensive weekly study planner.</p>
                            </Link>
                            <Link href="/resources/exam-prep-checklist" className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Exam Preparation Checklist</h3>
                                <p className="text-muted-foreground text-sm">Never miss a topic with our comprehensive exam prep checklist.</p>
                            </Link>
                        </div>
                        <div className="mt-6 text-center">
                            <Link href="/resources" className="inline-flex items-center gap-2 text-indigo-600 hover:underline font-medium">
                                View all resources
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-6 py-32 text-center">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl font-bold">Ready to transform your note-taking?</h2>
                        <p className="text-xl text-slate-600">
                            Download the free AI-powered note taking template and start learning more effectively today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="rounded-full px-12 text-lg h-14" asChild>
                                <Link href="/signup?redirect=%2Fresources%2Fdownload%3Fid%3Dnote-taking-template">
                                    <Download className="mr-2 h-5 w-5" />
                                    Download Free Template
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="rounded-full px-12 text-lg h-14" asChild>
                                <Link href="/pricing">View ThoughtMap Plans</Link>
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
