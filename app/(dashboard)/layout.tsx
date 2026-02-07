import { Sidebar } from "@/components/layout/sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { MobileNavProvider } from "@/components/layout/mobile-nav-provider"
import { PWAInstallPrompt, OfflineIndicator } from "@/components/pwa"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MobileNavProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar - hidden on mobile */}
        <Sidebar />

        {/* Main content area - add bottom padding for mobile nav */}
        <main className="flex-1 relative overflow-y-auto min-w-0 pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* PWA Components */}
        <PWAInstallPrompt />
        <OfflineIndicator />
      </div>
    </MobileNavProvider>
  )
}
