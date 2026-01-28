"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CTAButton } from "@/components/ui/cta-button"
import {
    Network,
    ArrowRight,
    Menu,
    X
} from "lucide-react"
import { SITE_CONFIG } from "@/lib/config"

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
            className={`fixed top-0 w-full z-50 transition-all duration-300 overflow-hidden ${scrolled
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

                <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <Link
                        href="/#features"
                        className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${currentPage === 'home' ? 'text-indigo-600 dark:text-indigo-400' : ''
                            }`}
                    >
                        Features
                    </Link>
                    <Link
                        href="/#methodology"
                        className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${currentPage === 'home' ? 'text-indigo-600 dark:text-indigo-400' : ''
                            }`}
                    >
                        Methodology
                    </Link>
                    <Link
                        href="/about"
                        className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${currentPage === 'about' ? 'text-indigo-600 dark:text-indigo-400' : ''
                            }`}
                    >
                        About
                    </Link>
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
                <nav className="container mx-auto px-6 py-8 flex flex-col gap-6 relative z-10">
                    <Link href="/#features" className="text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                    <Link href="/#methodology" className="text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setMobileMenuOpen(false)}>Methodology</Link>
                    <Link href="/about" className="text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setMobileMenuOpen(false)}>About</Link>
                    <Link href="/pricing" className="text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                    <Link href="/blog" className="text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                    <Link href="/login" className="text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                    <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 h-12 text-lg font-bold">Start Learning</Button>
                </nav>
            </div>
        </header>
    )
}