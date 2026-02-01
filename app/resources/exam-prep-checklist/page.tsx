import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckSquare, ListChecks, Clock, Target, CheckCircle, ArrowRight, Download, Sparkles, BookOpen, AlertTriangle } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import { Metadata } from "next"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Exam Preparation Checklist', url: '/resources/exam-prep-checklist' },
])

const faqs = [
    {
        question: "What is an exam preparation checklist?",
        answer: "An exam preparation checklist is a structured tool that helps you track all topics, materials, and tasks needed to prepare for an exam. It ensures comprehensive coverage of the syllabus and helps you identify gaps in your preparation before the test day."
    },
    {
        question: "When should I start using the exam prep checklist?",
        answer: "Ideally, start using the checklist as soon as you know your exam date. For major exams, begin at least 4-6 weeks in advance. For smaller tests, 1-2 weeks is usually sufficient. The earlier you start, the more time you have for spaced repetition and thorough review."
    },
    {
        question: "How do I prioritize topics on the checklist?",
        answer: "Our checklist includes a priority matrix that helps you rank topics by importance (how likely they are to appear on the exam) and difficulty (how much time you need to master them). Focus first on high-importance, high-difficulty topics, then work through other quadrants systematically."
    },
    {
        question: "Is this exam preparation checklist free?",
        answer: "Yes, our exam preparation checklist is completely free. Create a free ThoughtMap account to download the full checklist template in PDF, Excel, or printable format."
    },
    {
        question: "Can I customize the checklist for my specific exam?",
        answer: "Absolutely! The checklist is designed to be customizable. You can add your own topics, modify priority levels, set custom deadlines, and track progress in a way that fits your specific exam requirements. The template works for any subject or exam type."
    },
    {
        question: "How does this checklist work with ThoughtMap?",
        answer: "The checklist includes AI study prompts that you can use directly with ThoughtMap. For each topic on your checklist, use ThoughtMap to explore concepts deeper, generate practice questions, and test your understanding through AI-powered conversations."
    }
]

const faqSchema = generateFAQSchema(faqs)

export const metadata: Metadata = generateSEOMetadata({
    title: "Exam Preparation Checklist - Never Miss a Topic",
    description: "Download our free exam preparation checklist to ensure complete syllabus coverage. Track your study progress, prioritize topics, and never miss a key concept before your test with our comprehensive study checklist.",
    keywords: [
        "exam preparation checklist",
        "study checklist template",
        "test prep guide",
        "exam study checklist",
        "test preparation list",
        "exam revision checklist",
        "study progress tracker",
        "exam topic checklist",
        "test study plan",
        "finals preparation checklist",
        "exam review checklist",
        "study completion tracker"
    ],
    url: "/resources/exam-prep-checklist"
})

export default function ExamPrepChecklistPage() {
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
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-slate-50" />
            <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <PublicHeader currentPage="resources" />

            <main>
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 pt-32">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <Link href="/resources" className="text-indigo-600 hover:underline text-sm">Resources</Link>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-600 text-sm">Exam Preparation Checklist</span>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                    Free Tool
                                </span>
                                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight text-slate-900">
                                    Exam Preparation Checklist - Never Miss a Topic
                                </h1>
                                <p className="text-xl text-slate-600 leading-relaxed">
                                    Ensure complete syllabus coverage with our comprehensive exam prep checklist.
                                    Track progress, prioritize topics, and walk into every exam confident you have covered everything.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button size="lg" className="rounded-full px-8 text-lg h-14" asChild>
                                        <Link href="/signup?redirect=%2Fresources%2Fdownload%3Fid%3Dexam-prep-checklist">
                                            <Download className="mr-2 h-5 w-5" />
                                            Download Free Checklist
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" className="rounded-full px-8 text-lg h-14" asChild>
                                        <Link href="/demo">Try ThoughtMap</Link>
                                    </Button>
                                </div>
                            </div>
                            {/* Template Preview Placeholder */}
                            <div className="relative">
                                <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-6 aspect-[4/5]">
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                                            <div className="flex items-center gap-2">
                                                <CheckSquare className="h-5 w-5 text-emerald-600" />
                                                <span className="font-semibold">Exam Prep Checklist</span>
                                            </div>
                                            <span className="text-sm text-slate-500">Exam: ___</span>
                                        </div>
                                        <div className="text-xs text-slate-600 mb-4">Date: ___ | Days Until Exam: ___</div>

                                        <div className="flex-1 space-y-3">
                                            <div className="text-xs font-medium text-emerald-600 mb-2">Topics to Cover</div>
                                            {[
                                                { topic: "Chapter 1: Introduction", status: "done" },
                                                { topic: "Chapter 2: Core Concepts", status: "done" },
                                                { topic: "Chapter 3: Advanced Topics", status: "progress" },
                                                { topic: "Chapter 4: Applications", status: "pending" },
                                                { topic: "Chapter 5: Case Studies", status: "pending" },
                                                { topic: "Practice Problems Set 1", status: "done" },
                                                { topic: "Practice Problems Set 2", status: "pending" },
                                            ].map((item, index) => (
                                                <div key={index} className="flex items-center gap-2 text-[10px]">
                                                    <div className={`h-3 w-3 rounded border flex items-center justify-center ${
                                                        item.status === 'done' ? 'bg-emerald-500 border-emerald-500' :
                                                        item.status === 'progress' ? 'bg-yellow-500 border-yellow-500' :
                                                        'border-slate-300'
                                                    }`}>
                                                        {item.status === 'done' && <CheckCircle className="h-2 w-2 text-white" />}
                                                    </div>
                                                    <span className={item.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'}>
                                                        {item.topic}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-200">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Progress</span>
                                                <span className="text-emerald-600 font-medium">43% Complete</span>
                                            </div>
                                            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full w-[43%] bg-emerald-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
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
                            <h2 className="text-3xl font-bold mb-4">Why Use an Exam Preparation Checklist?</h2>
                            <p className="text-lg text-slate-600">
                                The anxiety of wondering if you have covered everything is one of the biggest stressors
                                during exam season. Our checklist eliminates that uncertainty and helps you study with confidence.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <ListChecks className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Complete Coverage</h3>
                                <p className="text-slate-600 text-sm">
                                    Systematically list every topic in your syllabus. Visual progress tracking ensures
                                    nothing falls through the cracks.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                    <Target className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Priority Matrix</h3>
                                <p className="text-slate-600 text-sm">
                                    Rank topics by importance and difficulty. Focus your limited time on what matters
                                    most for your exam success.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Time Management</h3>
                                <p className="text-slate-600 text-sm">
                                    Built-in time estimates help you plan realistic study sessions and avoid
                                    last-minute cramming panic.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">AI Study Prompts</h3>
                                <p className="text-slate-600 text-sm">
                                    Each topic includes AI prompts to use with ThoughtMap for deeper understanding
                                    and active recall practice.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How to Use Section */}
                <section className="container mx-auto px-6 py-20">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">How to Use This Exam Prep Checklist</h2>
                        <div className="space-y-8">
                            <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
                                A checklist is only as good as how you use it. Follow these steps to maximize your
                                exam preparation and walk into test day feeling confident and prepared.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">1</div>
                                        <h3 className="font-semibold text-lg">Gather All Materials</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Start by collecting your syllabus, lecture notes, textbooks, and any study guides provided
                                        by your instructor. Review past exams if available. The goal is to have a complete picture
                                        of everything that could potentially appear on your exam. This initial survey typically
                                        takes 30-60 minutes but saves hours of scattered studying later.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">2</div>
                                        <h3 className="font-semibold text-lg">Create Your Topic List</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Break down your syllabus into specific, checkable items. Instead of broad topics like
                                        &quot;Biology,&quot; list &quot;Cell Structure,&quot; &quot;Mitosis,&quot; &quot;Meiosis,&quot; etc. The more specific your list,
                                        the better you can track progress. Our template includes sections for main topics,
                                        subtopics, and related practice problems to ensure comprehensive coverage.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">3</div>
                                        <h3 className="font-semibold text-lg">Prioritize and Schedule</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Use our priority matrix to rank each topic. High-weight, difficult topics should be
                                        tackled first while you have the most energy and time. Assign realistic time estimates
                                        to each item. Be honest about how long topics really take. Most students underestimate
                                        by 50%, so build in buffer time for challenging areas.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">4</div>
                                        <h3 className="font-semibold text-lg">Track and Adjust</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Check off items as you complete them. The visual progress is motivating and helps
                                        reduce anxiety. If you fall behind, adjust your schedule. Use the &quot;needs review&quot; markers
                                        for topics you have covered but do not feel confident about. Before the exam, focus
                                        your final review on these flagged items and any unchecked high-priority topics.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tips Section */}
                <section className="bg-secondary/30 py-20">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold text-center mb-12">Exam Preparation Tips</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl p-6 border border-slate-200">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Start Early</h3>
                                            <p className="text-slate-600 text-sm">
                                                Begin your checklist at least 2 weeks before the exam. This allows time for
                                                spaced repetition, which dramatically improves long-term retention.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Use Active Recall</h3>
                                            <p className="text-slate-600 text-sm">
                                                Do not just re-read notes. Test yourself on each topic before checking it off.
                                                Use ThoughtMap to quiz yourself with AI-generated questions.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Include Practice Problems</h3>
                                            <p className="text-slate-600 text-sm">
                                                Add practice problems and past exam questions to your checklist.
                                                Completing these is often more valuable than re-reading content.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-slate-200">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Do Not Skip the Basics</h3>
                                            <p className="text-slate-600 text-sm">
                                                Easy topics are easy to neglect. Make sure to review them too. Exams
                                                often include foundational questions that trip up over-confident students.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features List */}
                <section className="container mx-auto px-6 py-20">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">What is Included in the Checklist</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                "Comprehensive topic tracking grid",
                                "Priority and difficulty matrix",
                                "Time estimation calculator",
                                "Progress visualization bar",
                                "Spaced repetition review dates",
                                "Practice problem tracker",
                                "Confidence level indicators",
                                "AI study prompt suggestions",
                                "Exam countdown timer section",
                                "Final review focus list"
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                    <span className="text-slate-700">{feature}</span>
                                </div>
                            ))}
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
                            <Link href="/resources/note-taking-template" className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">AI-Powered Note Taking Template</h3>
                                <p className="text-muted-foreground text-sm">Organize your learning with our structured note-taking system.</p>
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
                        <h2 className="text-4xl font-bold">Ready to ace your next exam?</h2>
                        <p className="text-xl text-slate-600">
                            Download the free exam preparation checklist and never miss a topic again.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="rounded-full px-12 text-lg h-14" asChild>
                                <Link href="/signup?redirect=%2Fresources%2Fdownload%3Fid%3Dexam-prep-checklist">
                                    <Download className="mr-2 h-5 w-5" />
                                    Download Free Checklist
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
