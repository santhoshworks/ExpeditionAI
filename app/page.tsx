import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Network, Map, BookOpen, Share2, Sparkles, Brain, ArrowRight, CheckCircle2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Network className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">ExplorerAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">Use Cases</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 text-center lg:text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in-up">
                  <Sparkles className="w-4 h-4" />
                  <span>Now running with GPT-4 Omni</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                  Map Your <br />
                  <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-blue-600">
                    Curiosity
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Turn any topic into an interactive learning journey. ExplorerAI visualizes knowledge, connects concepts, and helps you master complex subjects faster.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-12 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                      Start Exploring Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="#demo" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full h-12 px-8 rounded-full text-lg hover:bg-muted/50">
                      View Demo
                    </Button>
                  </Link>
                </div>

                <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Free Forever plan users</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative w-full aspect-square lg:aspect-auto min-h-[400px] lg:h-[600px]">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50 bg-background/50 backdrop-blur-sm">
                  <Image
                    src="/images/hero_visualization.png"
                    alt="ExplorerAI Knowledge Graph Interface"
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-700"
                    priority
                  />

                  {/* Floating Elements for depth */}
                  <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-xl shadow-xl border border-border/50 hidden md:block animate-bounce-slow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">New Concept Linked</p>
                        <p className="text-xs text-muted-foreground">Neural Networks → Transformers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative background blur */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[100px] rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-8">TRUSTED BY INNOVATORS AT</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Using text placeholders as we don't have SVGs, normally this would be SVGs */}
              <span className="text-xl font-bold">ACME Corp</span>
              <span className="text-xl font-bold">Nebula Labs</span>
              <span className="text-xl font-bold">Vertex AI</span>
              <span className="text-xl font-bold">EduTech Global</span>
              <span className="text-xl font-bold">Future Systems</span>
            </div>
          </div>
        </section>

        {/* Feature Grid - Zig Zag */}
        <section id="features" className="py-24 space-y-24 container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">More than just a search bar.</h2>
            <p className="text-xl text-muted-foreground">ExplorerAI transforms linear information into a dynamic map of understanding.</p>
          </div>

          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Map className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold">Visual Knowledge Mapping</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Don&apos;t just read—visualize. Every query creates a node, and every follow-up branches out. See exactly how concepts connect and navigate your learning history spatially.
              </p>
              <ul className="space-y-3">
                {['Interactive Zoom & Pan', 'Auto-organized clusters', 'Persistent map history'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative h-[400px] w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-border/50 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                {/* Abstract Representation of Map UI */}
                <Image
                  src="/images/hero_visualization.png"
                  alt="Map Feature Interface"
                  fill
                  className="object-cover opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold">Automated Journaling</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Forget taking messy notes. ExplorerAI automatically synthesizes your entire session into a structured learning journal.
              </p>
              <ul className="space-y-3">
                {['Smart Summaries', 'Key Takeaways extraction', 'One-click PDF Export'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative h-[400px] w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-border/50 overflow-hidden shadow-2xl p-8 flex items-center justify-center">
              {/* Journal Graphic */}
              <div className="bg-background rounded-xl w-3/4 h-full shadow-lg p-6 space-y-4 border opacity-90 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted/50 rounded" />
                  <div className="h-3 w-full bg-muted/50 rounded" />
                  <div className="h-3 w-2/3 bg-muted/50 rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases / Student Image Section */}
        <section className="py-24 bg-muted/30 relative">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl overflow-hidden bg-background border shadow-2xl flex flex-col md:flex-row">
              <div className="md:w-1/2 relative min-h-[400px]">
                <Image
                  src="/images/student_using_app.png"
                  alt="Students collaborating"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-6">Built for the deepest divers</h2>
                <p className="text-muted-foreground mb-8">
                  Whether you&apos;re a PhD student mapping a thesis or a lifelong learner exploring history, ExplorerAI adapts to your depth.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card className="bg-transparent border-0 shadow-none">
                    <CardContent className="p-0">
                      <div className="font-bold text-xl mb-1">Researchers</div>
                      <p className="text-sm text-muted-foreground">Connect disparate papers and find hidden relationships.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-transparent border-0 shadow-none">
                    <CardContent className="p-0">
                      <div className="font-bold text-xl mb-1">Students</div>
                      <p className="text-sm text-muted-foreground">Turn heavy textbooks into navigable knowledge maps.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Finale */}
        <section className="py-32 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Ready to map your mind?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of explorers who have switched from linear searching to dimensional learning.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Get Started for Free
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">Free plan includes 50 queries/month. No credit card needed.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Network className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xl font-bold">ExplorerAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The world&apos;s first AI-powered knowledge cartographer.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t text-sm text-muted-foreground">
            <p>© 2026 ExplorerAI Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Share2 className="w-4 h-4 cursor-pointer hover:text-foreground" />
              <Map className="w-4 h-4 cursor-pointer hover:text-foreground" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
