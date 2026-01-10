import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Compass, Target, Zap, Users } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Compass className="h-5 w-5" />
                        <span>ExplorerAI</span>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="container mx-auto px-4 py-20 text-center space-y-8">
                    <div className="inline-block p-4 rounded-3xl bg-primary/5 border border-primary/10 mb-4">
                        <h2 className="text-primary font-semibold tracking-wider text-sm uppercase">Our Mission</h2>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl max-w-4xl mx-auto leading-tight">
                        Mapping the <span className="text-primary italic">human curiosity</span> path.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
