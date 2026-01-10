import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Scale } from "lucide-react"

export default function TermsPage() {
    const lastUpdated = "January 10, 2026"

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
                        <Scale className="h-5 w-5" />
                        <span className="font-bold">Terms of Service</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="space-y-4 mb-12 text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Terms of Service</h1>
                    <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using ExplorerAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. These terms apply to all visitors, users, and others who access or use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Use of Service</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            ExplorerAI is a learning tool. You are responsible for any content you generate or trails you create. You agree not to use the service for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                            <li>Illegal or unauthorized purposes.</li>
                            <li>Generating harmful, offensive, or malicious content.</li>
                            <li>Attempting to circumvent any usage limits or security measures.</li>
                            <li>Reverse engineering the application or its underlying algorithms.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Subscriptions and Payments</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Certain features of the Service are available through paid subscription plans. By subscribing, you agree to pay all fees associated with your chosen plan. All payments are non-refundable unless otherwise required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of ExplorerAI and its licensors. User-generated journals and expedition maps belong to the user, provided they comply with these terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            In no event shall ExplorerAI, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of the Service.
                        </p>
                    </section>

                    <section className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-900">
                        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-400">AI Disclaimer</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            ExplorerAI leverages Large Language Models. These models may occasionally produce inaccurate, biased, or hallucinated information. The content generated should be used for educational purposes and should be verified independently for critical tasks.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days&apos; notice before any new terms take effect for significant changes.
                        </p>
                    </section>
                </div>

                <div className="mt-20 border-t pt-10 text-center">
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href="/privacy">Read Privacy Policy</Link>
                    </Button>
                </div>
            </main>
        </div>
    )
}
