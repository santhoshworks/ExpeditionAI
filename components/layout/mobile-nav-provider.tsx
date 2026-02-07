"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface MobileNavContextType {
  currentExpeditionId: string | null
  setCurrentExpeditionId: (id: string | null) => void
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined)

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [currentExpeditionId, setCurrentExpeditionId] = useState<string | null>(null)

  return (
    <MobileNavContext.Provider value={{ currentExpeditionId, setCurrentExpeditionId }}>
      {children}
    </MobileNavContext.Provider>
  )
}

export function useMobileNav() {
  const context = useContext(MobileNavContext)
  if (context === undefined) {
    throw new Error("useMobileNav must be used within a MobileNavProvider")
  }
  return context
}
