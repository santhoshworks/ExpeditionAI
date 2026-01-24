import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Compass, Target, Zap, Users } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Dynamic Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50" />
            <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <PublicHeader currentPage="about" />

            <main>
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 text-center space-y-8 pt-32">
                    <div className="inline-block p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                        <h2 className="text-indigo-600 font-semibold tracking-wider text-sm uppercase">Our Mission</h2>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl max-w-4xl mx-auto leading-tight text-slate-900">
                        Mapping the <span className="text-indigo-600 italic">human curiosity</span> path.
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        We believe that learning shouldn&apos;t be a linear list of search results.
                        It&apos;s a branching journey of discovery, where one concept naturally leads to another.
                    </p>
                </section>

                {/* Pillars */}
                <section className="container mx-auto px-4 py-20 grid md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Zap className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-bold">Focus on Discovery</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We built ExplorerAI to solve the &quot;tab overload&quot; problem. Instead of 20 open tabs,
                            you have one visual map of your thought process.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Target className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-bold">AI Autonomy</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We don&apos;t force you into one model. We give you the tools (and the map) to use
                            the best AI for the specific topic you&apos;re exploring.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-bold">Built for Learners</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Whether you&apos;re a student preparing for exams or a life-long learner,
                            our goal is to make deep diving into complex topics effortless.
                        </p>
                    </div>
                </section>

                {/* The Story */}
                <section className="bg-secondary/30 py-24">
                    <div className="container mx-auto px-4 max-w-3xl space-y-12">
                        <h2 className="text-3xl font-bold">The Story</h2>
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                            <p>
                                ExplorerAI started as a weekend experiment to visualize Wikipedia rabbit holes.
                                We realized that LLMs are incredible at explaining things, but they often
                                &quot;forget&quot; the context of how we got to a specific question.
                            </p>
                            <p>
                                By building a tool that treats conversations as a branching tree rather than
                                a linear chat, we found that people learned faster, retained more information,
                                and felt more in control of their learning journey.
                            </p>
                            <p>
                                Today, ExplorerAI is used by researchers, students, and curious minds
                                all over the world to map their path through the vast ocean of human knowledge.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="container mx-auto px-4 py-32 text-center">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl font-bold">Ready to start your first expedition?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="rounded-full px-12 text-lg h-14" asChild>
                                <Link href="/signup">Start Exploring Free</Link>
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
                    <p>© 2026 ExplorerAI. Designed for the curious.</p>
                </div>
            </footer>
        </div>
    )
}
