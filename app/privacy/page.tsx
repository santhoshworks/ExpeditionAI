import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { Metadata } from "next"
import { generateSEOMetadata } from "@/lib/seo"

export const metadata: Metadata = generateSEOMetadata({
    title: "Privacy Policy - ThoughtMap",
    description: "Learn how ThoughtMap protects your data and privacy. Our policy covers data collection, usage, security, and your rights as a user.",
    keywords: [
        "privacy policy",
        "data protection",
        "GDPR compliance",
        "user privacy",
        "data security",
        "privacy rights",
        "CCPA compliance",
        "personal information",
        "learning platform privacy",
        "AI learning privacy"
    ],
    url: "/privacy"
})

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
                            ThoughtMap Technologies Inc. (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;ThoughtMap&quot;) is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered learning platform and related services (collectively, the &quot;Service&quot;).
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            This Privacy Policy applies to all users of our Service and should be read in conjunction with our Terms of Service. By using our Service, you consent to the data practices described in this policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">2.1 Information You Provide Directly</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li><strong>Account Information:</strong> Name, email address, username, password, and profile information</li>
                                    <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely by third-party payment processors)</li>
                                    <li><strong>Learning Content:</strong> Topics you explore, questions you ask, learning expeditions you create, notes, and journal entries</li>
                                    <li><strong>Communications:</strong> Messages you send to us, feedback, support requests, and survey responses</li>
                                    <li><strong>API Keys:</strong> If you use our &quot;Bring Your Own Key&quot; (BYOK) plan, we securely store your encrypted API keys for third-party AI services</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">2.2 Information Collected Automatically</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li><strong>Usage Data:</strong> How you interact with our Service, features used, time spent, click patterns, and navigation paths</li>
                                    <li><strong>Device Information:</strong> Device type, operating system, browser type and version, screen resolution, and device identifiers</li>
                                    <li><strong>Technical Data:</strong> IP address, location data (general geographic area), connection information, and performance metrics</li>
                                    <li><strong>Cookies and Tracking:</strong> Session cookies, preference cookies, analytics cookies, and similar tracking technologies</li>
                                    <li><strong>Log Data:</strong> Server logs, error reports, and security-related information</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">2.3 Information from Third Parties</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li><strong>Authentication Providers:</strong> Information from social login services (if used)</li>
                                    <li><strong>Payment Processors:</strong> Transaction status and payment verification data</li>
                                    <li><strong>Analytics Services:</strong> Aggregated usage statistics and performance data</li>
                                    <li><strong>AI Model Providers:</strong> Usage metrics and API response data (anonymized)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">3.1 Service Provision</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Provide, operate, and maintain our AI learning platform</li>
                                    <li>Process your learning queries and generate AI responses</li>
                                    <li>Create and manage your learning expeditions and knowledge maps</li>
                                    <li>Generate personalized learning recommendations and insights</li>
                                    <li>Enable PDF exports and content sharing features</li>
                                    <li>Provide customer support and respond to your inquiries</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">3.2 Account and Subscription Management</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Create and manage your user account</li>
                                    <li>Process payments and manage subscriptions</li>
                                    <li>Send transactional emails and service notifications</li>
                                    <li>Enforce usage limits and subscription terms</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">3.3 Service Improvement and Analytics</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Analyze usage patterns to improve our Service</li>
                                    <li>Develop new features and enhance existing functionality</li>
                                    <li>Monitor service performance and troubleshoot issues</li>
                                    <li>Conduct research and analytics (using aggregated, anonymized data)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">3.4 Security and Legal Compliance</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Protect against fraud, abuse, and security threats</li>
                                    <li>Enforce our Terms of Service and policies</li>
                                    <li>Comply with legal obligations and regulatory requirements</li>
                                    <li>Respond to legal requests and prevent illegal activities</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">3.5 Marketing and Communications (With Consent)</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Send promotional emails and product updates (opt-in only)</li>
                                    <li>Provide educational content and learning tips</li>
                                    <li>Conduct surveys and gather feedback</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:
                            </p>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">4.1 Service Providers</h3>
                                <p className="text-muted-foreground leading-relaxed mb-2">We share information with trusted third-party service providers who assist us in operating our Service:</p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li><strong>AI Model Providers:</strong> OpenRouter and other AI services (query data only, not personal information)</li>
                                    <li><strong>Cloud Infrastructure:</strong> Supabase, Vercel, and other hosting providers</li>
                                    <li><strong>Payment Processors:</strong> Stripe and other payment services</li>
                                    <li><strong>Analytics Services:</strong> Vercel Analytics and similar services (anonymized data only)</li>
                                    <li><strong>Email Services:</strong> For transactional and marketing emails (with consent)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">4.2 Legal Requirements</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety, or that of our users or the public.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">4.3 Business Transfers</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, subject to the same privacy protections.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">4.4 Aggregated Data</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We may share aggregated, anonymized data that cannot identify individual users for research, analytics, or business purposes.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                We implement industry-standard security measures to protect your personal information:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Encryption:</strong> Data is encrypted in transit (TLS/SSL) and at rest</li>
                                <li><strong>Access Controls:</strong> Strict access controls and authentication requirements</li>
                                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                                <li><strong>Secure Infrastructure:</strong> Use of reputable cloud providers with security certifications</li>
                                <li><strong>Data Minimization:</strong> We collect and retain only necessary information</li>
                                <li><strong>Employee Training:</strong> Regular security training for all team members</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">6.1 Account Data</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    We retain your account information and learning data as long as your account is active or as needed to provide our Service.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">6.2 Deleted Accounts</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    When you delete your account, we will delete your personal information within 30 days, except where retention is required by law or for legitimate business purposes (such as fraud prevention).
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">6.3 Backup and Recovery</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Some information may persist in backup systems for up to 90 days after deletion for disaster recovery purposes.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Your Privacy Rights</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                Depending on your location, you may have the following rights regarding your personal information:
                            </p>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">7.1 Access and Portability</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Request access to your personal information</li>
                                    <li>Receive a copy of your data in a portable format</li>
                                    <li>Export your learning expeditions and journals</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">7.2 Correction and Updates</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Correct inaccurate personal information</li>
                                    <li>Update your account information and preferences</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">7.3 Deletion</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Delete your account and associated data</li>
                                    <li>Request deletion of specific information (subject to legal requirements)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">7.4 Marketing Communications</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li>Opt out of marketing emails at any time</li>
                                    <li>Manage your communication preferences</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">7.5 Exercising Your Rights</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    To exercise these rights, contact us at privacy@thoughtmap.space or use the privacy controls in your account settings. We will respond to your request within 30 days.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                We use cookies and similar technologies to enhance your experience and analyze usage:
                            </p>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">8.1 Types of Cookies</h3>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                    <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
                                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                                    <li><strong>Analytics Cookies:</strong> Help us understand how you use our Service</li>
                                    <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">8.2 Cookie Management</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    You can control cookies through your browser settings or our cookie preference center. Note that disabling certain cookies may affect Service functionality.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our Service is operated from the United States, and your information may be transferred to, stored, and processed in the United States and other countries. We ensure appropriate safeguards are in place for international transfers, including standard contractual clauses and adequacy decisions where applicable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Children&apos;s Privacy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                        </p>
                    </section>

                    <section className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-900">
                        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-400">AI Data Processing Disclosure</h3>
                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-3">
                            <p><strong>Important Information About AI Processing:</strong></p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Your learning queries are processed by third-party AI models through services like OpenRouter</li>
                                <li>We do not use your personal data to train our own AI models</li>
                                <li>Third-party AI providers may have their own data handling policies</li>
                                <li>We recommend avoiding sensitive personal information in your learning queries</li>
                                <li>AI-generated content may be inaccurate and should be independently verified</li>
                                <li>Your learning conversations are stored to provide continuity and improve your experience</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. California Privacy Rights (CCPA)</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Right to know what personal information we collect and how it&apos;s used</li>
                                <li>Right to delete personal information (subject to exceptions)</li>
                                <li>Right to opt out of the sale of personal information (we do not sell personal information)</li>
                                <li>Right to non-discrimination for exercising your privacy rights</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                To exercise these rights, contact us at privacy@thoughtmap.space with &quot;California Privacy Request&quot; in the subject line.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">12. European Privacy Rights (GDPR)</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Right of access to your personal data</li>
                                <li>Right to rectification of inaccurate data</li>
                                <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
                                <li>Right to restrict processing</li>
                                <li>Right to data portability</li>
                                <li>Right to object to processing</li>
                                <li>Right to withdraw consent</li>
                            </ul>
                            <p className="text-muted-foreground leading-relaxed mt-4">
                                You also have the right to lodge a complaint with your local data protection authority.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">13. Changes to This Privacy Policy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by email or through our Service at least 30 days before the changes take effect. Your continued use of our Service after the effective date constitutes acceptance of the updated Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="text-muted-foreground"><strong>Email:</strong> privacy@thoughtmap.space</p>
                                <p className="text-muted-foreground"><strong>Subject Line:</strong> Privacy Policy Inquiry</p>
                                <p className="text-muted-foreground"><strong>Response Time:</strong> We will respond within 30 days</p>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                For general support inquiries, please use our regular support channels available through your account dashboard.
                            </p>
                        </div>
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
