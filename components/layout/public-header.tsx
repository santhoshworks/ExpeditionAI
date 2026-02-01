"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CTAButton } from "@/components/ui/cta-button"
import {
    Network,
    ArrowRight,
    Menu,
    X,
    ChevronDown,
    Sparkles,
    BookOpen,
    GitBranch,
    GraduationCap,
    FlaskConical,
    FileText,
    BookMarked,
    RefreshCw,
    MessageSquareQuote
} from "lucide-react"
import { SITE_CONFIG } from "@/lib/config"

// Navigation dropdown items
const featuresDropdown = [
    { href: "/features/ai-quiz", label: "AI Quiz Generator", icon: Sparkles, description: "Auto-generate quizzes" },
    { href: "/features/journals", label: "Learning Journals", icon: BookOpen, description: "AI-powered notes" },
    { href: "/features/trail-branching", label: "Trail Branching", icon: GitBranch, description: "Visual knowledge maps" },
]

const resourcesDropdown = [
    { href: "/learn", label: "Learn Topics", icon: BookMarked, description: "Explore any subject" },
    { href: "/resources", label: "Templates", icon: FileText, description: "Study resources" },
    { href: "/glossary", label: "Glossary", icon: BookOpen, description: "Terms explained" },
    { href: "/for-students", label: "For Students", icon: GraduationCap, description: "Student tools" },
    { href: "/for-researchers", label: "For Researchers", icon: FlaskConical, description: "Research tools" },
    { href: "/testimonials", label: "Reviews", icon: MessageSquareQuote, description: "Customer reviews" },
    { href: "/updates", label: "Updates", icon: RefreshCw, description: "What's new" },
]

interface DropdownProps {
    label: string
    items: typeof featuresDropdown
    currentPage?: string
}

function NavDropdown({ label, items, currentPage }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className={`flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${currentPage === label.toLowerCase() ? 'text-indigo-600 dark:text-indigo-400' : ''
                    }`}
            >
                {label}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 pt-2 w-64">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                    <item.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{item.label}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

interface PublicHeaderProps {
    currentPage?: string
}

export function PublicHeader({ currentPage }: PublicHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 overflow-visible ${scrolled
                ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-3 shadow-sm"
                : "bg-gradient-to-r from-white/80 via-white/90 to-white/80 dark:from-slate-950/80 dark:via-slate-950/90 dark:to-slate-950/80 backdrop-blur-xl py-5"
                }`}
        >
            {/* Subtle background pattern - only visible when not scrolled */}
            {!scrolled && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-violet-500/5 opacity-50" />
                    <div className="absolute inset-0 bg-journal-pattern opacity-20" />
                </>
            )}
            <div className="container mx-auto px-6 flex items-center justify-between relative z-10">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                        <Network className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
                        {SITE_CONFIG.name}
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <NavDropdown label="Features" items={featuresDropdown} currentPage={currentPage} />
                    <NavDropdown label="Resources" items={resourcesDropdown} currentPage={currentPage} />
                    <Link
                        href="/pricing"
                        className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${currentPage === 'pricing' ? 'text-indigo-600 dark:text-indigo-400' : ''
                            }`}
                    >
                        Pricing
                    </Link>
                    <Link
                        href="/blog"
                        className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${currentPage === 'blog' ? 'text-indigo-600 dark:text-indigo-400' : ''
                            }`}
                    >
                        Blog
                    </Link>
                    <Link
                        href="/about"
                        className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${currentPage === 'about' ? 'text-indigo-600 dark:text-indigo-400' : ''
                            }`}
                    >
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden sm:block">
                        <CTAButton variant="ghost" size="default">
                            Sign in
                        </CTAButton>
                    </Link>
                    <Link href="/signup">
                        <CTAButton variant="primary" size="default" className="px-6">
                            Get Started
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </CTAButton>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-slate-600 dark:text-slate-400"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
                {/* Background pattern for mobile menu */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/3 via-transparent to-violet-500/3 opacity-50" />
                <div className="absolute inset-0 bg-journal-pattern opacity-10" />
                <nav className="container mx-auto px-6 py-8 flex flex-col gap-4 relative z-10">
                    {/* Features Section */}
                    <div className="text-xs font-bold uppercase text-slate-400 mb-1">Features</div>
                    <Link href="/features/ai-quiz" className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2" onClick={() => setMobileMenuOpen(false)}>AI Quiz Generator</Link>
                    <Link href="/features/journals" className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2" onClick={() => setMobileMenuOpen(false)}>Learning Journals</Link>
                    <Link href="/features/trail-branching" className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2" onClick={() => setMobileMenuOpen(false)}>Trail Branching</Link>

                    {/* Resources Section */}
                    <div className="text-xs font-bold uppercase text-slate-400 mb-1 mt-4">Resources</div>
                    <Link href="/learn" className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2" onClick={() => setMobileMenuOpen(false)}>Learn Topics</Link>
                    <Link href="/resources" className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2" onClick={() => setMobileMenuOpen(false)}>Templates</Link>
                    <Link href="/for-students" className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2" onClick={() => setMobileMenuOpen(false)}>For Students</Link>
                    <Link href="/for-researchers" className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2" onClick={() => setMobileMenuOpen(false)}>For Researchers</Link>
                    <Link href="/testimonials" className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
                    <Link href="/updates" className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 pl-2" onClick={() => setMobileMenuOpen(false)}>Updates</Link>

                    {/* Main Links */}
                    <div className="border-t border-slate-200 dark:border-slate-700 my-4 pt-4">
                        <Link href="/pricing" className="block text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                        <Link href="/blog" className="block text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                        <Link href="/about" className="block text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4" onClick={() => setMobileMenuOpen(false)}>About</Link>
                        <Link href="/login" className="block text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                    </div>

                    <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 h-12 text-lg font-bold">Start Learning</Button>
                </nav>
            </div>
        </header>
    )
}
