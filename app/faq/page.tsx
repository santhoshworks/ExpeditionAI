"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react"

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
        <div className="min-h-screen bg-background">
            <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2 text-primary">
                        <HelpCircle className="h-5 w-5" />
                        <span className="font-bold">Help Center</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Frequently Asked Questions</h1>
                    <p className="text-xl text-muted-foreground">
                        Everything you need to know about navigating ExplorerAI
                    </p>
                </div>

                <section className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border rounded-2xl overflow-hidden bg-card shadow-sm transition-all hover:border-primary/20">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full text-left px-6 py-5 flex items-center justify-between font-medium group"
                            >
                                <span className="group-hover:text-primary transition-colors">{faq.question}</span>
                                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`px-6 transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <p className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="mt-20 p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center space-y-6">
                    <h2 className="text-2xl font-bold">Still have questions?</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Our team of explorers is here to help you find your way.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="rounded-full px-8">Contact Support</Button>
                        <Button variant="outline" className="rounded-full px-8">Join our Discord</Button>
                    </div>
                </section>
            </main>
        </div>
    )
}
