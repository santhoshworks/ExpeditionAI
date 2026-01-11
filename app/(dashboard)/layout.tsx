import { Topbar } from "@/components/layout/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Topbar />
      <main className="flex-1 w-full relative overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
