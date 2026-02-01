export interface Testimonial {
    name: string
    role: string
    company?: string
    avatar?: string
    rating: number
    quote: string
    date: string
}

export const TESTIMONIALS: Testimonial[] = [
    {
        name: "Sarah Chen",
        role: "Graduate Student",
        company: "Stanford University",
        rating: 5,
        quote: "ThoughtMap completely changed how I approach research. The branching conversations help me explore complex topics without losing my train of thought. I went from drowning in tabs to having a clear visual map of my research journey.",
        date: "2026-01-15"
    },
    {
        name: "Marcus Rodriguez",
        role: "Software Engineer",
        company: "Tech Startup",
        rating: 5,
        quote: "As someone who's constantly learning new technologies, ThoughtMap is a game-changer. The AI-powered quizzes help me retain information better than any other tool I've used. Highly recommended for self-directed learners.",
        date: "2026-01-10"
    },
    {
        name: "Dr. Emily Watson",
        role: "Research Scientist",
        company: "MIT",
        rating: 5,
        quote: "The ability to branch off into related topics while keeping the main thread intact is exactly what I needed for my interdisciplinary research. ThoughtMap understands how real learning works.",
        date: "2026-01-08"
    },
    {
        name: "James Park",
        role: "Medical Student",
        company: "Johns Hopkins University",
        rating: 5,
        quote: "Studying for medical exams used to be overwhelming. ThoughtMap's quiz generator and knowledge mapping helped me connect concepts I was struggling with. My retention improved dramatically.",
        date: "2026-01-05"
    },
    {
        name: "Aisha Patel",
        role: "High School Teacher",
        company: "Boston Public Schools",
        rating: 4,
        quote: "I use ThoughtMap to prepare lessons and explore new teaching approaches. The way it visualizes learning paths helps me understand how my students might approach complex subjects.",
        date: "2025-12-28"
    },
    {
        name: "David Kim",
        role: "Product Manager",
        company: "Fortune 500 Company",
        rating: 5,
        quote: "Whether I'm researching market trends or learning about new technologies, ThoughtMap keeps me organized. The AI conversations feel natural and the branching feature is incredibly intuitive.",
        date: "2025-12-20"
    },
    {
        name: "Lisa Thompson",
        role: "Freelance Writer",
        rating: 5,
        quote: "Research for my articles used to take days. With ThoughtMap, I can explore topics deeply and organize my findings visually. It's become an essential part of my writing workflow.",
        date: "2025-12-15"
    },
    {
        name: "Robert Okonkwo",
        role: "PhD Candidate",
        company: "Oxford University",
        rating: 5,
        quote: "The learning journals feature is perfect for tracking my dissertation research. I can revisit my thought process from months ago and pick up exactly where I left off.",
        date: "2025-12-10"
    },
    {
        name: "Maria Gonzalez",
        role: "Undergraduate Student",
        company: "UC Berkeley",
        rating: 5,
        quote: "Finally, a study tool that works the way my brain works! The branching conversations match how I naturally think about interconnected topics. My grades have improved significantly.",
        date: "2025-12-05"
    },
    {
        name: "Thomas Wright",
        role: "Lifelong Learner",
        rating: 4,
        quote: "At 65, I'm still curious about the world. ThoughtMap makes learning accessible and enjoyable. The AI explains complex topics at my pace, and I love seeing my learning journey mapped out visually.",
        date: "2025-11-28"
    }
]

// Helper function to calculate aggregate rating
export function getAggregateRating(testimonials: Testimonial[]): {
    ratingValue: number
    reviewCount: number
    bestRating: number
    worstRating: number
} {
    const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0)
    const averageRating = totalRating / testimonials.length

    return {
        ratingValue: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: testimonials.length,
        bestRating: 5,
        worstRating: 1
    }
}
