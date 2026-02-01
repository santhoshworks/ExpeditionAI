import Link from "next/link"
import { Metadata } from "next"
import { CTAButton } from "@/components/ui/cta-button"
import { PublicHeader } from "@/components/layout/public-header"
import { SITE_CONFIG } from "@/lib/config"
import { generateSEOMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo"
import {
    Sparkles,
    ArrowRight,
    GitBranch,
    Network,
    ChevronDown,
    Eye,
    Compass,
    Map,
    Waypoints,
    TreePine,
    Lightbulb,
    Zap,
    Target,
    CheckCircle,
    GraduationCap,
    BookOpen,
    Users,
    Briefcase,
    FlaskConical,
    Code
} from "lucide-react"

const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Branching Learning Paths', url: '/features/trail-branching' },
])

const FAQ_DATA = [
    {
        question: "What are branching learning paths?",
        answer: "Branching learning paths allow you to explore topics non-linearly, just like your brain naturally works. When you encounter an interesting subtopic during a conversation, you can branch off into a new trail to explore it deeply, then return to your main topic. This creates a tree-like structure of your learning journey that mirrors how knowledge actually connects."
    },
    {
        question: "How is this different from regular AI chat?",
        answer: "Regular AI chat is linear - you have one conversation thread that becomes increasingly long and loses context. With branching trails, each subtopic gets its own dedicated conversation. This means better context retention, organized learning, and the ability to explore tangential topics without derailing your main study session."
    },
    {
        question: "What is visual knowledge mapping?",
        answer: "Visual knowledge mapping shows your learning journey as an interactive tree or graph. You can see how different topics connect, navigate between branches, and get a birds-eye view of everything you have learned. This visualization helps identify knowledge gaps and reinforces the relationships between concepts."
    },
    {
        question: "Can I see how my topics connect to each other?",
        answer: "Yes! The visual map shows connections between trails and topics. You can see which concepts led to others, identify common themes across different branches, and understand the overall structure of the subject you are studying. This relational view dramatically improves comprehension and retention."
    },
    {
        question: "How many branches can I create?",
        answer: "There is no limit to the number of branches you can create. Your learning expedition can grow as large as the topic demands. The visual interface scales to handle complex topic trees with hundreds of branches while remaining easy to navigate."
    },
    {
        question: "Can I merge or reorganize branches?",
        answer: "Yes, you can reorganize your learning structure as needed. Move branches, mark key trails, and customize your expedition layout. This flexibility ensures your knowledge map reflects your understanding and serves as an effective study and reference tool."
    }
]

const faqSchema = generateFAQSchema(FAQ_DATA)

export const metadata: Metadata = generateSEOMetadata({
    title: "See How Everything Connects | Visual Learning Maps",
    description: "Understanding isn't linear. Explore how concepts connect, dive deeper where curious, and see the big picture of what you're learning.",
    keywords: [
        "visual learning",
        "concept maps",
        "how things connect",
        "understand relationships"
    ],
    url: "/features/trail-branching"
})

export default function TrailBranchingPage() {
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

            {/* Header */}
            <PublicHeader currentPage="features" />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-xs md:text-sm font-semibold tracking-wide uppercase animate-in fade-in slide-in-from-bottom-4">
                                <GitBranch className="w-4 h-4" />
                                <span>Non-Linear Learning</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[0.95] md:leading-[1.05]">
                                Learn the way your{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
                                    brain naturally thinks.
                                </span>
                            </h1>

                            <p className="text-base md:text-xl text-slate-500 max-w-3xl leading-relaxed font-medium">
                                Branching learning paths let you explore topics non-linearly, following your curiosity wherever it leads. Create visual knowledge maps that show how concepts connect, and build a deeper understanding through interconnected exploration.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-10">
                                        Start Exploring
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </CTAButton>
                                </Link>
                                <Link href="/demo">
                                    <CTAButton variant="outline" size="xl" className="px-10">
                                        See It In Action
                                    </CTAButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visual Explanation Section */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">How It Works</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Your knowledge, visualized
                            </h3>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Traditional learning is linear, but understanding is not. Visual knowledge mapping shows you the full picture of how topics interconnect.
                            </p>
                        </div>

                        {/* Visual Demo */}
                        <div className="max-w-5xl mx-auto mb-20">
                            <div className="bg-slate-100 rounded-3xl p-8 md:p-12 border border-slate-200">
                                {/* Simulated Trail Tree Visualization */}
                                <div className="relative">
                                    {/* Main Topic */}
                                    <div className="flex justify-center mb-8">
                                        <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200">
                                            Machine Learning
                                        </div>
                                    </div>

                                    {/* Branch Lines */}
                                    <div className="flex justify-center mb-4">
                                        <div className="w-px h-8 bg-indigo-300"></div>
                                    </div>

                                    {/* Second Level */}
                                    <div className="flex justify-center gap-4 md:gap-16 mb-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-4 bg-indigo-300"></div>
                                            <div className="bg-white border-2 border-indigo-300 px-4 py-2 rounded-lg font-medium text-sm shadow-sm">
                                                Neural Networks
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-4 bg-indigo-300"></div>
                                            <div className="bg-white border-2 border-indigo-300 px-4 py-2 rounded-lg font-medium text-sm shadow-sm">
                                                Supervised Learning
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-4 bg-indigo-300"></div>
                                            <div className="bg-white border-2 border-green-300 px-4 py-2 rounded-lg font-medium text-sm shadow-sm border-dashed">
                                                Reinforcement Learning
                                            </div>
                                        </div>
                                    </div>

                                    {/* Third Level */}
                                    <div className="flex justify-start md:ml-12 gap-4 md:gap-8 mb-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-4 bg-purple-300"></div>
                                            <div className="bg-white border-2 border-purple-300 px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm">
                                                Backpropagation
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-4 bg-purple-300"></div>
                                            <div className="bg-white border-2 border-purple-300 px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm">
                                                CNNs
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-4 bg-purple-300"></div>
                                            <div className="bg-white border-2 border-purple-300 px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm">
                                                Transformers
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-slate-200">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <div className="w-3 h-3 rounded bg-indigo-600"></div>
                                            <span>Main Topic</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <div className="w-3 h-3 rounded border-2 border-indigo-300"></div>
                                            <span>Explored Trail</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <div className="w-3 h-3 rounded border-2 border-dashed border-green-300"></div>
                                            <span>Active Trail</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Explanation Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
                                    <Eye className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900">See Connections</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    The visual map shows how every topic relates to others. Spot patterns and relationships you might have missed with linear learning.
                                </p>
                            </div>

                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                                    <Compass className="w-8 h-8 text-purple-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900">Navigate Freely</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    Jump between any trail instantly. Continue where you left off or explore a new branch. Your learning, your path.
                                </p>
                            </div>

                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                                    <Map className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900">Track Progress</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    See exactly what you have covered and what remains to explore. Identify knowledge gaps at a glance.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-slate-50 relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Benefits</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Why non-linear learning works better
                            </h3>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Research shows that connecting new information to existing knowledge dramatically improves retention and understanding. Branching paths make this natural.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* Benefit 1 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Waypoints className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Follow Your Curiosity</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            When something catches your interest, branch off and explore it immediately. No need to finish the current topic first or lose the thought. Your curiosity becomes a superpower.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit 2 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <TreePine className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Maintain Context</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            Each branch maintains its own context. Explore a tangent deeply without polluting your main learning thread. Return to find everything exactly as you left it.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit 3 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Lightbulb className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Build Mental Models</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            The visual structure mirrors how experts organize knowledge. You are not just learning facts - you are building the mental frameworks that enable deep understanding.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit 4 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Faster Recall</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            Information stored in connected networks is easier to retrieve. When you need a fact, you have multiple paths to find it through related concepts you remember.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit 5 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Target className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">Identify Gaps</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            The visual map makes knowledge gaps obvious. See which areas are deeply explored and which need more attention. Study strategically, not randomly.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Benefit 6 */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-6 h-6 text-pink-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">No More Tab Overload</h4>
                                        <p className="text-slate-500 leading-relaxed">
                                            Remember having 20 browser tabs open while researching? Branching trails replace that chaos with organized exploration. One expedition, all your learning.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases Section */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Use Cases</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Who benefits from branching paths?
                            </h3>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Whether you are a student, researcher, or lifelong learner, non-linear learning adapts to how you naturally explore ideas.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Students */}
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                    <GraduationCap className="w-7 h-7 text-blue-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Students</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Master complex subjects by exploring how topics interconnect. Build comprehensive understanding that goes beyond memorizing isolated facts.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Exam preparation with connected concepts
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Research paper exploration
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Understanding prerequisite chains
                                    </li>
                                </ul>
                            </div>

                            {/* Researchers */}
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                    <FlaskConical className="w-7 h-7 text-purple-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Researchers</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Map out complex domains and track your exploration of new fields. Document connections between papers, concepts, and findings.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Literature review organization
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Cross-discipline exploration
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Hypothesis development
                                    </li>
                                </ul>
                            </div>

                            {/* Professionals */}
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Briefcase className="w-7 h-7 text-orange-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Professionals</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Stay current in fast-moving fields by mapping out new technologies, frameworks, and best practices as they evolve.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Technology landscape mapping
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Skill development planning
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Industry trend analysis
                                    </li>
                                </ul>
                            </div>

                            {/* Developers */}
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Code className="w-7 h-7 text-green-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Developers</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Learn new frameworks, languages, and architectures by exploring how concepts build on each other.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Framework deep dives
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Architecture exploration
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Debugging investigation trails
                                    </li>
                                </ul>
                            </div>

                            {/* Educators */}
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                                    <BookOpen className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Educators</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Design curriculum by mapping subject domains. See how to sequence lessons based on concept dependencies.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Curriculum design
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Prerequisite mapping
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Student learning path design
                                    </li>
                                </ul>
                            </div>

                            {/* Teams */}
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Users className="w-7 h-7 text-pink-600" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Teams</h4>
                                <p className="text-slate-500 leading-relaxed mb-4">
                                    Build shared knowledge bases that capture collective learning and can be referenced by all team members.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Onboarding documentation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Domain knowledge capture
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Best practices library
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-slate-50 relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">FAQ</h2>
                            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Frequently asked questions
                            </h3>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {FAQ_DATA.map((faq, index) => (
                                <details key={index} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                    <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                                        <span>{faq.question}</span>
                                        <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="px-6 pb-6 text-slate-500 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Related Content Section */}
                <section className="py-24 bg-white relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Learn More</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                                Related resources
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            <Link href="/blog/active-learning-increases-retention" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">Active Learning Increases Retention</h4>
                                <p className="text-slate-500 text-sm">Why exploring connections beats passive reading for memory.</p>
                            </Link>
                            <Link href="/features/ai-quiz" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">AI Quiz Generator</h4>
                                <p className="text-slate-500 text-sm">Test your knowledge from any trail with AI-generated quizzes.</p>
                            </Link>
                            <Link href="/features/journals" className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                                <h4 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">AI Learning Journals</h4>
                                <p className="text-slate-500 text-sm">Auto-generate comprehensive notes from all your branches.</p>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-slate-50 relative">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                                Ready to explore <span className="text-indigo-600 underline underline-offset-8 decoration-indigo-200">without limits</span>?
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-500 font-medium">
                                Start your first expedition and experience the freedom of branching learning paths.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
                                <Link href="/signup">
                                    <CTAButton variant="primary" size="xl" className="px-12">
                                        Start Exploring Free
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </CTAButton>
                                </Link>
                                <Link href="/pricing">
                                    <CTAButton variant="ghost" size="xl">
                                        View Pricing
                                    </CTAButton>
                                </Link>
                            </div>
                            <p className="text-slate-400 font-medium text-sm">No credit card required</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-white pt-24 pb-12 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
                        <div className="md:col-span-4 space-y-8">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="bg-indigo-600 p-2 rounded-xl">
                                    <Network className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-2xl font-bold tracking-tighter">{SITE_CONFIG.name}</span>
                            </Link>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                The ultimate AI-powered learning platform for curious minds, students, and lifelong learners.
                            </p>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Features</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link href="/features/ai-quiz" className="hover:text-white transition-colors">AI Quiz Generator</Link></li>
                                <li><Link href="/features/journals" className="hover:text-white transition-colors">Learning Journals</Link></li>
                                <li><Link href="/features/trail-branching" className="hover:text-white transition-colors">Trail Branching</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Platform</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            </ul>
                        </div>

                        <div className="md:col-span-4 space-y-6">
                            <h4 className="text-lg font-bold mb-4">Questions?</h4>
                            <p className="text-slate-400 text-sm">Email us at support@thoughtmap.space</p>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-medium">
                        <p>2026 {SITE_CONFIG.name} Technologies Inc. Crafted for deep learners.</p>
                        <div className="flex gap-8">
                            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
