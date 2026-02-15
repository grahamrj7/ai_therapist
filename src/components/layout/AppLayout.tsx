import { useState } from "react"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { Header } from "./Header"
import { cn } from "@/lib/utils"
import type { Session } from "@/types"

interface UserInfo {
  displayName: string | null
  email: string | null
  photoURL: string | null
}

interface AppLayoutProps {
  children: React.ReactNode
  sessions: Session[]
  currentSessionId: string
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  headerSubtitle?: string
  user?: UserInfo | null
  onSignOut?: () => void
  onSignIn?: () => void
  onSettingsClick?: () => void
  therapistName?: string
}

export function AppLayout({
  children,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  headerSubtitle,
  user,
  onSignOut,
  onSignIn,
  onSettingsClick,
  therapistName,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          onSelectSession(id)
          setSidebarOpen(false)
        }}
        onNewSession={() => {
          onNewSession()
          setSidebarOpen(false)
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onSignOut={onSignOut}
        onSignIn={onSignIn}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-cream">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onSettingsClick={onSettingsClick}
          subtitle={headerSubtitle}
          therapistName={therapistName}
        />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
