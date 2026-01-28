"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"

interface FAQItem {
    question: string
    answer: string
}

interface FAQContentProps {
    faqData: FAQItem[]
}

export function FAQContent({ faqData }: FAQContentProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Dynamic Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50" />
            <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <PublicHeader currentPage="faq" />

            <main className="container mx-auto px-6 py-16 max-w-3xl pt-32">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-slate-900">Frequently Asked Questions</h1>
                    <p className="text-xl text-slate-600">
                        Everything you need to know about navigating ThoughtMap
                    </p>
                </div>

                <section className="space-y-4">
                    {faqData.map((faq, index) => (
                        <div key={index} className="border rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:border-indigo-500/20 border-slate-200">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full text-left px-6 py-5 flex items-center justify-between font-medium group"
                            >
                                <span className="group-hover:text-indigo-600 transition-colors text-slate-900">{faq.question}</span>
                                <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`px-6 transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <p className="text-slate-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="mt-20 p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 text-center space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900">Still have questions?</h2>
                    <p className="text-slate-600 max-w-md mx-auto">
                        Our team of explorers is here to help you find your way.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700">Contact Support</Button>
                        <Button variant="outline" className="rounded-full px-8 border-slate-300 text-slate-700 hover:bg-slate-100">Join our Discord</Button>
                    </div>
                </section>
            </main>
        </div>
    )
}
