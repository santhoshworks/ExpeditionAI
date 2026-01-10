import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export default function PrivacyPage() {
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
                        <ShieldCheck className="h-5 w-5" />
                        <span className="font-bold">Privacy Center</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 max-w-3xl">
                <div className="space-y-4 mb-12 text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At ExplorerAI, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information when you use our branching AI learning tool. We are committed to ensuring that your learning experience remains private and secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong>Account Information:</strong> Name, email address, and authentication data provided through Supabase.</li>
                            <li><strong>Expedition Data:</strong> Topics you search for, trails you create, and your interactions with the AI.</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, and device information for security and performance monitoring.</li>
                            <li><strong>API Keys:</strong> If you use the &quot;Bring Your Own Key&quot; (BYOK) plan, we store your OpenRouter keys encrypted.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We use your data to provide, maintain, and improve our services, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                            <li>Personalizing your learning expeditions.</li>
                            <li>Generating summaries and insights in your Journal.</li>
                            <li>Processing payments through our third-party providers.</li>
                            <li>Ensuring the security and integrity of our platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We retain your expedition and account data as long as your account is active. You can delete your expeditions or your entire account at any time through the Settings page, which will permanently remove your data from our active databases.
                        </p>
                    </section>

                    <section className="bg-muted p-6 rounded-2xl border border-border">
                        <h3 className="text-lg font-semibold mb-2">AI Disclosure</h3>
                        <p className="text-sm text-muted-foreground">
                            ExplorerAI uses third-party LLM providers (via OpenRouter) to process your queries. While we do not use your data to train our own models, the underlying AI providers may have their own data handling policies. We recommend avoiding the input of sensitive personal information into the chat.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact our privacy team at <a href="mailto:privacy@explorerai.com" className="text-primary hover:underline">privacy@explorerai.com</a>.
                        </p>
                    </section>
                </div>

                <div className="mt-20 border-t pt-10 text-center">
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href="/terms">Read Terms of Service</Link>
                    </Button>
                </div>
            </main>
        </div>
    )
}
