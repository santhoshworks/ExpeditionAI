import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Target, CheckCircle, ArrowRight, Download, Sparkles, BookOpen, BarChart } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import { Metadata } from "next"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Study Schedule Template', url: '/resources/study-schedule-template' },
])

const faqs = [
    {
        question: "What is a study schedule template?",
        answer: "A study schedule template is a pre-designed planning tool that helps you organize your study time effectively. It includes time blocks for different subjects, break periods, and goal-setting sections. Our template is designed based on learning science principles to maximize retention and minimize burnout."
    },
    {
        question: "How do I use the weekly study planner?",
        answer: "Start by listing all subjects or topics you need to study. Then allocate time blocks based on difficulty and importance. Our template includes built-in prompts for setting daily goals, tracking progress, and scheduling regular review sessions using spaced repetition principles."
    },
    {
        question: "Is this study schedule template free to download?",
        answer: "Yes, our study schedule template is completely free. Simply create a free ThoughtMap account to access the full downloadable version. No credit card required."
    },
    {
        question: "Can I customize the study schedule template?",
        answer: "Absolutely! Our template is available in multiple formats (PDF, Excel, Google Sheets) and is fully customizable. You can adjust time blocks, add custom subjects, and modify the layout to fit your personal study style."
    },
    {
        question: "What makes this study planner different from others?",
        answer: "Our study schedule template incorporates AI-enhanced prompts and is built on proven learning science. It includes sections for active recall practice, spaced repetition scheduling, and integrates seamlessly with ThoughtMap's AI-powered learning platform for a complete study solution."
    },
    {
        question: "How can a study schedule improve my exam preparation?",
        answer: "A well-structured study schedule helps you cover all topics systematically, prevents last-minute cramming, and ensures adequate time for review. Research shows that distributed practice (spreading study over time) significantly improves long-term retention compared to massed practice."
    }
]

const faqSchema = generateFAQSchema(faqs)

export const metadata: Metadata = generateSEOMetadata({
    title: "Free Study Schedule Template - Plan Your Learning",
    description: "Download our free study schedule template to organize your learning. Our weekly study planner helps you create an effective exam preparation schedule with time blocking and goal tracking.",
    keywords: [
        "study schedule template",
        "weekly study planner",
        "exam preparation schedule",
        "study timetable template",
        "study planner free download",
        "weekly study schedule",
        "exam study plan",
        "study time management",
        "academic planner template",
        "student schedule template",
        "study calendar template",
        "revision timetable"
    ],
    url: "/resources/study-schedule-template"
})

export default function StudyScheduleTemplatePage() {
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

            <PublicHeader currentPage="resources" />

            <main>
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 pt-32">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <Link href="/resources" className="text-indigo-600 hover:underline text-sm">Resources</Link>
                            <span className="text-slate-400">/</span>
                            <span className="text-slate-600 text-sm">Study Schedule Template</span>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                    Free Template
                                </span>
                                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight text-slate-900">
                                    Free Study Schedule Template - Plan Your Learning Journey
                                </h1>
                                <p className="text-xl text-slate-600 leading-relaxed">
                                    Take control of your study time with our comprehensive weekly study planner.
                                    Designed for students, exam preparation, and lifelong learners who want to maximize their learning efficiency.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button size="lg" className="rounded-full px-8 text-lg h-14" asChild>
                                        <Link href="/signup?redirect=/resources/download?id=study-schedule-template">
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
                                <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-6 aspect-[4/3]">
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-indigo-600" />
                                                <span className="font-semibold">Weekly Study Schedule</span>
                                            </div>
                                            <span className="text-sm text-slate-500">Week of ___</span>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 flex-1">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                                <div key={day} className="text-center">
                                                    <div className="text-xs font-medium text-slate-600 mb-2">{day}</div>
                                                    <div className="space-y-1">
                                                        <div className="h-4 bg-indigo-100 rounded text-[8px] flex items-center justify-center text-indigo-700">9-10</div>
                                                        <div className="h-4 bg-purple-100 rounded text-[8px] flex items-center justify-center text-purple-700">10-11</div>
                                                        <div className="h-4 bg-emerald-100 rounded text-[8px] flex items-center justify-center text-emerald-700">11-12</div>
                                                        <div className="h-4 bg-slate-100 rounded text-[8px] flex items-center justify-center text-slate-500">Break</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <div className="text-xs text-slate-500">Goals for this week:</div>
                                            <div className="flex gap-2 mt-2">
                                                <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                                                <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                                                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
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
                            <h2 className="text-3xl font-bold mb-4">Why Use Our Study Schedule Template?</h2>
                            <p className="text-lg text-slate-600">
                                Our free study schedule template is more than just a calendar. It is a complete learning
                                organization system designed to help you study smarter, not harder.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Time Blocking</h3>
                                <p className="text-slate-600 text-sm">
                                    Pre-designed time blocks help you allocate focused study periods with built-in breaks
                                    to prevent burnout and maintain concentration.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                    <Target className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Goal Setting</h3>
                                <p className="text-slate-600 text-sm">
                                    Daily and weekly goal sections keep you focused on what matters most. Track your
                                    progress and celebrate achievements.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <BarChart className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Progress Tracking</h3>
                                <p className="text-slate-600 text-sm">
                                    Visual progress indicators help you see how much you have covered and what still
                                    needs attention before your exam.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">AI-Enhanced</h3>
                                <p className="text-slate-600 text-sm">
                                    Includes prompts for AI-assisted review sessions using ThoughtMap to deepen your
                                    understanding of complex topics.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How to Use Section */}
                <section className="container mx-auto px-6 py-20">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">How to Use This Study Schedule Template</h2>
                        <div className="space-y-8">
                            <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto">
                                Creating an effective study schedule is one of the most impactful things you can do for your
                                academic success. Here is how to get the most out of our free weekly study planner:
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
                                        <h3 className="font-semibold text-lg">Assess Your Current Workload</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Before filling in the template, list all subjects, assignments, and exams you need to prepare for.
                                        Understanding the full scope of your study requirements is essential for creating a realistic schedule
                                        that you can actually stick to throughout the semester.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
                                        <h3 className="font-semibold text-lg">Prioritize by Difficulty</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Schedule your most challenging subjects during your peak energy hours. For most students, this is
                                        in the morning. Use the color-coding system in our template to categorize subjects by difficulty
                                        level and ensure you are tackling hard topics when you are most alert.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">3</div>
                                        <h3 className="font-semibold text-lg">Include Regular Breaks</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Our template includes built-in break periods based on the Pomodoro Technique. Research shows that
                                        taking regular breaks improves focus and retention. Do not skip these breaks thinking you will
                                        study more effectively. Your brain needs rest to consolidate information.
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">4</div>
                                        <h3 className="font-semibold text-lg">Schedule Review Sessions</h3>
                                    </div>
                                    <p className="text-slate-600">
                                        Use our spaced repetition prompts to schedule review sessions at optimal intervals. The template
                                        includes a built-in review tracker that helps you revisit material at 1 day, 3 days, 1 week, and
                                        2 week intervals for maximum long-term retention.
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
                                    "Weekly calendar with hourly time blocks",
                                    "Daily goal-setting sections",
                                    "Subject priority matrix",
                                    "Spaced repetition review tracker",
                                    "Break time reminders",
                                    "Weekly reflection prompts",
                                    "Exam countdown tracker",
                                    "AI study session prompts",
                                    "Progress visualization charts",
                                    "Customizable color-coding system"
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

                {/* FAQ Section */}
                <section className="container mx-auto px-6 py-20">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 border border-slate-200">
                                    <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Related Resources */}
                <section className="bg-white py-20 border-t border-slate-200">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-3 mb-8">
                                <BookOpen className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-2xl font-bold">Related Resources</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Link href="/resources/note-taking-template" className="group p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                                    <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">AI-Powered Note Taking Template</h3>
                                    <p className="text-muted-foreground text-sm">Organize your learning with our structured note-taking system.</p>
                                </Link>
                                <Link href="/resources/exam-prep-checklist" className="group p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
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
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-6 py-32 text-center">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl font-bold">Ready to organize your study time?</h2>
                        <p className="text-xl text-slate-600">
                            Download the free study schedule template and start planning your path to academic success.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="rounded-full px-12 text-lg h-14" asChild>
                                <Link href="/signup?redirect=/resources/download?id=study-schedule-template">
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
