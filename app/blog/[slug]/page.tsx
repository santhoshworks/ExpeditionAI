import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Network, ArrowLeft, Calendar, User, Tag, ArrowRight } from "lucide-react"
import { getBlogPostBySlug, getAllBlogPosts, getRelatedPosts } from "@/content/blog"
import { Card, CardContent } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Metadata } from "next"
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo"

// Related Posts Component
function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const relatedPosts = getRelatedPosts(currentSlug, 3)

  if (relatedPosts.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-xs text-primary mb-2">
                  <Tag className="w-3 h-3" />
                  <span>{post.category}</span>
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.meta_description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const post = getBlogPostBySlug(resolvedParams.slug)

  if (!post) {
    return {
      title: "Post Not Found | ThoughtMap",
    }
  }

  return {
    title: `${post.title} | ThoughtMap Blog`,
    description: post.meta_description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.meta_description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params
  const post = getBlogPostBySlug(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  // Generate structured data schemas
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.meta_description,
    url: `/blog/${post.slug}`,
    datePublished: post.date,
    author: post.author,
    keywords: post.keywords,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm text-primary mb-4">
              <Tag className="w-4 h-4" />
              <span>{post.category}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Internal Links Section */}
          <div className="mt-12 p-6 bg-muted/30 rounded-xl border">
            <h3 className="font-semibold mb-3">Explore ThoughtMap</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/demo" className="text-sm text-primary hover:underline">Try the Demo</Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/pricing" className="text-sm text-primary hover:underline">View Pricing</Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/faq" className="text-sm text-primary hover:underline">FAQ</Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/about" className="text-sm text-primary hover:underline">About Us</Link>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to try active learning?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              ThoughtMap turns any topic into an interactive learning journey. Experience the science of active learning with AI-powered question trails.
            </p>
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8">
                Start Exploring Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Related Posts Section */}
          <RelatedPosts currentSlug={post.slug} />
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
            </div>
            <p>© 2026 ThoughtMap Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
