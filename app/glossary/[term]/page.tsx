import Link from "next/link"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Network, ArrowLeft, ArrowRight, BookOpen, Tag, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateSEOMetadata, generateDefinedTermSchema, generateBreadcrumbSchema } from "@/lib/seo"
import { getTermBySlug, getRelatedTerms, GLOSSARY_TERMS, type GlossaryTerm } from "@/lib/glossary"

interface TermPageProps {
    params: Promise<{ term: string }>
}

export async function generateStaticParams() {
    return GLOSSARY_TERMS.map((term) => ({
        term: term.slug,
    }))
}

export async function generateMetadata({ params }: TermPageProps): Promise<Metadata> {
    const resolvedParams = await params
    const term = getTermBySlug(resolvedParams.term)

    if (!term) {
        return {
            title: "Term Not Found | ThoughtMap Glossary",
        }
    }

    return generateSEOMetadata({
        title: `${term.term} - Definition & Meaning`,
        description: `What is ${term.term}? ${term.definition.substring(0, 150)}...`,
        keywords: [
            `what is ${term.term.toLowerCase()}`,
            `${term.term.toLowerCase()} definition`,
            `${term.term.toLowerCase()} meaning`,
            `${term.term.toLowerCase()} explained`,
            term.category.toLowerCase(),
            'learning terms',
            'educational glossary',
        ],
        url: `/glossary/${term.slug}`
    })
}

const categoryColors: Record<string, string> = {
    'Learning Science': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'AI & Technology': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'Study Techniques': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'Education': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
}

// Map terms to related blog posts and features
function getRelatedContent(term: GlossaryTerm): { type: 'blog' | 'feature'; title: string; url: string }[] {
    const content: { type: 'blog' | 'feature'; title: string; url: string }[] = []

    // Map certain terms to relevant pages
    const termMappings: Record<string, { type: 'blog' | 'feature'; title: string; url: string }[]> = {
        'spaced-repetition': [
            { type: 'blog', title: 'Science of Active Learning', url: '/blog/science-of-active-learning' },
            { type: 'feature', title: 'Learning Journal', url: '/#features' },
        ],
        'active-recall': [
            { type: 'blog', title: 'Science of Active Learning', url: '/blog/science-of-active-learning' },
            { type: 'feature', title: 'Trivia Quizzes', url: '/#features' },
        ],
        'branching-learning': [
            { type: 'feature', title: 'Branching Trails', url: '/#features' },
            { type: 'feature', title: 'Try the Demo', url: '/demo' },
        ],
        'knowledge-mapping': [
            { type: 'feature', title: 'Visual Mind Maps', url: '/#features' },
            { type: 'feature', title: 'Expeditions', url: '/#features' },
        ],
        'large-language-model': [
            { type: 'feature', title: '300+ AI Models', url: '/#features' },
            { type: 'feature', title: 'Try the Demo', url: '/demo' },
        ],
        'ai-tutor': [
            { type: 'feature', title: 'AI Conversations', url: '/#features' },
            { type: 'feature', title: 'Try the Demo', url: '/demo' },
        ],
        'personalized-learning': [
            { type: 'feature', title: 'Personalized Expeditions', url: '/#features' },
            { type: 'blog', title: 'Science of Active Learning', url: '/blog/science-of-active-learning' },
        ],
    }

    return termMappings[term.slug] || [
        { type: 'feature', title: 'Explore ThoughtMap Features', url: '/#features' },
    ]
}

export default async function TermPage({ params }: TermPageProps) {
    const resolvedParams = await params
    const term = getTermBySlug(resolvedParams.term)

    if (!term) {
        notFound()
    }

    const relatedTerms = getRelatedTerms(term.slug)
    const relatedContent = getRelatedContent(term)

    // Generate structured data
    const definedTermSchema = generateDefinedTermSchema(
        term.term,
        term.definition,
        `/glossary/${term.slug}`
    )

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Glossary', url: '/glossary' },
        { name: term.term, url: `/glossary/${term.slug}` },
    ])

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Navbar */}
            <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Network className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">ThoughtMap</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                        <Link href="/#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">Use Cases</Link>
                        <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                        <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                        <Link href="/glossary" className="text-foreground transition-colors">Glossary</Link>
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

            <main className="pt-32 pb-20">
                <article className="container mx-auto px-4 max-w-4xl">
                    {/* Back Link */}
                    <Link
                        href="/glossary"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Glossary
                    </Link>

                    {/* Term Header */}
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge variant="outline" className={categoryColors[term.category]}>
                                {term.category}
                            </Badge>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                            {term.term}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Definition and meaning in learning science and education
                        </p>
                    </header>

                    {/* Definition */}
                    <section className="mb-12">
                        <div className="bg-muted/30 rounded-xl p-6 md:p-8 border">
                            <div className="flex items-center gap-2 text-primary mb-4">
                                <BookOpen className="w-5 h-5" />
                                <span className="font-medium">Definition</span>
                            </div>
                            <p className="text-lg leading-relaxed">
                                {term.definition}
                            </p>
                        </div>
                    </section>

                    {/* Key Takeaways */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">Key Points</h2>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                    {term.term} is a core concept in {term.category.toLowerCase()}.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                    Understanding this concept can improve your learning effectiveness.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                    ThoughtMap applies these principles to help you learn more efficiently.
                                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Related Terms */}
                    {relatedTerms.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">Related Terms</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {relatedTerms.map(related => (
                                    <Link key={related.slug} href={`/glossary/${related.slug}`}>
                                        <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                            {related.term}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                            {related.definition.substring(0, 100)}...
                                                        </p>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Related Content */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">Learn More</h2>
                        <div className="grid gap-3">
                            {relatedContent.map((content, index) => (
                                <Link
                                    key={index}
                                    href={content.url}
                                    className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary/30 hover:bg-muted/30 transition-all group"
                                >
                                    {content.type === 'blog' ? (
                                        <Tag className="w-4 h-4 text-primary" />
                                    ) : (
                                        <ExternalLink className="w-4 h-4 text-primary" />
                                    )}
                                    <span className="group-hover:text-primary transition-colors">{content.title}</span>
                                    <Badge variant="outline" className="ml-auto text-xs">
                                        {content.type === 'blog' ? 'Blog Post' : 'Feature'}
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Internal Links Section */}
                    <div className="p-6 bg-muted/30 rounded-xl border mb-12">
                        <h3 className="font-semibold mb-3">Explore ThoughtMap</h3>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/demo" className="text-sm text-primary hover:underline">Try the Demo</Link>
                            <span className="text-muted-foreground">-</span>
                            <Link href="/pricing" className="text-sm text-primary hover:underline">View Pricing</Link>
                            <span className="text-muted-foreground">-</span>
                            <Link href="/faq" className="text-sm text-primary hover:underline">FAQ</Link>
                            <span className="text-muted-foreground">-</span>
                            <Link href="/about" className="text-sm text-primary hover:underline">About Us</Link>
                            <span className="text-muted-foreground">-</span>
                            <Link href="/blog" className="text-sm text-primary hover:underline">Blog</Link>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Experience {term.term} in Action
                        </h2>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            ThoughtMap applies learning science principles like {term.term.toLowerCase()} to help you master any topic through AI-powered conversations and branching explorations.
                        </p>
                        <Link href="/signup">
                            <Button size="lg" className="rounded-full px-8">
                                Start Learning Free
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Network className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-semibold">ThoughtMap</span>
                        </div>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                            <Link href="/glossary" className="hover:text-foreground transition-colors">Glossary</Link>
                        </div>
                        <p>© 2026 ThoughtMap Inc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
