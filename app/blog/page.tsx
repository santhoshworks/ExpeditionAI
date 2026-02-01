import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Network, ArrowRight, Calendar, User, Tag } from "lucide-react"
import { getAllBlogPosts } from "@/content/blog"
import { PublicHeader } from "@/components/layout/public-header"
import { generateSEOMetadata } from "@/lib/seo"
import { Metadata } from "next"

export const metadata: Metadata = generateSEOMetadata({
  title: "Learning Science Blog - Study Tips & AI Education Research",
  description: "Evidence-based study techniques, learning science research, and AI education insights. Expert tips to learn faster and retain more.",
  keywords: [
    "learning science blog",
    "educational technology insights",
    "AI in education",
    "study techniques",
    "personalized learning research",
    "educational psychology",
    "learning strategies",
    "AI tutoring insights",
    "educational innovation",
    "learning analytics"
  ],
  url: "/blog"
})

export default function BlogPage() {
  const posts = getAllBlogPosts()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50" />
      <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      {/* Header */}
      <PublicHeader currentPage="blog" />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
              Learning Science & Insights
            </h1>
            <p className="text-xl text-slate-500">
              Discover evidence-based study techniques, learning science research, and how AI is transforming the way we learn.
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-slate-200">
                  <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Network className="w-8 h-8 text-indigo-600" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <Tag className="w-4 h-4" />
                      <span>{post.category}</span>
                    </div>
                    <h2 className="text-xl font-semibold mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 text-slate-900">
                      {post.title}
                    </h2>
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {post.meta_description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 mt-24">
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-3xl p-12 text-center border border-indigo-100">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Ready to transform your learning?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Put these learning science principles into practice with ThoughtMap - the AI-powered platform that makes active learning effortless.
            </p>
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700">
                Start Exploring Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <Network className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">ThoughtMap</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            </div>
            <p>© 2026 ThoughtMap Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
