import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Scale } from "lucide-react"
import { Metadata } from "next"
import { generateSEOMetadata } from "@/lib/seo"

export const metadata: Metadata = generateSEOMetadata({
    title: "Terms of Service - ThoughtMap",
    description: "Read ThoughtMap's Terms of Service. Understand your rights, obligations, and rules for using our AI-powered learning platform.",
    keywords: [
        "terms of service",
        "terms and conditions",
        "user agreement",
        "service terms",
        "usage policy",
        "learning platform terms",
        "AI learning terms",
        "user rights",
        "service agreement"
    ],
    url: "/terms"
})

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
                            By accessing, browsing, or using ThoughtMap (&quot;Service&quot;, &quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) acknowledge that you have read, understood, and agree to be bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy. These Terms constitute a legally binding agreement between you and ThoughtMap Technologies Inc. If you do not agree to these Terms, you must not access or use our Service.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            These Terms apply to all users, including visitors, registered users, subscribers, and any other persons who access or use the Service in any manner.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Eligibility and Account Registration</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">2.1 Age Requirements</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    You must be at least 13 years old to use our Service. If you are between 13 and 18 years old, you may only use the Service with the consent and supervision of a parent or legal guardian who agrees to be bound by these Terms.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">2.2 Account Security</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">2.3 Accurate Information</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    You agree to provide accurate, current, and complete information during registration and to update such information to maintain its accuracy.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use Policy</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                ThoughtMap is an AI-powered learning platform designed for educational and research purposes. You agree to use the Service responsibly and in compliance with all applicable laws and regulations.
                            </p>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">3.1 Prohibited Uses</h3>
                                <p className="text-muted-foreground leading-relaxed mb-2">You agree not to use the Service to:</p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Violate any local, state, national, or international law or regulation</li>
                                    <li>Generate, distribute, or promote harmful, offensive, defamatory, or malicious content</li>
                                    <li>Harass, abuse, or harm another person or group</li>
                                    <li>Impersonate any person or entity or falsely state or misrepresent your affiliation</li>
                                    <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
                                    <li>Circumvent, disable, or interfere with security features or usage limits</li>
                                    <li>Reverse engineer, decompile, or attempt to extract source code</li>
                                    <li>Use automated systems (bots, scrapers) without explicit permission</li>
                                    <li>Transmit viruses, malware, or other harmful code</li>
                                    <li>Collect or harvest personal information of other users</li>
                                    <li>Use the Service for commercial purposes without a commercial license</li>
                                    <li>Generate content that infringes on intellectual property rights</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">3.2 Content Standards</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    All content you create, share, or generate through our Service must comply with our community standards and applicable laws. We reserve the right to remove content that violates these standards.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Subscription Plans and Billing</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">4.1 Subscription Tiers</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We offer various subscription plans with different features and usage limits. Current pricing and features are available on our pricing page and may be updated from time to time.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">4.2 Payment Terms</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Subscription fees are billed in advance on a recurring basis (monthly or annually). You authorize us to charge your payment method for all fees. All fees are non-refundable except as required by law or as explicitly stated in our refund policy.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">4.3 Auto-Renewal and Cancellation</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Subscriptions automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">4.4 Price Changes</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may change subscription prices with 30 days&apos; advance notice. Price changes will take effect at your next billing cycle after the notice period.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">5.1 Our Intellectual Property</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    The Service, including its software, algorithms, user interface, design, trademarks, logos, and all related intellectual property, is owned by ThoughtMap Technologies Inc. and protected by copyright, trademark, and other intellectual property laws.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">5.2 Your Content</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    You retain ownership of content you create using our Service, including learning expeditions, journals, and notes. However, you grant us a limited, non-exclusive license to use, store, and process your content to provide the Service.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">5.3 AI-Generated Content</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Content generated by our AI models in response to your prompts is provided to you under a non-exclusive license. You may use such content in accordance with these Terms, but we make no warranties regarding its accuracy, originality, or fitness for any particular purpose.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data Protection</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our Service, you consent to the collection and use of your information as described in our Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services and Integrations</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                Our Service integrates with third-party services, including AI model providers, payment processors, and analytics services. Your use of these integrated services is subject to their respective terms of service and privacy policies.
                            </p>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">7.1 AI Model Providers</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We use third-party AI models through services like OpenRouter. Your interactions with these models are subject to their terms and data handling practices.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">7.2 Payment Processing</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Payment processing is handled by third-party providers. We do not store your complete payment information on our servers.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Service Availability and Modifications</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">8.1 Service Availability</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We strive to maintain high service availability but do not guarantee uninterrupted access. We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">8.2 Service Modifications</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We reserve the right to modify, update, or discontinue features of the Service at any time. We will provide reasonable notice for significant changes that materially affect your use of the Service.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations of Liability</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">9.1 Service Disclaimer</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">9.2 Limitation of Liability</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THOUGHTMAP, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">9.3 Damage Cap</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Our total liability to you for all claims arising out of or relating to these Terms or the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim, or $100, whichever is greater.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You agree to indemnify, defend, and hold harmless ThoughtMap and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your use of the Service, your violation of these Terms, or your violation of any rights of another party.
                        </p>
                    </section>

                    <section className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-900">
                        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-400">AI Content Disclaimer</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                            <strong>Important Notice:</strong> ThoughtMap utilizes Large Language Models and AI technologies that may occasionally produce inaccurate, biased, incomplete, or fabricated information (&quot;hallucinations&quot;).
                        </p>
                        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc pl-4">
                            <li>AI-generated content should be used for educational and informational purposes only</li>
                            <li>Always verify important information through authoritative sources</li>
                            <li>Do not rely on AI-generated content for critical decisions without independent verification</li>
                            <li>We are not responsible for decisions made based on AI-generated content</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">11.1 Termination by You</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    You may terminate your account at any time by following the account deletion process in your settings or by contacting us.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">11.2 Termination by Us</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may suspend or terminate your account immediately if you violate these Terms, engage in fraudulent activity, or for any other reason at our sole discretion.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">11.3 Effect of Termination</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Upon termination, your right to use the Service ceases immediately. We may delete your account and data, though some information may be retained as required by law or for legitimate business purposes.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">12.1 Governing Law</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to conflict of law principles.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">12.2 Dispute Resolution Process</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Before filing any legal action, you agree to first contact us to attempt to resolve the dispute informally. If we cannot resolve the dispute within 60 days, either party may pursue formal legal remedies.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to modify these Terms at any time. We will provide at least 30 days&apos; advance notice of material changes by email or through the Service. Your continued use of the Service after the effective date of any changes constitutes acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">14. Miscellaneous</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">14.1 Entire Agreement</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    These Terms, together with our Privacy Policy, constitute the entire agreement between you and ThoughtMap regarding the Service.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">14.2 Severability</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">14.3 Contact Information</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    For questions about these Terms, please contact us at legal@thoughtmap.space or through our support channels.
                                </p>
                            </div>
                        </div>
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
