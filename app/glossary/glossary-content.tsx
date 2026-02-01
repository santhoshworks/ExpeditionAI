"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Network, Search, BookOpen, ArrowRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GlossaryTerm } from "@/lib/glossary"

interface GlossaryContentProps {
    terms: GlossaryTerm[]
    categories: GlossaryTerm['category'][]
}

export function GlossaryContent({ terms, categories }: GlossaryContentProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Filter terms based on search query and category
    const filteredTerms = useMemo(() => {
        return terms.filter(term => {
            const matchesSearch = searchQuery === "" ||
                term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                term.definition.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesCategory = selectedCategory === null ||
                term.category === selectedCategory

            return matchesSearch && matchesCategory
        })
    }, [terms, searchQuery, selectedCategory])

    // Group terms alphabetically
    const groupedTerms = useMemo(() => {
        const groups: Record<string, GlossaryTerm[]> = {}
        filteredTerms.forEach(term => {
            const letter = term.term[0].toUpperCase()
            if (!groups[letter]) {
                groups[letter] = []
            }
            groups[letter].push(term)
        })
        return groups
    }, [filteredTerms])

    const alphabet = Object.keys(groupedTerms).sort()

    const categoryColors: Record<string, string> = {
        'Learning Science': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        'AI & Technology': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        'Study Techniques': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
        'Education': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
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
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <BookOpen className="w-4 h-4" />
                            Educational Resource
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                            Learning & AI Glossary
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Explore key terms from learning science, educational technology, and artificial intelligence.
                            Build your vocabulary for effective learning.
                        </p>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-8 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search terms or definitions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 py-6 text-lg"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <Button
                                variant={selectedCategory === null ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                                className="rounded-full"
                            >
                                All Categories
                            </Button>
                            {categories.map(category => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category)}
                                    className="rounded-full"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Alphabet Navigation */}
                    {alphabet.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8 justify-center">
                            {alphabet.map(letter => (
                                <a
                                    key={letter}
                                    href={`#letter-${letter}`}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                                >
                                    {letter}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Terms List */}
                    {alphabet.length > 0 ? (
                        <div className="space-y-12">
                            {alphabet.map(letter => (
                                <section key={letter} id={`letter-${letter}`}>
                                    <h2 className="text-3xl font-bold mb-6 text-primary">{letter}</h2>
                                    <div className="grid gap-4">
                                        {groupedTerms[letter].map(term => (
                                            <Link key={term.slug} href={`/glossary/${term.slug}`}>
                                                <Card className="hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                                                        {term.term}
                                                                    </h3>
                                                                    <Badge variant="outline" className={categoryColors[term.category]}>
                                                                        {term.category}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-muted-foreground line-clamp-2">
                                                                    {term.definition}
                                                                </p>
                                                            </div>
                                                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-lg text-muted-foreground">
                                No terms found matching your search criteria.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("")
                                    setSelectedCategory(null)
                                }}
                                className="mt-4"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className="mt-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Put these concepts into practice</h2>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            ThoughtMap uses learning science principles like active recall and spaced repetition to help you master any topic through AI-powered conversations.
                        </p>
                        <Link href="/signup">
                            <Button size="lg" className="rounded-full px-8">
                                Start Learning Free
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Internal Links */}
                    <div className="mt-12 p-6 bg-muted/30 rounded-xl border">
                        <h3 className="font-semibold mb-3">Explore More</h3>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/blog" className="text-sm text-primary hover:underline">Read Our Blog</Link>
                            <span className="text-muted-foreground">-</span>
                            <Link href="/demo" className="text-sm text-primary hover:underline">Try the Demo</Link>
                            <span className="text-muted-foreground">-</span>
                            <Link href="/faq" className="text-sm text-primary hover:underline">FAQ</Link>
                            <span className="text-muted-foreground">-</span>
                            <Link href="/about" className="text-sm text-primary hover:underline">About ThoughtMap</Link>
                        </div>
                    </div>
                </div>
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
