import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Quote, ArrowRight, Users } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"
import { generateSEOMetadata, generateBreadcrumbSchema, generateTestimonialsPageSchema } from "@/lib/seo"
import { TESTIMONIALS, getAggregateRating } from "@/lib/testimonials"
import { Metadata } from "next"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Reviews', url: '/testimonials' },
])

const aggregateRating = getAggregateRating(TESTIMONIALS)

const testimonialsSchema = generateTestimonialsPageSchema(
    TESTIMONIALS.map(t => ({
        author: t.name,
        reviewBody: t.quote,
        ratingValue: t.rating,
        datePublished: t.date
    })),
    aggregateRating
)

export const metadata: Metadata = generateSEOMetadata({
    title: "Customer Reviews & Testimonials",
    description: `Read what students, researchers, and professionals say about ThoughtMap. Rated ${aggregateRating.ratingValue} out of 5 based on ${aggregateRating.reviewCount} reviews. Discover why learners love our AI-powered platform.`,
    keywords: [
        "ThoughtMap reviews",
        "AI learning reviews",
        "student testimonials",
        "ThoughtMap testimonials",
        "learning platform reviews",
        "educational AI reviews",
        "study tool reviews",
        "ThoughtMap ratings",
        "AI tutor reviews",
        "online learning feedback"
    ],
    url: "/testimonials"
})

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-5 h-5 ${
                        star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                    }`}
                />
            ))}
        </div>
    )
}

function TestimonialCard({ testimonial }: { testimonial: typeof TESTIMONIALS[0] }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
            <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{testimonial.name}</h3>
                    <p className="text-sm text-slate-600">
                        {testimonial.role}
                        {testimonial.company && (
                            <span className="text-slate-400"> at {testimonial.company}</span>
                        )}
                    </p>
                </div>
            </div>

            <StarRating rating={testimonial.rating} />

            <div className="mt-4 relative">
                <Quote className="absolute -top-1 -left-1 w-6 h-6 text-indigo-100" />
                <p className="text-slate-600 leading-relaxed pl-4">
                    {testimonial.quote}
                </p>
            </div>

            <p className="mt-4 text-xs text-slate-400">
                {new Date(testimonial.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
            </p>
        </div>
    )
}

export default function TestimonialsPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(testimonialsSchema) }}
            />

            {/* Dynamic Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50" />
            <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <PublicHeader currentPage="testimonials" />

            <main>
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 text-center space-y-8 pt-32">
                    <div className="inline-block p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                        <h2 className="text-indigo-600 font-semibold tracking-wider text-sm uppercase">Customer Reviews</h2>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl max-w-4xl mx-auto leading-tight text-slate-900">
                        Loved by <span className="text-indigo-600 italic">learners</span> worldwide.
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        See what students, researchers, and professionals are saying about their learning journey with ThoughtMap.
                    </p>

                    {/* Overall Rating Display */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                        <div className="flex items-center gap-4 bg-white rounded-2xl px-8 py-6 shadow-lg border border-slate-200">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-slate-900">{aggregateRating.ratingValue}</div>
                                <div className="text-sm text-slate-500">out of 5</div>
                            </div>
                            <div className="border-l border-slate-200 pl-4">
                                <div className="flex gap-1 mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-6 h-6 ${
                                                star <= Math.round(aggregateRating.ratingValue)
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "fill-slate-200 text-slate-200"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600">
                                    Based on <span className="font-semibold">{aggregateRating.reviewCount}</span> reviews
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Users className="w-5 h-5 text-indigo-600" />
                            <span>Join thousands of satisfied learners</span>
                        </div>
                    </div>
                </section>

                {/* Rating Breakdown */}
                <section className="container mx-auto px-6 pb-12">
                    <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Rating Distribution</h3>
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = TESTIMONIALS.filter(t => t.rating === rating).length
                            const percentage = (count / TESTIMONIALS.length) * 100
                            return (
                                <div key={rating} className="flex items-center gap-3 mb-2">
                                    <span className="text-sm text-slate-600 w-6">{rating}</span>
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-500 w-8">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Testimonials Grid */}
                <section className="container mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((testimonial, index) => (
                            <TestimonialCard key={index} testimonial={testimonial} />
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-24">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-2xl mx-auto space-y-8">
                            <h2 className="text-4xl font-bold text-white">
                                Ready to transform your learning?
                            </h2>
                            <p className="text-xl text-indigo-100">
                                Join thousands of learners who have discovered a better way to explore knowledge.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="rounded-full px-12 text-lg h-14 bg-white text-indigo-600 hover:bg-indigo-50" asChild>
                                    <Link href="/signup">
                                        Start Learning Free
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-full px-12 text-lg h-14 border-white/30 text-white hover:bg-white/10" asChild>
                                    <Link href="/demo">Watch Demo</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t py-12 bg-white">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; 2026 ThoughtMap. Designed for the curious.</p>
                </div>
            </footer>
        </div>
    )
}
