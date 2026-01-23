import Link from "next/link"
import { Network } from "lucide-react"
import { SITE_CONFIG } from "@/lib/config"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Logo */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Network className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            {SITE_CONFIG.name}
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
}
