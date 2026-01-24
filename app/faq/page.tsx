"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react"
import { PublicHeader } from "@/components/layout/public-header"

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        {
            question: "What is an Expedition?",
            answer: "An expedition is a structured learning journey dedicated to a single main topic. It acts as a container for all your trails, messages, and visualizations related to that subject."
        },
        {
            question: "How do Trails work?",
            answer: "Trails are separate conversation branches. When you're learning about a topic and see a sub-concept you want to dive deeper into, you can highlight it to 'Explore' and start a new Trail. This keeps your main conversation organized while allowing for deep dives."
        },
        {
            question: "Which AI models can I use?",
            answer: "ExplorerAI integrates with OpenRouter, giving you access to over 300 models including Claude 3.5, GPT-4o, Llama 3, and more. Depending on your plan, you can switch between models mid-expedition."
        },
        {
            question: "What is the Learning Journal?",
            answer: "The Journal is an AI-generated summary of everything you've learned during your expedition. It synthesizes information from all your active trails into a clean, exportable document."
        },
        {
            question: "How do I use my own API keys (BYOK)?",
            answer: "On our BYOK or Pro plans, you can enter your own OpenRouter API key in the Settings. This allows you to pay only for the tokens you use directly to the provider."
        },
        {
            question: "Can I export my data?",
            answer: "Yes! You can export your Learning Journal as PDF or Markdown. We are also working on features to export your expedition map as an image."
        }
    ]

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
                        Everything you need to know about navigating ExplorerAI
                    </p>
                </div>

                <section className="space-y-4">
                    {faqs.map((faq, index) => (
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
